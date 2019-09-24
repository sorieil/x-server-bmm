import { Request, Response } from 'express';
import { RequestRole, responseJson, tryCatch } from '../../util/common';
import { check, validationResult, param } from 'express-validator';
import { businessAdminPermission } from '../../util/permission';
import ServiceBusinessVenderField, { BusinessVenderFieldType } from '../../service/ServiceBusinessVenderField';
import { BusinessVenderField } from '../../entity/mysql/entities/MysqlBusinessVenderField';
import ServiceBusinessVenderInformationChildNode from '../../service/ServiceBusinessVenderFieldChildNode';
import { Business } from '../../entity/mysql/entities/MysqlBusiness';
import { Admin } from '../../entity/mysql/entities/MysqlAdmin';
import { ServiceBusinessPermission } from '../../service/ServiceBusinessPermission';
import ServiceBusinessVenderFieldChildNode from '../../service/ServiceBusinessVenderFieldChildNode';
import { Code } from '../../entity/mysql/entities/MysqlCode';
import { BusinessVenderFieldChildNode } from '../../entity/mysql/entities/MysqlBusinessVenderFieldChildNode';

const businessVenderPermission = () =>
    param('fieldId').custom(async (value, { req }) => {
        if (!value) {
            return Promise.reject('Invalid insert data.');
        }

        const service = new ServiceBusinessVenderField();
        const business = new Business();
        const admin = new Admin();
        const businessVenderField = new BusinessVenderField();
        admin.id = req.user.admins[0];

        businessVenderField.id = value;
        const r = await new Promise(async resolve => {
            const businessQuery = await new ServiceBusinessPermission()._ByAdmin(admin);
            if (!businessQuery) {
                resolve(null);
            }
            business.id = businessQuery.id;
            const query = await service.getWithBusiness(businessVenderField, business);
            resolve(query);
        });
        if (r === null) {
            return Promise.reject('You don`t have permission or first insert business default data.');
        }
        if (r) {
            Object.assign(req.user, { vender: r });
        } else {
            return Promise.reject('You don`t have permission or first insert vender fields..');
        }
    });

const businessVenderChildPermission = () =>
    param('fieldChildNodeId').custom(async (value, { req }) => {
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

        const r = await new Promise(async resolve => {
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
        });
        if (r === null) {
            return Promise.reject('You don`t have permission or first insert business or vender default data.');
        }
        if (r) {
            Object.assign(req.user, { filedChildNode: r });
        } else {
            return Promise.reject('You don`t have permission or first insert vender child fields..');
        }
    });
