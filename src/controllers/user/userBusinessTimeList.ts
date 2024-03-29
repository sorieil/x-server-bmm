import { BusinessVendorManager } from './../../entity/mysql/entities/MysqlBusinessVendorManager';
import { BusinessVendor } from '../../entity/mysql/entities/MysqlBusinessVendor';
import { BusinessMeetingTimeList } from './../../entity/mysql/entities/MysqlBusinessMeetingTimeList';
import { Request, Response } from 'express';
import { RequestRole, responseJson, tryCatch } from '../../util/common';
import { validationResult, param, query } from 'express-validator';
import { CheckPermissionGetUserDataForUser } from '../../util/permission';
import moment = require('moment');
import ServiceUserBusinessTime from '../../service/ServiceUserBusinessTime';
import { User } from '../../entity/mysql/entities/MysqlUser';
import UserBuyer from '../../entity/mysql/entities/MysqlUserBuyer';
import ServiceUserManager from '../../service/ServiceUserManager';
import { ServiceBusinessMeetingRoom } from '../../service/ServiceBusinessMeetingRoom';
import { Business } from '../../entity/mysql/entities/MysqlBusiness';

/**
 * @description
 * 날짜 별로 타임 리스트를 가져온다.
 * 중요한 내용은 유저의 타입을 구분지어 바이어와, 밴더 매니저를 분기를 태워서 데이터를 가져와야 한다.
 * @data 2019-01-02 식으로 데이터를 넣는다.
 */
const apiGet = [
    [
        CheckPermissionGetUserDataForUser.apply(this),
        param('date').custom((value, { req }) => {
            const dateValid = moment(value).format('YYYY-MM-DD');
            if (dateValid === 'Invalid date') {
                return Promise.reject('Please input date format.');
            } else {
                return Promise.resolve(true);
            }
        }),
    ],
    async (req: Request, res: Response) => {
        try {
            const method: RequestRole = req.method.toString() as any;
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                responseJson(res, errors.array(), method, 'invalid');
                return;
            }
            const serviceUserBusinessTime = new ServiceUserBusinessTime();
            const serviceUserManager = new ServiceUserManager();
            const serviceBusinessMeetingRoom = new ServiceBusinessMeetingRoom();
            const business = new Business();
            const businessMeetingTimeList = new BusinessMeetingTimeList();
            business.id = req.user.business.id;
            const roomCount = await serviceBusinessMeetingRoom.gets(business);

            businessMeetingTimeList.dateBlock = req.params.date;
            const user = new User();
            user.id = req.user.id;
            let query: any[] = [];
            // buyer
            if (req.user.users[0].type === 'buyer') {
                // 있으면, 바이어
                const userBuyer = new UserBuyer();
                userBuyer.id = req.user.users[0].userBuyer.id;
                console.log(
                    '------------------------------ user business time lists',
                );

                query = await serviceUserBusinessTime._getTimeListByDateBlockForBuyer(
                    userBuyer,
                    businessMeetingTimeList,
                );
                // console.log('UserBUsinessTimeLists:', query);

                query.map((v: any) => {
                    if (v.businessMeetingRoomReservation) {
                        if (
                            v.businessMeetingRoomReservation.length <
                            roomCount.length
                        ) {
                            v.meetingAvailable = true;
                        } else {
                            v.meetingAvailable = false;
                        }
                    } else {
                        v.meetingAvailable = true;
                    }

                    // 회사명
                    if (v.businessMeetingRoomReservation) {
                        v.businessMeetingRoomReservation.businessVendor.businessVendorFieldValues.map(
                            (j: any) => {
                                if (j.businessVendorField.name === '기업명') {
                                    const columnType =
                                        j.businessVendorField.fieldType
                                            .columnType;

                                    if (columnType === 'text') {
                                        v.companyName = j.text || null;
                                    } else if (columnType === 'textarea') {
                                        v.companyName = j.textarea || null;
                                    } else if (columnType === 'idx') {
                                        v.companyName = j.idx || null;
                                    } else {
                                        v.companyName = null;
                                    }
                                }
                            },
                        );
                    } else {
                        v.companyName = null;
                    }

                    return v;
                });
            } else {
                // Manager
                const businessVendorManager = new BusinessVendorManager();
                businessVendorManager.id =
                    req.user.users[0].businessVendorManager.id;
                const businessVendorQuery = await serviceUserManager._getBusinessVendorByBusinessVendorManager(
                    businessVendorManager,
                );

                const businessVendor = new BusinessVendor();
                businessVendor.id = businessVendorQuery.businessVendor.id;

                // 그럼 이 화면은 passport 에서 결정되어야 할거 같은데...
                query = await serviceUserBusinessTime._getTimeListByDateBlockForManger(
                    businessVendor,
                    businessMeetingTimeList,
                );

                // console.log('query:', query);

                query.map((v: any) => {
                    v.userName = '';
                    // 예약한 바이어가 있으면,
                    if (v.businessMeetingRoomReservations.length > 0) {
                        v.meetingAvailable = false;
                        v.userName = '';
                        v.userPhone = '';
                        v.userEmail = '';
                        v.userMemo = '';
                        // console.log(
                        //     'businessMeetingRoomReservations:',
                        //     v.businessMeetingRoomReservations,
                        // );
                        if (
                            v.businessMeetingRoomReservations[0]
                                .userBuyerMeetingTimeList
                        ) {
                            console.log(
                                v.businessMeetingRoomReservations[0]
                                    .userBuyerMeetingTimeList.userBuyer,
                            );
                            v.userName =
                                v.businessMeetingRoomReservations[0].userBuyerMeetingTimeList.userBuyer.name;
                            v.userPhone =
                                v.businessMeetingRoomReservations[0].userBuyerMeetingTimeList.userBuyer.phone;

                            v.userEmail =
                                v.businessMeetingRoomReservations[0].userBuyerMeetingTimeList.userBuyer.phone;
                            v.userMemo =
                                v.businessMeetingRoomReservations[0].memo;
                        }
                    } else {
                        if (v.use === 'yes') {
                            v.meetingAvailable = true;
                        } else {
                            v.meetingAvailable = false;
                        }
                    }

                    return v;
                });
            }

            responseJson(res, query, method, 'success');
        } catch (error) {
            tryCatch(res, error);
        }
    },
];

