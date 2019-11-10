import { BusinessMeetingRoomReservation } from './../../entity/mysql/entities/MysqlBusinessMeetingRoomReservation';
import { BusinessMeetingTimeList } from './../../entity/mysql/entities/MysqlBusinessMeetingTimeList';
import { Request, Response } from 'express';
import { responseJson, RequestRole, tryCatch } from '../../util/common';
import { validationResult, param, body } from 'express-validator';
import ServiceUserMeetingRoomReservation from '../../service/ServiceUserMeetingRoomReservation';
import { BusinessVendorMeetingTimeList } from '../../entity/mysql/entities/MysqlBusinessVendorMeetingTimeList';
import { BusinessVendor } from '../../entity/mysql/entities/MysqlBusinessVendor';

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

const apiPost = [
  [
    body('vendorId')
      .not()
      .isEmpty(),
    body('vendorTimeBlockId')
      .not()
      .isEmpty(),
    body('businessMeetingTimeList')
      .not()
      .isEmpty(),
    body('memo')
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
      const service = new ServiceUserMeetingRoomReservation();
      const body = req.body;
      const businessMeetingRoomReservation = new BusinessMeetingRoomReservation();
      const businessVendorMeetingTimeList = new BusinessVendorMeetingTimeList();
      const businessVendor = new BusinessVendor();

      // 방 정보를 검색 해서 방정보 넣어준다.
      // 비즈니스 BusinessMeetingTimeBlock id 기준으로 buyer 의 테이블에서
      // 아이디를 검색해서 찾아낸다.
      const businessMeetingTimeList = new BusinessMeetingTimeList();
      businessMeetingTimeList.id = body.businessMeetingTimeList;
      const userBuyerMeetingTimeListQuery = await service._getUserBuyerMeetingTimeListByBusinessMeetingTimeList(
        businessMeetingTimeList,
        businessVendor,
      );
      // 바이어가 타임테이블이 존재 할 경우
      // 비즈니스 미팅룸경우 룸을 조회 한다.
      // 그리고 비즈니스 미팅룸 기준으로
      // 밴더아이디/미팅룸/비즈니스블럭 아이디 기준으로 조회를 하고 데이터가 있으면,
      if (userBuyerMeetingTimeListQuery) {
        console.log('UserBuyer id :', userBuyerMeetingTimeListQuery);
        businessMeetingRoomReservation.businessVendorMeetingTimeList =
          body.vendorTimeBlockId;
        businessMeetingRoomReservation.memo = body.memo;
        businessMeetingRoomReservation.userBuyerMeetingTimeList = userBuyerMeetingTimeListQuery;
        businessMeetingRoomReservation.businessVendorMeetingTimeList = businessVendorMeetingTimeList;
        responseJson(res, [businessMeetingRoomReservation], method, 'success');
      } else {
        // 바이어가 해당 타임 블럭의 타임을 가지고 있지 않은경우
        responseJson(res, [businessMeetingRoomReservation], method, 'success');
      }

      console.log(body);

      // responseJson(res, [], method, 'success');
    } catch (error) {
      tryCatch(res, error);
    }
  },
];

export default {
  apiPatch,
  apiGet,
  apiPost,
};
