import { ServiceBusinessPermission } from './../../service/ServiceBusinessPermission';
import { Business } from '../../entity/mysql/entities/MysqlBusiness';
import { Admin } from '../../entity/mysql/entities/MysqlAdmin';
import { Request, Response } from 'express';
import { RequestRole, responseJson, tryCatch } from '../../util/common';
import { BusinessMeetingRoom } from '../../entity/mysql/entities/MysqlBusinessMeetingRoom';
import { check, validationResult, param } from 'express-validator';
import { ServiceBusinessMeetingRoom } from '../../service/ServiceBusinessMeetingRoom';
import { businessPermission } from '../../util/permission';

const businessMeetingRoomPermissionById = () =>
    param('meetingRoomId').custom((value, { req }) => {
        const meetingRoom = new BusinessMeetingRoom();
        const business = new Business();
        const admin = new Admin();
        admin.id = req.user.admins[0].id;

        const businessQuery = new ServiceBusinessPermission()._ByAdmin(admin);
        return businessQuery.then((r: Business) => {
            Object.assign(req.user, { Business: r });
            if (r) {
                meetingRoom.id = Number(value);
                business.id = r.id;
                const meetingRoomQuery = new ServiceBusinessMeetingRoom().getWidthBusiness(meetingRoom, business);
                return meetingRoomQuery.then((r1: BusinessMeetingRoom) => {
                    if (r1) {
                        return Object.assign(req.user, { meetingRoom: r1 });
                    } else {
                        return Promise.reject('You are not authorized or already deleted');
                    }
                });
            } else {
                return Promise.reject('You are not authorized or have no data.');
            }
        });
    });
/**
 * Post/update Business meeting room
 */
const apiPost = [
    [
        businessPermission.apply(this),
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
            const business: Business = (new Business().id = req.user.business.id);

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
                if (meetingRoomQuery.length === 0) {
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
    [businessPermission.apply(this)],
    async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req);
            const method: RequestRole = req.method.toString() as any;
            const service = new ServiceBusinessMeetingRoom();

            if (!errors.isEmpty()) {
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
    [businessMeetingRoomPermissionById.apply(this)],
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
    [businessMeetingRoomPermissionById.apply(this)],
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