const apiGetByVendor = [
    [
        CheckPermissionGetUserDataForUser.apply(this),
        param('date').custom((value, { req }) => {
            const dateValid = moment(value).format('YYYY-MM-DD');
            // console.log('test result:', dateValid);
            if (dateValid === 'Invalid date') {
                return Promise.reject('Please input date format.');
            } else {
                return Promise.resolve(true);
            }
        }),
        param('vendorId')
            .not()
            .isEmpty(),
    ],
    async (req: Request, res: Response) => {
        try {
            const method: RequestRole = req.method.toString() as any;
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                responseJson(res, errors.array(), method, 'invalid');
                return;
            }
            const serviceUserBusinessTime = new ServiceUserBusinessTime();
            const businessMeetingTimeList = new BusinessMeetingTimeList();
            const businessVendor = new BusinessVendor();
            const searchDate = req.params.date;
            const business = new Business();
            business.id = req.user.business.id;
            businessVendor.id = Number(req.params.vendorId);

            businessMeetingTimeList.dateBlock = searchDate;

            // 밴더 정보로 타임 리스트를 가져온다.
            const query = await serviceUserBusinessTime._getTimeListByDateBlockForAllBuyer(
                businessVendor,
                businessMeetingTimeList,
            );
            const serviceBusinessMeetingRoom = new ServiceBusinessMeetingRoom();
            const roomCount = await serviceBusinessMeetingRoom.gets(business);
            console.log(query.length, businessMeetingTimeList);
            query.map((v: any) => {
                if (v.businessMeetingRoomReservations) {
                    if (
                        v.businessMeetingRoomReservations.length <
                        roomCount.length
                    ) {
                        v.meetingAvailable = true;
                    } else {
                        v.meetingAvailable = false;
                    }
                } else {
                    v.meetingAvailable = true;
                }

                // 매니저가 조회 할때 보여줘야 겠지...?
                // // 회사명
                // if (v.businessMeetingRoomReservations) {
                //     v.businessMeetingRoomReservations.businessVendor.businessVendorFieldValues.map(
                //         (j: any) => {
                //             if (j.businessVendorField.name === '기업명') {
                //                 const columnType =
                //                     j.businessVendorField.fieldType.columnType;

                //                 if (columnType === 'text') {
                //                     v.companyName = j.text || null;
                //                 } else if (columnType === 'textarea') {
                //                     v.companyName = j.textarea || null;
                //                 } else if (columnType === 'idx') {
                //                     v.companyName = j.idx || null;
                //                 } else {
                //                     v.companyName = null;
                //                 }
                //             }
                //         },
                //     );
                // } else {
                //     v.companyName = null;
                // }

                return v;
            });

            responseJson(res, query, method, 'success');
        } catch (error) {
            tryCatch(res, error);
        }
    },
];

export default {
    apiGet,
    apiGetByVendor,
};
