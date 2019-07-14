import { Business } from '../../entity/mysql/entities/MysqlBusiness';
import { Admin } from '../../entity/mysql/entities/MysqlAdmin';
import { getManager, Repository, Entity, AdvancedConsoleLogger } from 'typeorm';
import { Request, Response, arguments, NextFunction } from 'express';
import { RequestRole, responseJson, tryCatch } from '../../util/common';
import { BusinessMeetingRoom } from '../../entity/mysql/entities/MysqlBusinessMeetingRoom';
import { ServiceBusiness } from '../../service/ServiceBusiness';
import { check, validationResult, param } from 'express-validator';
import { ServiceBusinessMeetingRoom } from '../../service/ServiceBusinessMeetingRoom';
import { businessPermission } from '../../util/permission';

/**
 * Post/update Business meeting room
 */
const apiPost = [
    [
        businessPermission.apply(this),
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
            const method: RequestRole = req.method.toString() as any;
            const businessId = req.params.businessId;
            const service = new ServiceBusinessMeetingRoom();
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                responseJson(res, errors.array(), method, 'invalid');
                return;
            }

            const meetingRoom = new BusinessMeetingRoom();

            const meetingRoomId = req.params.meetingRoomId;

            // 수정
            if (meetingRoomId && method === 'PATCH') {
                // 여기에서 수정이 가능한지 체크 한다. 권한이 있으면. 입력된 MeetingRoomId 를 설정해준다.
                meetingRoom.id = Number(meetingRoomId);
                const permissionBusinessMeetingRoomQuery = await service.permissionBusinessMeetingRoom(
                    req.user.admins[0],
                    meetingRoom,
                );

                if (permissionBusinessMeetingRoomQuery.length === 0) {
                    responseJson(res, [{ message: '권한이 없습니다.' }], method, 'invalid');
                    return;
                }
            }

            meetingRoom.business = businessId;
            meetingRoom.name = req.body.name;
            meetingRoom.location = req.body.location;
            meetingRoom.sort = req.body.sort;

            const queryMeetingRoom = await service.post(meetingRoom);
            responseJson(res, [queryMeetingRoom], method, 'success');
        } catch (error) {
            tryCatch(res, error);
        }
    },
];
/**
 * Get business meeting room lists
 */
const apiGet = [
    [businessPermission.apply(this)],
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

            const queryMeetingRoom = await service.get(business);
            responseJson(res, queryMeetingRoom, method, 'success');
        } catch (error) {
            tryCatch(res, error);
        }
    },
];
/**
 * Delete business meeting room
 */
const apiDelete = [
    [
        // Check permission by meeting room id, admin id.
        param('meetingRoomId').custom(async (value, { req }) => {
            const meetingRoom = new BusinessMeetingRoom();

            meetingRoom.id = Number(value);
            const permissionBusinessMeetingRoomQuery = await new ServiceBusinessMeetingRoom().permissionBusinessMeetingRoom(
                req.user.admins[0],
                meetingRoom,
            );

            if (permissionBusinessMeetingRoomQuery.length === 0) {
                return Promise.reject('First insert business information.');
            } else {
                if (permissionBusinessMeetingRoomQuery.length === 0) {
                    return Promise.reject('You don`t have permission.');
                    return;
                }
            }
        }),
        // Check business permission.
        param('businessId').custom(async (value, { req }) => {
            const businessQuery = await new ServiceBusiness().permissionBusiness(value);
            if (businessQuery.length === 0) {
                return Promise.reject('First insert business information.');
            } else {
                if (businessQuery[0].admin.id !== req.user.admins[0].id) {
                    return Promise.reject('You don`t have permission.');
                }
            }
        }),
    ],
    async (req: Request, res: Response) => {
        try {
            const method: RequestRole = req.method.toString() as any;
            const businessId = req.params.businessId;
            const meetingRoomId = req.params.meetingRoomId;
            const service = new ServiceBusinessMeetingRoom();
            const meetingRoom = new BusinessMeetingRoom();

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                responseJson(res, errors.array(), method, 'invalid');
                return;
            }

            meetingRoom.id = meetingRoomId;

            const query = await service.delete(meetingRoom);
            if (typeof query.id === 'undefined') {
                responseJson(res, [{ message: `${meetingRoomId} is deleted.` }], method, 'success');
            } else {
                responseJson(res, [new Array(1)], method, 'success');
            }
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
