import { BusinessVenderInformationFieldChildNode } from '../../entity/mysql/entities/MysqlBusinessVenderInformationFieldChildNode';
import { Request, Response } from 'express';
import { RequestRole, responseJson, tryCatch } from '../../util/common';
import { check, validationResult, param, checkSchema, ValidationSchema } from 'express-validator';
import { businessPermission } from '../../util/permission';
import ServiceBusinessVenderInformationField from '../../service/ServiceBusinessVenderInformationField';
import { BusinessVenderInformationField } from '../../entity/mysql/entities/MysqlBusinessVenderInformationField';
import { Server } from 'tls';
import ServiceBusinessVenderInformationChildNode from '../../service/ServiceBusinessVenderInformationFieldChildNode';
import { Business } from '../../entity/mysql/entities/MysqlBusiness';
const schemaRequire: ValidationSchema = {
    require: {
        in: 'body',
        matches: {
            options: ['yes', 'no'],
            errorMessage: 'Invalid role',
        },
    },
};
const apiPost = [
    [
        businessPermission.apply(this),
        check('name')
            .not()
            .isEmpty(),
        check('require', 'The input data can be "yes or no".')
            .optional()
            .isIn(['yes', 'no']),
        check('subType')
            .not()
            .isEmpty(),
        check('mainType')
            .not()
            .isEmpty(),
        check('businessVenderInformationFieldChildNode').isArray(),
    ],
    async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req);
            const method: RequestRole = req.method.toString() as any;

            if (!errors.isEmpty()) {
                responseJson(res, errors.array(), method, 'invalid');
                return;
            }

            const service = new ServiceBusinessVenderInformationField();
            const serviceChild = new ServiceBusinessVenderInformationChildNode();
            const businessVenderInformationField = new BusinessVenderInformationField();
            const body = req.body;
            const paramChildNode = body.businessVenderInformationFieldChildNode.map((v: { text: string }) => {
                const schema = new BusinessVenderInformationFieldChildNode();
                return Object.assign(schema, v);
            });

            let paramChildNodeQuery: BusinessVenderInformationFieldChildNode;

            const business = new Business();
            business.id = req.user.business.id;

            if (paramChildNode.length > 0) {
                paramChildNodeQuery = await serviceChild.post(paramChildNode);
            }

            businessVenderInformationField.name = body.name;
            businessVenderInformationField.business = business;
            businessVenderInformationField.require = body.require;
            businessVenderInformationField.subType = body.subType;
            businessVenderInformationField.mainType = body.mainType;
            businessVenderInformationField.businessVenderInformationFieldChildNodes = paramChildNode;

            const query = await service.post(businessVenderInformationField);

            responseJson(res, [query], method, 'success');
        } catch (error) {
            tryCatch(res, error);
        }
    },
];

const apiGet = [
    [businessPermission.apply(this)],
    async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req);
            const method: RequestRole = req.method.toString() as any;

            if (!errors.isEmpty()) {
                responseJson(res, errors.array(), method, 'invalid');
                return;
            }

            const service = new ServiceBusinessVenderInformationField();
            const business = new Business();
            business.id = req.user.business.id;

            const query = await service.get(business);
            responseJson(res, query, method, 'success');
        } catch (error) {
            tryCatch(res, error);
        }
    },
];

const apiDelete = [
    [businessPermission.apply(this)],
    async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req);
            const method: RequestRole = req.method.toString() as any;

            if (!errors.isEmpty()) {
                responseJson(res, errors.array(), method, 'invalid');
                return;
            }
            const service = new ServiceBusinessVenderInformationField();
            const business = new Business();
            business.id = req.user.business.id;

            const informationQuery = await service.get(business);
            if (informationQuery) {
                const query = await service.delete(business);
                // console.log('query:', query);
                responseJson(res, [{ message: `${query.raw.affectedRows} is deleted.` }], method, 'success');
            } else {
                responseJson(res, [], method, 'invalid');
            }
        } catch (error) {
            tryCatch(res, error);
        }
    },
];

export default {
    apiPost,
    apiDelete,
    apiGet,
};
