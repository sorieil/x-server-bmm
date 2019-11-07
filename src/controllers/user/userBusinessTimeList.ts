import { BusinessVendorManager } from './../../entity/mysql/entities/MysqlBusinessVendorManager';
import { BusinessVendor } from '../../entity/mysql/entities/MysqlBusinessVendor';
import { BusinessMeetingTimeList } from './../../entity/mysql/entities/MysqlBusinessMeetingTimeList';
import { Request, Response } from 'express';
import { RequestRole, responseJson, tryCatch } from '../../util/common';
import { validationResult, param, query } from 'express-validator';
import { CheckPermissionGetUserDataForUser } from '../../util/permission';
import moment = require('moment');
import ServiceUserBusinessTime from '../../service/ServiceUserBusinessTime';
import { User } from '../../entity/mysql/entities/MysqlUser';
import UserBuyer from '../../entity/mysql/entities/MysqlUserBuyer';
import ServiceUserManager from '../../service/ServiceUserManager';

/**
 * @description
 * 날짜 별로 타임 리스트를 가져온다.
 * 중요한 내용은 유저의 타입을 구분지어 바이어와, 밴더 매니저를 분기를 태워서 데이터를 가져와야 한다.
 * @data 2019-01-02 식으로 데이터를 넣는다.
 */
const apiGet = [
  [
    CheckPermissionGetUserDataForUser.apply(this),
    param('date').custom((value, { req }) => {
      const dateValid = moment(value).format('YYYY-MM-DD');
      console.log('test result:', dateValid);
      if (dateValid === 'Invalid date') {
        return Promise.reject('Please input date format.');
      } else {
        return Promise.resolve(true);
      }
    }),
  ],
  async (req: Request, res: Response) => {
    try {
      const method: RequestRole = req.method.toString() as any;
      const errors = validationResult(req);
      console.log('errors.isEmpty():', errors.isEmpty());
      if (!errors.isEmpty()) {
        responseJson(res, errors.array(), method, 'invalid');
        return;
      }
      const serviceUserBusinessTime = new ServiceUserBusinessTime();
      const serviceUserManager = new ServiceUserManager();
      const businessMeetingTimeList = new BusinessMeetingTimeList();

      businessMeetingTimeList.dateBlock = req.params.date;
      const user = new User();
      user.id = req.user.id;
      const result = {};
      let query: any[] = [];
      // const userType = await serviceBusinessVendor._getByUser(user);
      console.log('User type:', req.user.users[0].type);
      if (req.user.users[0].type === 'buyer') {
        const userBuyer = new UserBuyer();
        userBuyer.id = req.user.users[0].userBuyer.id;

        query = await serviceUserBusinessTime._getTimeListByDateBlockForBuyer(
          userBuyer,
          businessMeetingTimeList,
        );

        // 있으면, 바이어
      } else {
        const businessVendorManager = new BusinessVendorManager();
        businessVendorManager.id = req.user.users[0].businessVendorManager.id;
        const businessVendorQuery = await serviceUserManager._getBusinessVendorByBusinessVendorManager(
          businessVendorManager,
        );

        const businessVendor = new BusinessVendor();
        businessVendor.id = businessVendorQuery.businessVendor.id;

        // 그럼 이 화면은 passport 에서 결정되어야 할거 같은데...
        query = await serviceUserBusinessTime._getTimeListByDateBlockForManger(
          businessVendor,
          businessMeetingTimeList,
        );
      }

      //

      // 날짜와 타임 테이블의 아이디 값을 기준으로 타임 테이블의 상태를 보여준다.
      // 여기에서 중요한것은 타임테이블에는 미팅룸의 갯수만큼 예약을 할 수 있다.
      // 또한 여기에서 중요한것은 벤더 일경우 벤더의 타엠테이블이 보여야 하고,
      // 바이어인 경우 바이어의 개인의 스케쥴이 보여야 한다.

      // const business = new Business();
      // business.id = req.user.business.id;
      // console.log('business:', business);
      // const query = await service.get(business);

      responseJson(res, query, method, 'success');
    } catch (error) {
      tryCatch(res, error);
    }
  },
];

const apiGetByVendor = [
  [
    CheckPermissionGetUserDataForUser.apply(this),
    query('date').custom((value, { req }) => {
      const dateValid = moment(value).format('YYYY-MM-DD');
      console.log('test result:', dateValid);
      if (dateValid === 'Invalid date') {
        return Promise.reject('Please input date format.');
      } else {
        return Promise.resolve(true);
      }
    }),
    param('vendorId')
      .not()
      .isEmpty(),
  ],
  async (req: Request, res: Response) => {
    try {
      const method: RequestRole = req.method.toString() as any;
      const errors = validationResult(req);
      console.log('errors.isEmpty():', errors.isEmpty());
      if (!errors.isEmpty()) {
        responseJson(res, errors.array(), method, 'invalid');
        return;
      }
      const serviceUserBusinessTime = new ServiceUserBusinessTime();
      const businessMeetingTimeList = new BusinessMeetingTimeList();
      const businessVendor = new BusinessVendor();
      const searchDate = req.query.date;
      businessVendor.id = req.params.vendorId;

      businessMeetingTimeList.dateBlock = searchDate;

      // 밴더 정보로 타임 리스트를 가져온다.
      const query = await serviceUserBusinessTime._getTimeListByDateBlockForAllBuyer(
        businessVendor,
        businessMeetingTimeList,
      );

      //

      // 날짜와 타임 테이블의 아이디 값을 기준으로 타임 테이블의 상태를 보여준다.
      // 여기에서 중요한것은 타임테이블에는 미팅룸의 갯수만큼 예약을 할 수 있다.
      // 또한 여기에서 중요한것은 벤더 일경우 벤더의 타엠테이블이 보여야 하고,
      // 바이어인 경우 바이어의 개인의 스케쥴이 보여야 한다.

      // const business = new Business();
      // business.id = req.user.business.id;
      // console.log('business:', business);
      // const query = await service.get(business);

      responseJson(res, query, method, 'success');
    } catch (error) {
      tryCatch(res, error);
    }
  },
];

export default {
  apiGet,
  apiGetByVendor,
};
