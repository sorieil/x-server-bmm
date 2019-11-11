import { BusinessVendorFieldManagerValue } from './../../entity/mysql/entities/MysqlBusinessVendorFieldManagerValue';
import { ServiceBusinessMeetingRoom } from './../../service/ServiceBusinessMeetingRoom';
import { BusinessMeetingRoomReservation } from './../../entity/mysql/entities/MysqlBusinessMeetingRoomReservation';
import { BusinessMeetingTimeList } from './../../entity/mysql/entities/MysqlBusinessMeetingTimeList';
import { Request, Response } from 'express';
import { responseJson, RequestRole, tryCatch } from '../../util/common';
import { validationResult, param, body } from 'express-validator';
import ServiceUserMeetingRoomReservation from '../../service/ServiceUserMeetingRoomReservation';
import { BusinessVendorMeetingTimeList } from '../../entity/mysql/entities/MysqlBusinessVendorMeetingTimeList';
import { BusinessVendor } from '../../entity/mysql/entities/MysqlBusinessVendor';
import { Business } from '../../entity/mysql/entities/MysqlBusiness';

const apiDelete = [
  [
    param('reservationId')
      .not()
      .isEmpty()
      .isNumeric(),
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
      const reservation = new BusinessMeetingRoomReservation();
      reservation.id = req.params.reservationId;

      reservation.id = parseInt(req.params.reservationId, 10);

      const query = await service.delete(reservation);

      // 이미 다른 사람이 예약이 되어 있다면, 예약을 못하게 해야 한다.
      //  true 면 성공, false 는 실패이거나 이미 다른 사람이 등록

      responseJson(res, [query], method, 'delete');
    } catch (error) {
      tryCatch(res, error);
    }
  },
];

const apiPatch = [
  [
    param('reservationId')
      .not()
      .isEmpty()
      .isNumeric(),
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
      const reservation = new BusinessMeetingRoomReservation();
      reservation.id = req.params.reservationId;
      reservation.memo = req.body.memo;

      reservation.id = parseInt(req.params.reservationId, 10);

      const query = await service.post(reservation);

      // 이미 다른 사람이 예약이 되어 있다면, 예약을 못하게 해야 한다.
      //  true 면 성공, false 는 실패이거나 이미 다른 사람이 등록

      responseJson(res, [query], method, 'success');
    } catch (error) {
      tryCatch(res, error);
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
    try {
      const method: RequestRole = req.method.toString() as any;
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        responseJson(res, errors.array(), method, 'invalid');
        return;
      }

      const service = new ServiceUserMeetingRoomReservation();
      const reservation = new BusinessMeetingRoomReservation();
      reservation.id = req.params.reservationId;

      const query = await service.get(reservation);
      console.log(query);
      query.businessVendor.businessVendorManagers.map((v: any) => {
        return v.businessVendorFieldManagerValues.map((j: any) => {
          const fieldType = j.businessVendorField.fieldType.columnType;
          if (fieldType === 'idx') {
            j.value = j[fieldType].id || null;
          } else {
            j.value = j[fieldType] || null;
          }

          delete j.text;
          delete j.textarea;
          delete j.idx;
          return j;
        });
      });
      // 이미 다른 사람이 예약이 되어 있다면, 예약을 못하게 해야 한다.
      //  true 면 성공, false 는 실패이거나 이미 다른 사람이 등록

      responseJson(res, [query], method, 'success');
    } catch (error) {
      tryCatch(res, error);
    }
  },
];

