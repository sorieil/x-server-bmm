import { Request, Response } from 'express';
import { ServiceBusinessPermission } from '../../service/ServiceBusinessPermission';
import { param, validationResult } from 'express-validator';
import ServiceBusinessVendorField from '../../service/ServiceBusinessVendorField';
import { Business } from '../../entity/mysql/entities/MysqlBusiness';
import { Admin } from '../../entity/mysql/entities/MysqlAdmin';
import { BusinessVendorField } from '../../entity/mysql/entities/MysqlBusinessVendorField';
import ServiceBusinessVendorFieldChildNode from '../../service/ServicebusinessVendorFieldChildNode';
import { responseJson, RequestRole } from '../../util/common';
import { BusinessVendorFieldChildNode } from '../../entity/mysql/entities/MysqlBusinessVendorFieldChildNode';
const businessVendorInformationPermission = () =>
  param('fieldChildNodeId').custom((value, { req }) => {
    if (!value) {
      return Promise.reject('Invalid insert data.');
    }

    const service = new ServiceBusinessVendorField();
    const childService = new ServiceBusinessVendorFieldChildNode();
    const business = new Business();
    const admin = new Admin();
    const businessVendorFieldChildNode = new BusinessVendorFieldChildNode();
    const businessVendorField = new BusinessVendorField();

    admin.id = req.user.admins[0];
    businessVendorFieldChildNode.id = value;

    return new Promise(async resolve => {
      const businessQuery = await new ServiceBusinessPermission()._ByAdmin(
        admin,
      );
      // console.log('businessQuery:', businessQuery);
      if (!businessQuery) {
        resolve(null);
      }

      business.id = businessQuery.id;
      const fieldQuery = await service.get(business);
      if (!fieldQuery || fieldQuery.length === 0) {
        resolve(null);
      }

      console.log('fieldQuery:', fieldQuery);

      businessVendorField.id = fieldQuery[0].id;
      console.log(
        'field child permission:',
        businessVendorField.id,
        businessVendorFieldChildNode.id,
      );
      const vendorFieldChildNodeQuery = await childService.getByBusinessVendorField(
        businessVendorField, // TODO 적용 안함. 개선 필요함. 현재 인증은 이뤄지지 않음
        businessVendorFieldChildNode,
      );

      resolve(vendorFieldChildNodeQuery);
    }).then((r: any) => {
      if (r === null) {
        return Promise.reject(
          'You don`t have permission or first insert business or vendor default data.',
        );
      }

      if (r) {
        Object.assign(req.user, { filedChildNode: r });
      } else {
        return Promise.reject(
          'You don`t have permission or first insert vendor fields..',
        );
      }
    });
  });
const apiDelete = [
  [businessVendorInformationPermission.apply(this)],
  async (req: Request, res: Response) => {
    const method: RequestRole = req.method.toString() as any;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      responseJson(res, errors.array(), method, 'invalid');
      return;
    }
    const service = new ServiceBusinessVendorFieldChildNode();
    const businessVendorFieldChildNode = new BusinessVendorFieldChildNode();
    console.log('filedChildNode:', req.user.filedChildNode);
    businessVendorFieldChildNode.id = req.user.filedChildNode.id;
    const query = await service.delete(businessVendorFieldChildNode);

    responseJson(res, [query], method, 'success');
  },
];

export default {
  apiDelete,
};
