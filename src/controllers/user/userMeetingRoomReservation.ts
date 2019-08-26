import { BusinessMeetingTimeList } from './../../entity/mysql/entities/MysqlBusinessMeetingTimeList';
import { Request, Response } from 'express';
import { responseJson, RequestRole } from '../../util/common';
import { validationResult, param } from 'express-validator';
import ServiceUserMeetingRoomReservation from '../../service/ServiceUserMeetingRoomReservation';
import ServiceUserBuyerPermission from '../../service/ServiceUserBuyerPermission';
import UserBuyer from '../../entity/mysql/entities/MysqlUserBuyer';

// 여기서부터는 예약인데 buyer의 상세 정보가 있어야지만, 진행이 가능하기 때문에 체크 해야 한다.
const checkBuyerInformation = () =>
    param('userId').custom((value, { req }) => {
        const service = new ServiceUserBuyerPermission();
        const user = req.user;

        return new Promise(async resolve => {
            const query = await service._getByUser(user);
            resolve(query);
        }).then(r => {
            if (r) {
                Object.assign(req.user, { buyer: r });
            } else {
                return Promise.reject('Please enter buyer information first.');
            }
        });
    });

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
            responseJson(res, [query], method, 'success');
        } else {
            responseJson(res, [{ message: 'Already exist' }], method, 'success');
        }
    },
];

export default {
    apiPatch,
};
