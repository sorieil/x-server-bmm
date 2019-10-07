import { Request, Response } from 'express';
import { responseJson, RequestRole, tryCatch } from '../../util/common';
import { validationResult } from 'express-validator';
import ServiceBusinessVenderField from '../../service/ServiceBusinessVenderField';
import { Business } from '../../entity/mysql/entities/MysqlBusiness';

/**
 * @deprecated
 * 벤더의 필드 중에서 필터로 적용 할 수 있는 필드를 출력해준다.
 */
const apiGets = [
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      const method: RequestRole = req.method.toString() as any;

      if (!errors.isEmpty()) {
        responseJson(res, errors.array(), method, 'invalid');
        return;
      }

      const service = new ServiceBusinessVenderField();
      const business = new Business();
      business.id = req.user.business.id;

      const query = await service.get(business);
      await query.map((v: any) => {
        delete v.createdAt;
        delete v.updatedAt;
        v.informationType = v.informationType.id;
        v.fieldType = v.fieldType.id;
        v.fieldChildNodes = v.businessVenderFieldChildNodes;
        delete v.businessVenderFieldChildNodes;
        return v;
      });

      await query.filter((v: any) => {
        return v.columnType === 'idx';
      });

      console.log(query);

      responseJson(res, query, method, 'success');
    } catch (error) {
      tryCatch(res, error);
    }
  },
];

export default {
  apiGets,
};
