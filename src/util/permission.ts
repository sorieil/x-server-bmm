import { param } from 'express-validator';
import { ServiceBusinessPermission } from '../service/ServiceBusinessPermission';
import { Admin } from '../entity/mysql/entities/MysqlAdmin';
import { Business } from '../entity/mysql/entities/MysqlBusiness';
import { Login } from '../entity/mysql/entities/MysqlLogin';
import ServiceUserPermission from '../service/ServiceUserPermission';
import { User } from '../entity/mysql/entities/MysqlUser';
import { BusinessMeetingRoom } from '../entity/mysql/entities/MysqlBusinessMeetingRoom';
import { ServiceBusinessMeetingRoom } from '../service/ServiceBusinessMeetingRoom';
import ServiceUserBuyerPermission from '../service/ServiceUserBuyerPermission';
import { BusinessVendor } from '../entity/mysql/entities/MysqlBusinessVendor';

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
export const CheckPermissionBusinessAdmin = () => {
  return param('permission').custom((value, { req }) => {
    const admin = req.user.admins[0]; // passport 에서 주입한다.
    const query = new ServiceBusinessPermission()._getBusinessByAdmin(admin);
    return query.then((businessResult: Business) => {
      if (businessResult) {
        Object.assign(req.user, { business: businessResult });
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
export const CheckPermissionGetUserData = () => {
  return param('loginData').custom((value, { req }) => {
    const login = new Login();
    login.id = req.user.id; // passport 에서 주입 한다.
    const query = new ServiceUserPermission()._byLogin(login);
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
export const CheckPermissionAdminBusinessVendor = () =>
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
      const query = await service._getWithBusinessVendor(
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
export const CheckPermissionBusinessMeetingRoomById = () =>
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
        return Promise.reject('You are not authorized or have no data.');
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
export const CheckPermissionBuyerInformation = () =>
  param('userId').custom((value, { req }) => {
    const service = new ServiceUserBuyerPermission();
    const user = req.user;

    // 여기에서 굳이 프로미스를 사용한 이유는 통일성을 가져가기 위해서이다.
    return new Promise(async resolve => {
      const query = await service._getByUser(user);
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
