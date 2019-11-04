import { tryCatch } from './../../util/common';
import { Request, Response } from 'express';
import { responseJson, RequestRole } from '../../util/common';
import { validationResult, body, param } from 'express-validator';
import ServiceUserBuyer from '../../service/ServiceUserBuyer';
import UserBuyer from '../../entity/mysql/entities/MysqlUserBuyer';
import ServiceUserBuyerPermission from '../../service/ServiceUserBuyerPermission';
import { User } from '../../entity/mysql/entities/MysqlUser';
import ServiceUser from '../../service/ServiceUser';
// 여기서부터는 예약인데 buyer의 상세 정보가 있어야지만, 진행이 가능하기 때문에 체크 해야 한다.
const CheckPermissionBuyerInformation = () =>
  param('userId').custom((value, { req }) => {
    const service = new ServiceUserBuyerPermission();
    const user = req.user;

    return new Promise(async resolve => {
      const query = await service._getUserBuyerByUser(user);
      resolve(query);
    }).then(r => {
      if (r) {
        Object.assign(req.user, { buyer: r });
      } else {
        return Promise.reject('Please enter buyer information first.');
      }
    });
  });

/**
 * @description
 * 바이어면, 여기에서 기본 정보를 가져온다.
 */
const apiGet = [
  [CheckPermissionBuyerInformation.apply(this)],
  async (req: Request, res: Response) => {
    const method: RequestRole = req.method.toString() as any;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      responseJson(res, errors.array(), method, 'invalid');
      return;
    }

    const query = req.user.buyer;

    responseJson(res, [query], method, 'success');
  },
];

/**
 * @description
 * 바이어의 정보를 입력하거나 수정 할때 사용한다.
 * user.type 값이 없는 상태에서 처음 입력하게 되면,
 * 바이어로 등록된다. user.type = 'buyer' 로 등록된다.
 */
const apiPost = [
  [
    body('name')
      .not()
      .isEmpty(),
    body('phone')
      .not()
      .isEmpty(),
    body('email')
      .not()
      .isEmpty()
      .isEmail(),
  ],
  async (req: Request, res: Response) => {
    const method: RequestRole = req.method.toString() as any;
    const errors = validationResult(req);
    try {
      if (!errors.isEmpty()) {
        responseJson(res, errors.array(), method, 'invalid');
        return;
      }

      // 여기에서 매니저와 바이어의 수정사항이 다르다.

      const service = new ServiceUserBuyer();
      const user = new User();
      user.id = req.user.users[0].id;
      const body = req.body;
      let userBuyerQuery: UserBuyer;
      userBuyerQuery = await service._getUserBuyerByUser(user);
      if (userBuyerQuery) {
        console.log('User ====> ', userBuyerQuery.id);
        userBuyerQuery.phone = body.phone;
        userBuyerQuery.email = body.email;
        userBuyerQuery.name = body.name;
      } else {
        userBuyerQuery = new UserBuyer();
        userBuyerQuery.user = user;
        userBuyerQuery.phone = body.phone;
        userBuyerQuery.email = body.email;
        userBuyerQuery.name = body.name;
      }

      console.log('userBuyerQuery:', userBuyerQuery);

      const query = await service.post(userBuyerQuery);
      const serviceUser = new ServiceUser();
      user.type = 'buyer';
      await serviceUser.post(user);

      // BusienssVendorMeetingTimeList 에서 테이블 복사를 한다.

      responseJson(res, [query], method, 'success');
    } catch (error) {
      tryCatch(res, error);
    }
  },
];

export default {
  apiGet,
  apiPost,
};
