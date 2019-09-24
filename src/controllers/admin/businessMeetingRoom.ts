import { ServiceBusinessPermission } from './../../service/ServiceBusinessPermission';
import { Business } from '../../entity/mysql/entities/MysqlBusiness';
import { Admin } from '../../entity/mysql/entities/MysqlAdmin';
import { Request, Response } from 'express';
import { RequestRole, responseJson, tryCatch } from '../../util/common';
import { BusinessMeetingRoom } from '../../entity/mysql/entities/MysqlBusinessMeetingRoom';
import { check, validationResult, param } from 'express-validator';
import { ServiceBusinessMeetingRoom } from '../../service/ServiceBusinessMeetingRoom';
import { businessAdminPermission, adminBusinessMeetingRoomByIdPermission } from '../../util/permission';

/**
 * Post/update Business meeting room
 */
const apiPost = [
    [
        businessAdminPermission.apply(this),
        param('meetingRoomId')
            .optional()
            .isNumeric(),
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
            const business: Business = new Business();
            business.id = req.user.business.id;

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
                meetingRoom.id = Number(meetingRoomId);
                const meetingRoomQuery = await service.get(meetingRoom);
                if (!meetingRoomQuery) {
                    responseJson(
                        res,
                        [
                            {
                                value: meetingRoomId,
                                msg: 'You don`t have permission or first insert meeting room.',
                                param: 'meetingRoomId',
                                location: 'params',
                            },
                        ],
                        method,
                        'invalid',
                    );
                    return;
                }
            }

            meetingRoom.business = business;
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
const apiGets = [
    [businessAdminPermission.apply(this)],
    async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req);
            const method: RequestRole = req.method.toString() as any;
            const service = new ServiceBusinessMeetingRoom();

            if (!errors.isEmpty()) {
                console.log('Meeting room:', errors.array());
                responseJson(res, errors.array(), method, 'invalid');
                return;
            }

            const queryMeetingRoom = await service.gets(req.user.business);
            responseJson(res, queryMeetingRoom, method, 'success');
        } catch (error) {
            tryCatch(res, error);
        }
    },
];

/**
 * Get business meeting room lists
 */
const apiGet = [
    [adminBusinessMeetingRoomByIdPermission.apply(this)],
    async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req);
            const method: RequestRole = req.method.toString() as any;
            const business: Business = (new Business().id = req.user.business.id);
            const service = new ServiceBusinessMeetingRoom();

            if (!errors.isEmpty()) {
                responseJson(res, errors.array(), method, 'invalid');
                return;
            }

            const queryMeetingRoom = await service.get(req.user.meetingRoom);
            responseJson(res, [queryMeetingRoom], method, 'success');
        } catch (error) {
            tryCatch(res, error);
        }
    },
];

/**
 * Delete business meeting room
 */
const apiDelete = [
    [adminBusinessMeetingRoomByIdPermission.apply(this)],
    async (req: Request, res: Response) => {
        try {
            const method: RequestRole = req.method.toString() as any;
            const service = new ServiceBusinessMeetingRoom();
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                responseJson(res, errors.array(), method, 'invalid');
                return;
            }

            console.log('business:', req.user.business);
            console.log('meetingRoom:', req.user.meetingRoom);
            const businessMeetingRoom = (new BusinessMeetingRoom().id = req.user.meetingRoom.id);
            const query = await service.delete(businessMeetingRoom);
            responseJson(res, [query], method, 'delete');
        } catch (error) {
            tryCatch(res, error);
        }
    },
];

export default {
    apiGet,
    apiGets,
    apiPost,
    apiDelete,
};
