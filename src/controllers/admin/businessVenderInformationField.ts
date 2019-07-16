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
import { Admin } from '../../entity/mysql/entities/MysqlAdmin';
import { ServiceBusinessPermission } from '../../service/ServiceBusinessPermission';

const businessVenderInformationPermission = () =>
    param('informationId').custom((value, { req }) => {
        if (!value) {
            return Promise.reject('Invalid insert data.');
        }

        const service = new ServiceBusinessVenderInformationField();
        const business = new Business();
        const admin = new Admin();
        const venderInformation = new BusinessVenderInformationField();
        admin.id = req.user.admins[0];

        venderInformation.id = value;
        return new Promise(async resolve => {
            const businessQuery = await new ServiceBusinessPermission()._ByAdmin(admin);

            if (!businessQuery) {
                resolve(null);
            }

            business.id = businessQuery.id;

            const query = await service.getWithBusiness(venderInformation, business);

            resolve(query);
        }).then((r: any) => {
            if (r === null) {
                return Promise.reject('You don`t have permission or first insert business information..');
            }

            if (r) {
                Object.assign(req.user, { venderInformation: r });
            } else {
                return Promise.reject('You don`t have permission or first insert vender information..');
            }
        });
    });

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
        check('businessVenderInformationFieldChildNodes').isArray(),
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
            const paramChildNode = body.businessVenderInformationFieldChildNodes.map(
                (v: BusinessVenderInformationFieldChildNode) => {
                    const schema = new BusinessVenderInformationFieldChildNode();
                    return Object.assign(schema, v);
                },
            );

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

const apiPatch = [
    [businessVenderInformationPermission.apply(this)],
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
            const paramChildNode = await body.businessVenderInformationFieldChildNodes.map(
                (v: BusinessVenderInformationFieldChildNode) => {
                    const schema = new BusinessVenderInformationFieldChildNode();
                    delete v.createdAt;
                    delete v.updatedAt;
                    return Object.assign(schema, v);
                },
            );

            if (paramChildNode.length > 0) {
                await serviceChild.post(paramChildNode);
            }
            console.log('child node:', req.user.venderInformation);
            await Object.assign(businessVenderInformationField, body, req.user.venderInformation);
            delete businessVenderInformationField.business;
            delete businessVenderInformationField.createdAt;
            delete businessVenderInformationField.updatedAt;

            businessVenderInformationField.businessVenderInformationFieldChildNodes = paramChildNode;

            const query = await service.post(businessVenderInformationField);
            responseJson(res, [query], method, 'success');
        } catch (error) {
            tryCatch(res, error);
        }
    },
];

const apiGets = [
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

const apiGet = [
    [businessVenderInformationPermission.apply(this)],
    async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req);
            const method: RequestRole = req.method.toString() as any;

            if (!errors.isEmpty()) {
                responseJson(res, errors.array(), method, 'invalid');
                return;
            }

            responseJson(res, req.user.venderInformation, method, 'success');
        } catch (error) {
            tryCatch(res, error);
        }
    },
];

const apiDeleteAll = [
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
                const query = await service.deleteAll(business);
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

const apiDelete = [
    [businessVenderInformationPermission.apply(this)],
    async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req);
            const method: RequestRole = req.method.toString() as any;

            if (!errors.isEmpty()) {
                responseJson(res, errors.array(), method, 'invalid');
                return;
            }
            const service = new ServiceBusinessVenderInformationField();
            const venderInformation = new BusinessVenderInformationField();
            venderInformation.id = req.user;
            const query = await service.delete(venderInformation);
            responseJson(res, [{ message: `${query.raw.affectedRows} is deleted.` }], method, 'success');
        } catch (error) {
            tryCatch(res, error);
        }
    },
];

export default {
    apiPost,
    apiDelete,
    apiGet,
    apiGets,
    apiDeleteAll,
    apiPatch,
};
