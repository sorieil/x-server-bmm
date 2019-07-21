import { Request, Response } from 'express';
import { ServiceBusinessPermission } from '../../service/ServiceBusinessPermission';
import { param, validationResult } from 'express-validator';
import ServiceBusinessVenderField from '../../service/ServiceBusinessVenderField';
import { Business } from '../../entity/mysql/entities/MysqlBusiness';
import { Admin } from '../../entity/mysql/entities/MysqlAdmin';
import { BusinessVenderField } from '../../entity/mysql/entities/MysqlBusinessVenderField';
import ServiceBusinessVenderFieldChildNode from '../../service/ServiceBusinessVenderFieldChildNode';
import { responseJson, RequestRole } from '../../util/common';
import { BusinessVenderFieldChildNode } from '../../entity/mysql/entities/MysqlBusinessVenderFieldChildNode';
const businessVenderInformationPermission = () =>
    param('fieldChildNodeId').custom((value, { req }) => {
        if (!value) {
            return Promise.reject('Invalid insert data.');
        }

        const service = new ServiceBusinessVenderField();
        const childService = new ServiceBusinessVenderFieldChildNode();
        const business = new Business();
        const admin = new Admin();
        const businessVenderFieldChildNode = new BusinessVenderFieldChildNode();
        const businessVenderField = new BusinessVenderField();

        admin.id = req.user.admins[0];
        businessVenderFieldChildNode.id = value;

        return new Promise(async resolve => {
            const businessQuery = await new ServiceBusinessPermission()._ByAdmin(admin);

            if (!businessQuery) {
                resolve(null);
            }

            business.id = businessQuery.id;
            const fieldQuery = await service.get(business);
            if (!fieldQuery) {
                resolve(null);
            }

            businessVenderField.id = fieldQuery[0].id;
            const venderFieldChildNodeQuery = await childService.getByBusinessVenderField(
                businessVenderField,
                businessVenderFieldChildNode,
            );

            resolve(venderFieldChildNodeQuery);
        }).then((r: any) => {
            if (r === null) {
                return Promise.reject('You don`t have permission or first insert business or vender default data.');
            }

            if (r) {
                Object.assign(req.user, { filedChildNode: r });
            } else {
                return Promise.reject('You don`t have permission or first insert vender fields..');
            }
        });
    });
const apiDelete = [
    [businessVenderInformationPermission.apply(this)],
    async (req: Request, res: Response) => {
        const method: RequestRole = req.method.toString() as any;
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            responseJson(res, errors.array(), method, 'invalid');
            return;
        }
        const service = new ServiceBusinessVenderFieldChildNode();
        const businessVenderFieldChildNode = new BusinessVenderFieldChildNode();

        businessVenderFieldChildNode.id = req.user.filedChildNode.id;
        const query = await service.delete(businessVenderFieldChildNode);

        responseJson(res, [query], method, 'success');
    },
];

export default {
    apiDelete,
};
