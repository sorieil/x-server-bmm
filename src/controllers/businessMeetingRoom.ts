import { Business } from './../entity/mysql/entities/MysqlBusiness';
import { Admin } from './../entity/mysql/entities/MysqlAdmin';
import { getManager, Repository, Entity, AdvancedConsoleLogger } from 'typeorm';
import { Request, Response, arguments, NextFunction } from 'express';
import { RequestRole, responseJson, tryCatch } from '../util/common';
import { BusinessMeetingRoom } from '../entity/mysql/entities/MysqlBusinessMeetingRoom';
import { ServiceBusiness } from '../service/ServiceBusiness';
import { check, validationResult, param } from 'express-validator';
import { ServiceBusinessMeetingRoom } from '../service/ServiceBusinessMeetingRoom';

const apiPost = [
    [
        param('businessId').custom(async (value, { req }) => {
            const businessQuery = await new ServiceBusiness().permissionBusiness(value);
            // console.log('businessQuery:', businessQuery, req.user.admin[0].id);
            if (businessQuery.length === 0) {
                return Promise.reject('First insert business information.');
            } else {
                console.log(businessQuery[0].admin.id, req.user.admin[0].id);
                if (businessQuery[0].admin.id !== req.user.admin[0].id) {
                    return Promise.reject('You don`t have permission.');
                }
            }
        }),
        check('name')
            .not()
            .isEmpty(),
        check('location')
            .not()
            .isEmpty(),
    ],
    async (req: Request, res: Response) => {
        try {
            // common
            const errors = validationResult(req);
            const method: RequestRole = req.method.toString() as any;
            const businessId = req.params.businessId;
            const service = new ServiceBusinessMeetingRoom();

            if (!errors.isEmpty()) {
                responseJson(res, errors.array(), method, 'invalid');
                return;
            }

            const meetingRoom = new BusinessMeetingRoom();

            const meetingRoomId = req.params.meetingRoomId;

            // 수정
            if (meetingRoomId && method === 'PATCH') {
                // 여기에서 수정이 가능한지 체크 한다.
                meetingRoom.id = Number(meetingRoomId);
                const permissionBusinessMeetingRoomQuery = await service.permissionBusinessMeetingRoom(
                    req.user.admin[0],
                    meetingRoom,
                );

                console.log('================================');
                console.log(permissionBusinessMeetingRoomQuery);
                if (permissionBusinessMeetingRoomQuery.length === 0) {
                    responseJson(res, [{ message: '권한이 없습니다.' }], method, 'invalid');
                    return;
                }
            }

            meetingRoom.business = businessId;
            meetingRoom.name = req.body.name;
            meetingRoom.location = req.body.location;
            meetingRoom.sort = req.body.sort;

            // console.log('meeting room:', meetingRoom);

            const queryMeetingRoom = await service.saveMeetingRoom(meetingRoom);
            responseJson(res, [queryMeetingRoom], method, 'success');
        } catch (error) {
            tryCatch(res, error);
        }
    },
];

const apiGet = [
    [
        param('businessId').custom(async (value, { req }) => {
            const businessQuery = await new ServiceBusiness().permissionBusiness(value);
            // console.log('businessQuery:', businessQuery.length, '===', req.user.admin[0].id);
            if (businessQuery.length === 0) {
                return Promise.reject('First insert business information.');
            } else {
                if (businessQuery[0].admin.id !== req.user.admin[0].id) {
                    return Promise.reject('You don`t have permission.');
                }
            }
        }),
    ],
    async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req);
            const method: RequestRole = req.method.toString() as any;
            const business: Business = (new Business().id = req.params.businessId);
            const service = new ServiceBusinessMeetingRoom();

            if (!errors.isEmpty()) {
                responseJson(res, errors.array(), method, 'invalid');
                return;
            }

            const queryMeetingRoom = await service.getMeetingRoom(business);
            responseJson(res, queryMeetingRoom, method, 'success');
        } catch (error) {
            tryCatch(res, error);
        }
    },
];

const apiDelete = [
    async (req: Request, res: Response) => {
        try {
            const method: RequestRole = req.method.toString() as any;
            const businessId = req.params.businessId;
            const meetingRoomId = req.params.meetingRoomId;
            const service = new ServiceBusinessMeetingRoom();

            const query = await service.deleteMeetingRoom(meetingRoomId, req.user.admin);
            responseJson(res, query, method, 'success');
        } catch (error) {
            tryCatch(res, error);
        }
    },
];

export default {
    apiGet,
    apiPost,
    apiDelete,
};
