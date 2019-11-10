import { Request, Response } from 'express';
import { responseJson, RequestRole, tryCatch } from '../../util/common';
import { validationResult } from 'express-validator';
import ServiceUserMeetingRoom from '../../service/ServiceUserMeetingRoom';
import { Business } from '../../entity/mysql/entities/MysqlBusiness';

const apiGet = [
  async (req: Request, res: Response) => {
    try {
      const method: RequestRole = req.method.toString() as any;
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        responseJson(res, errors.array(), method, 'invalid');
        return;
      }

      const service = new ServiceUserMeetingRoom();
      const business = new Business();
      business.id = req.user.business.id;
      const query = await service._getBusinessMeetingRoomByBusiness(business);
      responseJson(res, query, method, 'success');
    } catch (error) {
      tryCatch(res, error);
    }
  },
];

export default {
  apiGet,
};
