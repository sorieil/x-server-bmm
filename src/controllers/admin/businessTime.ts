import { ServiceBusinessTimeList } from './../../service/ServiceBusinessTimeList';
import { Business } from '../../entity/mysql/entities/MysqlBusiness';
import { BusinessMeetingTime } from '../../entity/mysql/entities/MysqlBusinessMeetingTime';
import { Request, Response } from 'express';
import { RequestRole, responseJson, tryCatch } from '../../util/common';
import { check, validationResult } from 'express-validator';
import { CheckPermissionBusinessAdmin } from '../../util/permission';
import { ServiceBusinessTime } from '../../service/ServiceBusinessTime';
import moment from 'moment';
/**
 * @description
 * 실행할 날짜와 시작 시간과 끝나는 시간, 미팅 타임등을 넣으면, 타임 테이블이 생선된다,
 * 생성과 수정이 같은 API 에서 일뤄진다.
 */
const apiPost = [
  [
    CheckPermissionBusinessAdmin.apply(this),
    check('intervalTime')
      .not()
      .isEmpty()
      .isNumeric(),
    check('startDate').custom((value, { req }) => {
      const date = moment(value).isValid();
      if (!date) {
        return Promise.reject('startDate Invalid date');
      }
      return true;
    }),
    check('endDate').custom((value, { req }) => {
      const date = moment(value).isValid();
      if (!date) {
        return Promise.reject('endDate Invalid date');
      }
      return true;
    }),
    check('startTime').custom((value, { req }) => {
      const date = moment(value, 'HH:mm', true).isValid();
      if (!date) {
        return Promise.reject('startTime Invalid date');
      }
      return true;
    }),
    check('endTime').custom((value, { req }) => {
      const date = moment(value, 'HH:mm', true).isValid();
      if (!date) {
        return Promise.reject('endTime Invalid date');
      }
      return true;
    }),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      const method: RequestRole = req.method.toString() as any;

      if (!errors.isEmpty()) {
        responseJson(res, errors.array(), method, 'invalid');
        return;
      }
      const businessMeetingTime: BusinessMeetingTime = new BusinessMeetingTime();
      const service: ServiceBusinessTime = new ServiceBusinessTime();
      const business: Business = new Business();
      const body = req.body;
      business.id = req.user.business.id;
      const queryBusinessMeetingTime = await service.get(business);

      if (queryBusinessMeetingTime) {
        businessMeetingTime.id = queryBusinessMeetingTime.id;

        // 생성과 수정이 같은 소스이긴 하지만, 메소드 구별은 해준다. 혼란을 막기 위해서
        // if (method === 'POST') {
        //     responseJson(res, [], method, 'success');
        //     return;
        // }
      }

      const startDate = body.startDate;
      const endDate = body.endDate;
      const intervalTime = body.intervalTime;
      const startTime = moment(body.startTime, 'HH:mm');
      const endTime = moment(body.endTime, 'HH:mm');

      businessMeetingTime.business = business;
      businessMeetingTime.startDate = startDate;
      businessMeetingTime.endDate = endDate;
      businessMeetingTime.startTime = body.startTime;
      businessMeetingTime.endTime = body.endTime;
      businessMeetingTime.intervalTime = intervalTime;
      // TODO 여기에서 미팅룸 갯수 만큼 카운트를 해준다. 그래서 예약기 되면, 마이너스 카운트를 해준다. 그리고 그 방들의 정ㅂ

      const generateTimeList: any[] = await new Promise(resolve => {
        const end = moment(endDate)
          .hour(Number(endTime.format('HH')))
          .minute(Number(endTime.format('mm')));
        let start = moment(startDate)
          .hour(Number(startTime.format('HH')))
          .minute(Number(startTime.format('mm')));
        let interval = Number(intervalTime);

        const diffDays = moment.duration(end.diff(start));
        const daysBucket: any[] = [];
        const startDividedTime =
          Number(startTime.format('HH')) * 60 + Number(startTime.format('mm'));
        const endDividedTime =
          Number(endTime.format('HH')) * 60 + Number(endTime.format('mm'));
        const timeRange = endDividedTime - startDividedTime;
        const timeIntervalRange = Math.floor(timeRange / interval);
        for (let i = 0; diffDays.days() >= i; i++) {
          const childBucket = [];
          for (let j = timeIntervalRange; j > 0; j--) {
            // TODO 여기에서 스타트 타임과 엔딩 타임도 넣어줘야 한다.
            if (j === timeIntervalRange) {
              const dividedTime = start.format('HH:mm').toString();
              childBucket.push({
                time: dividedTime,
                status: 'no',
              });
            } else {
              const dividedTime = start
                .add(interval, 'm')
                .format('HH:mm')
                .toString();
              childBucket.push({
                time: dividedTime,
                status: 'no',
              });
            }
          }
          daysBucket.push({
            date: start.format('YYYY[-]MM[-]DD'),
            times: childBucket,
          });
          start
            .add(1, 'days')
            .hour(Number(startTime.format('HH')))
            .minute(Number(startTime.format('mm')));
        }
        resolve(daysBucket);
      });

      const serviceBusinessTimeList = new ServiceBusinessTimeList();
      // 저장되어 있던 타임 블럭들을 삭제 해준다.
      await serviceBusinessTimeList.deleteAllMeetingTimeList(
        businessMeetingTime,
      );
      // 기간 정보 저장
      await service.post(businessMeetingTime);

      responseJson(res, generateTimeList, method, 'success');
    } catch (error) {
      tryCatch(res, error);
    }
  },
];

const apiGet = [
  [CheckPermissionBusinessAdmin.apply(this)],
  async (req: Request, res: Response) => {
    const method: RequestRole = req.method.toString() as any;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      responseJson(res, errors.array(), method, 'invalid');
      return;
    }

    const service = new ServiceBusinessTime();
    const business = new Business();
    business.id = req.user.business.id;
    const query = await service.get(business);

    if (query) {
      responseJson(res, [query], method, 'success');
    } else {
      responseJson(res, [], method, 'success');
    }
  },
];

export default {
  apiPost,
  apiGet,
};
