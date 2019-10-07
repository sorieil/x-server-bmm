import { BusinessMeetingTimeList } from './../../entity/mysql/entities/MysqlBusinessMeetingTimeList';
import { Request, Response } from 'express';
import { responseJson, RequestRole } from '../../util/common';
import { validationResult, param } from 'express-validator';
import ServiceUserMeetingRoomReservation from '../../service/ServiceUserMeetingRoomReservation';
import ServiceUserBuyerPermission from '../../service/ServiceUserBuyerPermission';
import UserBuyer from '../../entity/mysql/entities/MysqlUserBuyer';

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

/**
 * 예약 가능한 타임 테이블 검색
 * 모든 예약이 나와야 하나요..? 아니면, 날짜별로 나와야 하나요..? 근데 날짜를 알수 있나요..?
 * 예약 시간에서 조회 해서 날짜를 알아낸후에 날짜 별로 가져와야 한다~
 */
const apiGet = [
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