const apiInit = [
    [businessAdminPermission.apply(this)],
    async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req);
            const method: RequestRole = req.method.toString() as any;

            if (!errors.isEmpty()) {
                responseJson(res, errors.array(), method, 'invalid');
                return;
            }

            const service = new ServiceBusinessVenderField();
            const serviceChild = new ServiceBusinessVenderInformationChildNode();

            const business = new Business();
            business.id = req.user.business.id;
            const informationType = new Code();

            const initFields: BusinessVenderFieldType[] = [
                { name: '기업명', require: 'yes', informationType: 4, fieldType: 1 },
                { name: '노출명', require: 'yes', informationType: 4, fieldType: 1 },
                { name: '대표명', require: 'no', informationType: 4, fieldType: 1 },
                { name: '설립일', require: 'no', informationType: 4, fieldType: 1 },
                { name: '업체구분', require: 'no', informationType: 5, fieldType: 3 },
                { name: '제품/서비스', require: 'no', informationType: 5, fieldType: 3 },
                { name: '관심분야', require: 'no', informationType: 5, fieldType: 1 },
                { name: '제품소개', require: 'no', informationType: 5, fieldType: 1 },
                { name: '담당자명', require: 'yes', informationType: 6, fieldType: 1 },
                { name: '연락처', require: 'yes', informationType: 6, fieldType: 1 },
                { name: '이메일', require: 'yes', informationType: 6, fieldType: 1 },
            ];

            // 중복 체크
            return await new Promise(async resolve => {
                const promiseBucket: any[] = [];
                initFields.forEach(element => {
                    promiseBucket.push(service.checkDuplicate(element));
                });

                resolve(promiseBucket);
            }).then(async (process: Array<object>) => {
                const result = await Promise.all(process);
                const exists = result.filter(v => typeof v !== 'undefined');
                console.log(`exists: ${exists.length} , initFields: ${initFields.length}`);
                if (exists.length === initFields.length) {
                    responseJson(
                        res,
                        [
                            {
                                message: 'Already exists',
                            },
                        ],
                        method,
                        'success',
                    );
                    return;
                } else {
                    const insertData = await initFields.map(v => {
                        const businessVenderField = new BusinessVenderField();
                        const informationType = new Code();
                        informationType.id = v.informationType;
                        const fieldType = new Code();
                        fieldType.id = v.fieldType;
                        businessVenderField.name = v.name;
                        businessVenderField.business = business;
                        businessVenderField.require = 'yes';
                        businessVenderField.informationType = informationType;
                        businessVenderField.fieldType = fieldType;
                        return businessVenderField;
                    });
                    const query = await service.postArray(insertData);
                    responseJson(res, query, method, 'success');
                }
            });
        } catch (error) {
            tryCatch(res, error);
        }
    },
];
const apiPost = [
    [
        businessAdminPermission.apply(this),
        check('name')
            .not()
            .isEmpty(),
        check('require', 'The input data can be "yes or no".')
            .optional()
            .isIn(['yes', 'no']),
        check('informationType')
            .not()
            .isEmpty(),
        check('fieldType')
            .not()
            .isEmpty(),
        check('fieldChildNodes')
            .optional()
            .isArray(),
    ],
    async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req);
            const method: RequestRole = req.method.toString() as any;

            if (!errors.isEmpty()) {
                responseJson(res, errors.array(), method, 'invalid');
                return;
            }

            const service = new ServiceBusinessVenderField();
            const serviceChild = new ServiceBusinessVenderInformationChildNode();
            const businessVenderField = new BusinessVenderField();
            const body = req.body;

            const business = new Business();
            business.id = req.user.business.id;

            const informationType = new Code();
            informationType.id = body.informationType;
            const fieldType = new Code();
            fieldType.id = body.fieldType;

            businessVenderField.name = body.name;
            businessVenderField.business = business;
            businessVenderField.require = body.require;
            businessVenderField.informationType = informationType;
            businessVenderField.fieldType = fieldType;

            const query = await service.post(businessVenderField);

            const paramChildNode = body.fieldChildNodes.map((v: BusinessVenderFieldChildNode) => {
                const schema = new BusinessVenderFieldChildNode();
                v.businessVenderField = query;
                return Object.assign(schema, v);
            });

            if (paramChildNode.length > 0) {
                await serviceChild.post(paramChildNode);
            }

            await Object.assign(query, { serviceChild: await serviceChild.gets(businessVenderField) });
            query.informationType = query.informationType.id as any;
            query.fieldType = query.fieldType.id as any;

            responseJson(res, [query], method, 'success');
        } catch (error) {
            tryCatch(res, error);
        }
    },
];

const apiPatch = [
    [
        businessVenderPermission.apply(this),
        check('fieldChildNodes')
            .optional()
            .isArray(),
    ],
    async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req);
            const method: RequestRole = req.method.toString() as any;

            if (!errors.isEmpty()) {
                responseJson(res, errors.array(), method, 'invalid');
                return;
            }

            const service = new ServiceBusinessVenderField();
            const serviceChild = new ServiceBusinessVenderInformationChildNode();
            const businessVenderField = new BusinessVenderField();
            const body = req.body;
            delete businessVenderField.business;
            delete businessVenderField.createdAt;
            delete businessVenderField.updatedAt;

            const informationType = new Code();
            informationType.id = body.informationType;
            const fieldType = new Code();
            fieldType.id = body.fieldType;

            businessVenderField.id = req.user.vender.id;
            businessVenderField.name = body.name;
            businessVenderField.require = body.require;
            businessVenderField.informationType = body.informationType;
            businessVenderField.fieldType = body.fieldType;

            // select box를 선택한 경우
            if (typeof body.fieldChildNodes !== 'undefined') {
                if (body.fieldChildNodes.length > 0) {
                    // 만약 자식이 줄어 들었다면, 업데이트에 포함이 되지 않은 자식 같은 경우는 삭제 해줘야 한다.
                    const deleteTargetQuery = await serviceChild.get(businessVenderField);
                    // 아이디가 없는 경우는 새로운 입력이기 대문에 아이디를 넣어준다.
                    const paramChildNode = await body.fieldChildNodes.map((v: BusinessVenderFieldChildNode) => {
                        const schema = new BusinessVenderFieldChildNode();
                        if (!v.hasOwnProperty('id')) {
                            v.businessVenderField = businessVenderField;
                        }
                        delete v.createdAt;
                        delete v.updatedAt;
                        return Object.assign(schema, v);
                    });
                    await serviceChild.post(paramChildNode);
                }
            }

            // 새로 입력 하는 타입에서 business_vender_field_id 값을 빼줘야 한다.
            const query = await service.post(businessVenderField);

            // 자식 노드들이 업데이트가 됐다면, 주입해준다.
            if (body.fieldChildNodes.length > 0) {
                Object.assign(query, { fieldChildNodes: await serviceChild.gets(businessVenderField) });
            }

            responseJson(res, [query], method, 'success');
        } catch (error) {
            tryCatch(res, error);
        }
    },
];

