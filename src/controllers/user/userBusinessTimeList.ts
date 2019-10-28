import { BusinessMeetingTimeList } from '../../entity/mysql/entities/MysqlBusinessMeetingTimeList';
import { Business } from '../../entity/mysql/entities/MysqlBusiness';
import { BusinessMeetingTime } from '../../entity/mysql/entities/MysqlBusinessMeetingTime';
import { Request, Response } from 'express';
import { RequestRole, responseJson, tryCatch } from '../../util/common';
import { check, validationResult, param } from 'express-validator';
import {
  CheckPermissionGetUserData,
  CheckPermissionUserType,
} from '../../util/permission';
import { ServiceBusinessTimeList } from '../../service/ServiceBusinessTimeList';
import moment = require('moment');

const apiPatch = [
  [
    param('timeListId')
      .not()
      .isEmpty()
      .isNumeric(),
    check('use')
      .not()
      .isEmpty(),
  ],
  async (req: Request, res: Response) => {
    const method: RequestRole = req.method.toString() as any;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      responseJson(res, errors.array(), method, 'invalid');
      return;
    }

    const body = req.body;
    const businessMeetingTimeList = new BusinessMeetingTimeList();
    businessMeetingTimeList.id = req.params.timeListId;

    const service = new ServiceBusinessTimeList();
    const businessTimeListQuery = await service.get(businessMeetingTimeList);

    if (!businessTimeListQuery) {
      responseJson(
        res,
        [{ message: 'You don`t have permission or invalid data.' }],
        method,
        'invalid',
      );
      return;
    }

    businessTimeListQuery.use = body.use;

    const query = await service.update(businessTimeListQuery);
    responseJson(res, [query], method, 'success');
  },
];

const apiGet = [
  [
    CheckPermissionUserType.apply(this),
    check('date').custom((value, { req }) => {
      const date = moment(value).isValid();
      if (!date) {
        return Promise.reject('Invalid inserted date');
      }
      return true;
    }),
  ],
  async (req: Request, res: Response) => {
    const method: RequestRole = req.method.toString() as any;
    const errors = validationResult(req);
    try {
      if (!errors.isEmpty()) {
        responseJson(res, errors.array(), method, 'invalid');
        return;
      }

      // TODO 여기에서 중요한 것은 바이어의 데이터와 매니저의 데이터를 구분지어야 한다.
      console.log('user type:', req.user);

      const service = new ServiceBusinessTimeList();
      const business = new Business();
      business.id = req.user.business.id;
      console.log('business :', business);

      // const query = await service._getBusinessMeetingTImeByBusiness(business);

      responseJson(res, [], method, 'success');
    } catch (error) {
      tryCatch(res, error);
    }
  },
];

export default {
  apiGet,
  apiPatch,
};