const apiPost = [
  [
    body('vendorId')
      .not()
      .isEmpty(),
    body('vendorTimeListId')
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
      const serviceBusinessMeetingRoom = new ServiceBusinessMeetingRoom();
      const business = new Business();
      businessVendor.id = parseInt(body.vendorId, 10);
      businessVendorMeetingTimeList.id = parseInt(body.vendorTimeListId, 10);
      business.id = req.user.business.id;

      // 개설된 미팅방을 가져온다.
      const businessMeetingRoomQuery = await serviceBusinessMeetingRoom.gets(
        business,
      );

      // 밴더의 미팅 리스트 아이디를 가져온다.

      let businessMeetingRoomCount = 0;
      // 개설된 미팅방이 있으면 카운트를 해준다.
      if (businessMeetingRoomQuery) {
        businessMeetingRoomCount = businessMeetingRoomQuery.length;
      }

      // 비즈니스 타임 리스트로 바이어의 미팅 타임 블럭 아이디를 가져온다.
      const businessMeetingTimeList = new BusinessMeetingTimeList();
      businessMeetingTimeList.id = body.businessMeetingTimeList;

      // 밴더의 예약 정보를 가져온다.
      const userVendorMeetingTimeListQuery = await service._getVendorMeetingTimeListBySelf(
        businessVendorMeetingTimeList,
      );

      // 유저의 타임리스트 번호를 알아낸다.
      const userBuyerMeetingTimeListQuery = await service._getUserMeetingTimeListByBV_BMTL(
        businessVendor,
        businessMeetingTimeList,
      );

      let vendorReservationCount = 0;
      if (userVendorMeetingTimeListQuery) {
        vendorReservationCount =
          userVendorMeetingTimeListQuery.businessMeetingRoomReservations.length;
      }

      // console.log('vendorReservationCount:', vendorReservationCount);
      // return;
      // 바이어가 타임테이블이 존재 할 경우
      // 비즈니스 미팅룸경우 룸을 조회 한다.
      // 그리고 비즈니스 미팅룸 기준으로
      // 밴더아이디/미팅룸/비즈니스블럭 아이디 기준으로 조회를 하고 데이터가 있으면,
      if (userBuyerMeetingTimeListQuery && businessMeetingRoomCount > 0) {
        // 예약 검증 들어간다.
        // 우선 방 리스트를 가져오고,
        // 불러온 데이터중, filter 로 데이터를 남은 데이터중 첫번째 방으로 방을 지정해주고, 만약 남지 안으면, 예약이 안되는것고,

        if (vendorReservationCount === 0) {
          // 예약이 무조건 가능
          businessMeetingRoomReservation.memo = body.memo;
          businessMeetingRoomReservation.userBuyerMeetingTimeList = userBuyerMeetingTimeListQuery;
          // businessMeetingRoomReservation.businessVendorMeetingTimeList = businessVendorMeetingTimeList;
          businessMeetingRoomReservation.businessMeetingRoom =
            businessMeetingRoomQuery[0];
          businessMeetingRoomReservation.businessVendor = businessVendor;
          const saveReservation = await service.post(
            businessMeetingRoomReservation,
          );
          // 예약 완료
          responseJson(res, [saveReservation], method, 'success');
        } else {
          // 예약이 가능한지 검증해야 한다.

          const reservationAvailable = businessMeetingRoomQuery.filter(
            (room, index) => {
              console.log(room.id, index, userBuyerMeetingTimeListQuery);
            },
          );

          if (reservationAvailable.length > 0) {
            console.log('UserBuyer id :', userBuyerMeetingTimeListQuery);

            responseJson(
              res,
              [businessMeetingRoomReservation],
              method,
              'success',
            );
          } else {
            responseJson(
              res,
              [
                {
                  message: '예약이 불가능합니다.',
                },
              ],
              method,
              'success',
            );
          }
        }
      } else {
        // 바이어가 해당 타임 블럭의 타임을 가지고 있지 않은경우
        responseJson(
          res,
          [
            {
              message:
                '밴더의 타임 테이블에 문제가 생겼습니다. 관리자에게 문의해주세요.',
            },
          ],
          method,
          'success',
        );
      }
    } catch (error) {
      tryCatch(res, error);
    }
  },
];

export default {
  apiPatch,
  apiGet,
  apiPost,
  apiDelete,
};
