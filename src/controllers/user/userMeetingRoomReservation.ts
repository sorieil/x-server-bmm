import { BusinessMeetingTimeList } from './../../entity/mysql/entities/MysqlBusinessMeetingTimeList';
import { Request, Response } from 'express';
import { responseJson, RequestRole } from '../../util/common';
import { validationResult, param } from 'express-validator';
import ServiceUserMeetingRoomReservation from '../../service/ServiceUserMeetingRoomReservation';

const apiPatch = [
    [
        param('reservationId')
            .not()
            .isEmpty()
            .isNumeric(),
    ],
    async (req: Request, res: Response) => {
        const method: RequestRole = req.method.toString() as any;
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            responseJson(res, errors.array(), method, 'invalid');
            return;
        }

        const service = new ServiceUserMeetingRoomReservation();
        const businessMeetingTimeList = new BusinessMeetingTimeList();
        const params = req.params;
        businessMeetingTimeList.id = params.reservationId;
        const query = await service.update(businessMeetingTimeList);
        // 이미 다른 사람이 예약이 되어 있다면, 예약을 못하게 해야 한다.
        //  true 면 성공, false 는 실패이거나 이미 다른 사람이 등록
        if (query) {
        }
    },
];

export default {
    apiPatch,
};
