import { BusinessEventBridge } from './../entity/mysql/entities/MysqlBusinessEventBridge';
import ServiceBusinessEventBridge from './../service/ServiceBusinessEventBridge';
import { BusinessVendor } from './../entity/mysql/entities/MysqlBusinessVendor';
import { ServiceBusinessPermission } from './../service/ServiceBusinessPermission';
import { param } from 'express-validator';
import { Business } from '../entity/mysql/entities/MysqlBusiness';
import { Login } from '../entity/mysql/entities/MysqlLogin';
import ServiceUserPermission from '../service/ServiceUserPermission';
import { User } from '../entity/mysql/entities/MysqlUser';
import { BusinessMeetingRoom } from '../entity/mysql/entities/MysqlBusinessMeetingRoom';
import { ServiceBusinessMeetingRoom } from '../service/ServiceBusinessMeetingRoom';
import ServiceUserBuyerPermission from '../service/ServiceUserBuyerPermission';

/**
 * @description
 * 관리자의 데이터로 비즈니스를 소유하고 있는지 체크한다. 없으면, BMM 비즈니스 정보를 입력해야 한다.
 * 관리자모드에서 컨테이너>BMM 의 권한을 체크 한다.
 * 로그인을 하게 되면, 기존 몽고디비 Accounts 에서 데이터를 토큰정보 토대로 ObjectID 를 가져오고,
 * 디비에 등록하고, 로그인 정보를 등록하고, 이벤트(비즈니스)를 관련 데이터를 입력하게 되면, 비즈니스 관련
 * 정보를 로그인 할때마다 세션처럼 req.user 오브젝트에 주입한다.
 *
 * @target admin
 */
export const CheckPermissionBusinessForAdmin = () => {
    return param('permission').custom((value, { req }) => {
        const eventId = req.user.eventId;
        const businessEventBridge = new BusinessEventBridge();
        businessEventBridge.eventId = eventId;
        const query = new ServiceBusinessEventBridge().get(businessEventBridge);
        return query.then((businessResult: BusinessEventBridge) => {
            console.log('==================\n');
            console.log(businessResult);
            console.log('==================\n');
            if (businessResult) {
                Object.assign(req.user, { business: businessResult.business });
            } else {
                return Promise.reject(
                    'You don`t have permission or first insert business information..',
                );
            }
        });
    });
};

/**
 * @description
 * 로그인 정보가 정상적으로 등록되어있는지 체크도 하면서 유저의 로그인 데이터를 가져오기도 한다.
 * 로그인 정보로 유저의 정보를 불어오는 함수이다.
 * @target 유저
 */
export const CheckPermissionGetUserDataForUser = () => {
    return param('loginData').custom((value, { req }) => {
        const login = new Login();
        login.id = req.user.id; // passport 에서 주입 한다.
        const query = new ServiceUserPermission()._getUserByLogin(login);
        return query.then((userResult: User) => {
            if (userResult) {
                Object.assign(req.user, { user: userResult });
            } else {
                return Promise.reject(
                    'You don`t have login data or first insert login data.',
                );
            }
        });
    });
};

/**
 * @description
 * 유저의 business 아이디는 이미 xsync 2.0 에서 이벤트 가입이 되어 있기 때문에 그 이벤트 아이디 기준으로 business 아이디를
 * 로그인 하면서 연결을 하는데 만약 연결이 안되어 있다면, 새로 연결 해서 디비에 등록한다.
 * 이 함수는 벤더의 아이디로 유저가 벤더의 아이디로 실제 비즈니스가 벤더를 소유 하는지 체크 하는 함수다.
 *
 * @target 관리자
 * @returns vendor
 */
export const CheckPermissionAdminBusinessVendorForAdmin = () =>
    param('vendorId').custom((value, { req }) => {
        const businessVendor = new BusinessVendor();
        const service = new ServiceUserPermission();
        const business = new Business();

        if (!value) {
            return Promise.reject('Invalid insert data.');
        }

        businessVendor.id = value;
        return new Promise(async resolve => {
            // 비즈니스 퍼미션과 다르게 유저는 비즈니스 아이디가 특정되어 있기 때문에,
            // 관리자 처럼 비즈니스 보유 여부를 체크 할 필요가 없다.
            // 로그인할때 이벤트 아이디로 req.user 에 담겨져 있다. (req.user.business)

            business.id = req.user.business.id;
            const query = await service._getBusinessVendorByBusinessVendorWithBusinessId(
                businessVendor,
                business,
            );
            resolve(query);
        }).then(result => {
            if (result) {
                Object.assign(req.user, { vendor: result });
            } else {
                return Promise.reject('This is no vendor id.');
            }
        });
    });
/**
 * @description
 * 미팅룸을 수정하기 위해서 체크 하는 권한.
 * 체크후 미팅룸 데이터를 반환한다.
 *
 * @target 관리자
 * @returns meetingRoom
 */