const apiGets = [
    [businessAdminPermission.apply(this)],
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

            const companyInformation = query.filter((v: any) => {
                return v.informationType === 4;
            });

            const informationType = query.filter((v: any) => {
                return v.informationType === 5;
            });

            const manager = query.filter((v: any) => {
                return v.informationType === 6;
            });

            responseJson(
                res,
                [
                    {
                        companyInformation: companyInformation,
                        informationType: informationType,
                        manager: manager,
                    },
                ],
                method,
                'success',
            );
        } catch (error) {
            tryCatch(res, error);
        }
    },
];

const apiGet = [
    [businessVenderPermission.apply(this)],
    async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req);
            const method: RequestRole = req.method.toString() as any;

            if (!errors.isEmpty()) {
                responseJson(res, errors.array(), method, 'invalid');
                return;
            }

            const query = req.user.vender;
            delete query.createdAt;
            delete query.updatedAt;

            query.fieldChildNodes = query.BusinessVenderFieldChildNode.map((v: BusinessVenderFieldChildNode) => {
                delete v.createdAt;
                delete v.updatedAt;
                return v;
            });

            // query.informationType = query.informationType.id;
            // query.fieldType = query.fieldType.id;

            responseJson(res, [query], method, 'success');
        } catch (error) {
            tryCatch(res, error);
        }
    },
];

const apiDeleteAll = [
    [businessAdminPermission.apply(this)],
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

            const informationQuery = await service.get(business);
            if (informationQuery) {
                const query = await service.deleteAll(business);
                // console.log('query:', query);
                responseJson(res, [query], method, 'delete');
            } else {
                responseJson(res, [], method, 'invalid');
            }
        } catch (error) {
            tryCatch(res, error);
        }
    },
];

const apiDelete = [
    [businessVenderPermission.apply(this)],
    async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req);
            const method: RequestRole = req.method.toString() as any;

            if (!errors.isEmpty()) {
                responseJson(res, errors.array(), method, 'invalid');
                return;
            }

            const service = new ServiceBusinessVenderField();
            const venderInformation = (new BusinessVenderField().id = req.user.vender.id);
            const query = await service.delete(venderInformation);
            responseJson(res, [query], method, 'delete');
        } catch (error) {
            tryCatch(res, error);
        }
    },
];

const apiDeleteChildNode = [
    [
        businessVenderPermission.apply(this),
        param('fieldChildNodeId')
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

        const service = new ServiceBusinessVenderFieldChildNode();
        const businessVenderFieldChildNode = new BusinessVenderFieldChildNode();
        const businessVenderField = new BusinessVenderField();
        const fieldChildNodeId = req.params.fieldChildNodeId;
        businessVenderField.id = req.user.vender.id;
        businessVenderFieldChildNode.id = fieldChildNodeId;
        const venderFieldChildNodeQuery = await service.getByBusinessVenderField(
            businessVenderField,
            businessVenderFieldChildNode,
        );

        console.log('venderFieldChildNodeQuery:', venderFieldChildNodeQuery);

        if (!venderFieldChildNodeQuery) {
            responseJson(
                res,
                [
                    {
                        value: fieldChildNodeId,
                        msg: 'You are not authorized or have no data..',
                        param: 'fieldChildNodeId',
                        location: 'params',
                    },
                ],
                method,
                'success',
            );
            return;
        }

        businessVenderFieldChildNode.id = venderFieldChildNodeQuery.id;
        const query = await service.delete(businessVenderFieldChildNode);

        responseJson(res, [query], method, 'delete');
    },
];

export default {
    apiPost,
    apiDelete,
    apiGet,
    apiGets,
    apiDeleteAll,
    apiPatch,
    apiDeleteChildNode,
    apiInit,
};