export const CheckPermissionBusinessMeetingRoomByIdForAdmin = () =>
    param('meetingRoomId').custom((value, { req }) => {
        const meetingRoom = new BusinessMeetingRoom();
        const business = new Business();
        const admin = req.user.admins[0];

        const businessQuery = new ServiceBusinessPermission()._getBusinessByAdmin(
            admin,
        );
        return businessQuery.then((businessResult: Business) => {
            Object.assign(req.user, { Business: businessResult });
            if (businessResult) {
                meetingRoom.id = Number(value);
                business.id = businessResult.id;
                const meetingRoomQuery = new ServiceBusinessMeetingRoom().getWidthBusiness(
                    meetingRoom,
                    business,
                );
                return meetingRoomQuery.then(
                    (businessMeetingRoomResult: BusinessMeetingRoom) => {
                        if (businessMeetingRoomResult) {
                            return Object.assign(req.user, {
                                meetingRoom: businessMeetingRoomResult,
                            });
                        } else {
                            return Promise.reject(
                                'You are not authorized or already deleted',
                            );
                        }
                    },
                );
            } else {
                return Promise.reject(
                    'You are not authorized or have no data.',
                );
            }
        });
    });

/**
 * @deprecated
 * 여기서부터는 예약인데 buyer의 상세 정보가 있어야지만, 진행이 가능하기 때문에 체크 해야 한다.
 *
 * @target user
 * @returns buyer
 */
export const CheckPermissionBuyerInformationForUser = () =>
    param('userId').custom((value, { req }) => {
        const service = new ServiceUserBuyerPermission();
        const user = req.user;

        // 여기에서 굳이 프로미스를 사용한 이유는 통일성을 가져가기 위해서이다.
        return new Promise(async resolve => {
            const query = await service._getUserBuyerByUser(user);
            // 여기에서 또 다른 로직이 들어 갈 수 있는 여지를 코드 스타일이다.
            resolve(query);
        }).then(result => {
            if (result) {
                Object.assign(req.user, { buyer: result });
            } else {
                return Promise.reject('Please enter buyer information first.');
            }
        });
    });

/**
 * @description
 * 유저가 바이어인지 매니저인지 체크를 한다. 기본값이 null인데 만약 user.type이 아무것도 설정이 안되어 있는 상태라면,
 * 설정하라고 메세지를 보내줘야 한다.
 * @target 유저
 * @returns 유저가 타입을 가지고 있는지 체크한다.
 */
export const CheckPermissionUserTypeForUser = () => {
    return param('userType').custom((value, { req }) => {
        // console.log('Check permission user type:', req.user.users[0].userBuyer);
        if (req.user.users[0].type === 'null') {
            return Promise.reject(
                'You did not have completed user profile. Please complete your profile.',
            );
        }
    });
};

/**
 * @description
 * 유저가 매니저로 등록을 하지 않았다면, 등록되지 않은 유저라고 표현해줘야 한다.
 * @target 유저
 * @returns express-validation
 */
export const CheckPermissionBusienssVendorManagerForUser = () => {
    return param('businessVendorManagerId').custom((value, { req }) => {
        console.log(req.user.users[0]);
        const user = req.user.users[0];
        console.log(
            'CheckPermissionBusienssVendorManagerForUser user :',
            user.businessVendorManager.id,
        );
        if (!user.businessVendorManager.id) {
            return Promise.reject('You are not manager.');
        } else {
            return Promise.resolve(true);
        }
    });
};

/**
 * @description
 * 파라미터로 받은 vendorId 가 존재하는 vendorId 인지 활동중인 비즈니스와 같이 체크 한다.
 * @target 유저
 * @returns express validation
 */
export const CheckPermissionBusinessVendorForUser = () => {
    return param('vendorId').custom(async (value, { req }) => {
        const serviceUserPermission = new ServiceUserPermission();
        const business = req.user.business;
        const businessVendor = new BusinessVendor();
        businessVendor.id = value;
        console.log('business:', req.user.business);
        console.log('businessVendor:', value);
        const query = await serviceUserPermission._getBusinessVendorByBusinessVendorWithBusinessId(
            businessVendor,
            business,
        );

        console.log('vendor id:', query);

        if (!query) {
            return Promise.reject('This vendor id does not exist.');
        }
    });
};
// 여기서부터는 예약인데 buyer의 상세 정보가 있어야지만, 진행이 가능하기 때문에 체크 해야 한다.
const CheckPermissionBuyerInformation = () =>
    param('userId').custom((value, { req }) => {
        const service = new ServiceUserBuyerPermission();
        const user = req.user;

        return new Promise(async resolve => {
            const query = await service._getUserBuyerByUser(user);
            resolve(query);
        }).then(r => {
            if (r) {
                Object.assign(req.user, { buyer: r });
            } else {
                return Promise.reject('Please enter buyer information first.');
            }
        });
    });
