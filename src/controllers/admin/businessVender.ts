import { BusinessVenderFieldValue } from './../../entity/mysql/entities/MysqlBusinessVenderFieldValue';
import { BusinessCode } from './../../entity/mysql/entities/MysqlBusinessCode';
import { BusinessVender } from './../../entity/mysql/entities/MysqlBusinessVender';
import { Request, Response } from 'express';
import { responseJson, RequestRole, tryCatch } from '../../util/common';
import { Business } from '../../entity/mysql/entities/MysqlBusiness';
import { check, validationResult, query, param } from 'express-validator';
import { businessPermission } from '../../util/permission';
import ServiceBusinessVender from '../../service/ServiceBusinessVender';
import ServiceBusinessCode from '../../service/ServiceBusinessCode';
import { Admin } from '../../entity/mysql/entities/MysqlAdmin';
import { ServiceBusinessPermission } from '../../service/ServiceBusinessPermission';
import { Code } from '../../entity/mysql/entities/MysqlCode';
import { BusinessVenderField } from '../../entity/mysql/entities/MysqlBusinessVenderField';

const businessVenderPermission = () =>
    param('venderId').custom((value, { req }) => {
        const businessVender = new BusinessVender();
        const service = new ServiceBusinessVender();
        const business = new Business();

        if (!value) {
            return Promise.reject('Invalid insert data.');
        }

        const admin = new Admin();
        admin.id = req.user.admins[0];

        businessVender.id = value;
        return new Promise(async resolve => {
            const businessQuery = await new ServiceBusinessPermission()._ByAdmin(admin);

            if (!businessQuery) {
                resolve(null);
            }

            business.id = businessQuery.id;

            const query = await service.getWithBusiness(businessVender, business);

            resolve(query);
        }).then(r => {
            if (r === null) {
                return Promise.reject('You are not authorized or have no data.');
            }

            if (r) {
                Object.assign(req.user, { vender: r });
            } else {
                return Promise.reject('You are not authorized or have no data.');
            }
        });
    });

/**
 * 비즈니스의 상태 값을 가져온다. Header, status
 */
const apiGet = [
    [businessVenderPermission.apply(this)],
    async (req: Request, res: Response) => {
        try {
            const method: RequestRole = req.method.toString() as any;
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                responseJson(res, errors.array(), method, 'invalid');
                return;
            }
            const query = req.user.vender;

            delete query.createdAt;
            delete query.updatedAt;
            query.businessCode = query.businessCode.code;
            query.businessVenderFieldValues.map((j: any) => {
                delete j.createdAt;
                delete j.updatedAt;
                j.value = j.text || j.textarea;
                delete j.text;
                delete j.textarea;
                j.businessVenderField = j.businessVenderField.id;
                return j;
            });

            responseJson(res, [query], method, 'success');
        } catch (error) {
            tryCatch(res, error);
        }
    },
];

const apiGetField = [
    [
        businessPermission.apply(this),
        param('informationTypeId')
            .not()
            .isEmpty(),
    ],
    async (req: Request, res: Response) => {
        try {
            const method: RequestRole = req.method.toString() as any;
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                responseJson(res, errors.array(), method, 'invalid');
                return;
            }

            const service = new ServiceBusinessVender();
            const business = new Business();
            const informationType = new Code();
            business.id = req.user.business.id;
            informationType.id = req.params.informationTypeId;
            const query = await service.getField(business, informationType);

            console.log('query:', query);

            const companyInformation = query.filter((v: any) => {
                return v.informationType.id === 4;
            });

            const venderInformation = query.filter((v: any) => {
                return v.informationType.id === 5;
            });

            const manager = query.filter((v: any) => {
                return v.informationType.id === 6;
            });

            console.log('companyInformation:', companyInformation);
            responseJson(
                res,
                [
                    {
                        defaultInformation: companyInformation,
                        venderInformation: venderInformation,
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

const apiGets = [
    [businessPermission.apply(this)],
    async (req: Request, res: Response) => {
        try {
            const method: RequestRole = req.method.toString() as any;
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                responseJson(res, errors.array(), method, 'invalid');
                return;
            }

            const service = new ServiceBusinessVender();
            const business = new Business();
            business.id = req.user.business.id;
            const query = await service.getByBusiness(business);
            query.map((v: any) => {
                delete v.createdAt;
                delete v.updatedAt;
                v.businessCode = v.businessCode.code;
                v.businessVenderFieldValues.map((j: any) => {
                    delete j.createdAt;
                    delete j.updatedAt;
                    j.value = j.text || j.textarea;
                    delete j.text;
                    delete j.textarea;
                    j.businessVenderField = j.businessVenderField.id;
                    return j;
                });
                return v;
            });

            responseJson(res, query, method, 'success');
        } catch (error) {
            tryCatch(res, error);
        }
    },
];

/**
 * 비즈니스의 상태값을 저장/ 수정 한다.
 */
const apiPost = [
    [businessPermission.apply(this)],
    async (req: Request, res: Response) => {
        try {
            const method: RequestRole = req.method.toString() as any;
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                responseJson(res, errors.array(), method, 'invalid');
                return;
            }

            const businessVender = new BusinessVender();
            const service = new ServiceBusinessVender();
            const business = new Business();

            const body = req.body;

            business.id = req.user.business.id;

            businessVender.business = business;

            // 사용하지 않는 코드를 가져온다.
            const businessCodeQuery = await new ServiceBusinessCode().getNotUseOneCode();
            if (!businessCodeQuery) {
                responseJson(res, [{ message: '사용가능한 코드가 없습니다.' }], method, 'invalid');
                return;
            }
            const query: BusinessVenderFieldValue[] = [];

            for (let field in body) {
                const businessVenderFieldValue = new BusinessVenderFieldValue();
                const businessVenderField = new BusinessVenderField();
                businessVenderField.id = parseInt(field, 10); // field 아이디
                if (field.toString() !== 'informationType') {
                    // await service.checkFieldType(businessVenderField); // 필드가 어떤 타입인지 체크
                    const fieldTypeQuery = await service.checkFieldType(businessVenderField); // 필드가 어떤 타입인지 체크
                    console.log('field type:', fieldTypeQuery);
                    // text textarea 로 조회 해서 구분해줘야 한다.
                    if (!fieldTypeQuery) {
                        responseJson(
                            res,
                            [{ message: `The parameter field id ${parseInt(field, 10)} of  does not exist.` }],
                            method,
                            'invalid',
                        );
                        return;
                    }
                    if (fieldTypeQuery.fieldType.columnType === 'text') {
                        businessVenderFieldValue.text = body[field];
                    } else {
                        businessVenderFieldValue.textarea = body[field];
                    }
                    businessVenderFieldValue.businessVenderField = businessVenderField; // 필드의 아아디 값 지정
                    query.push(businessVenderFieldValue);
                }
            }

            const venderQuery = await service.postVenderFieldValue(query);
            // console.log('venderQuery:', venderQuery);

            businessVender.businessCode = businessCodeQuery; // 밴더 코드 지정

            if (venderQuery.length > 0) {
                businessVender.businessVenderFieldValues = venderQuery;
            }
            await service.post(businessVender); // businessVenderFieldValue의 값을 저장
            delete businessVender.business;
            businessVender.businessCode = businessVender.businessCode.code as any;
            businessVender.businessVenderFieldValues.map((v: any) => {
                v.businessVenderField = v.businessVenderField.id;
                v.value = v.text || v.textarea;
                delete v.text;
                delete v.textarea;
                return v;
            });

            // 코드 상태 변경
            const businessCode = new BusinessCode();
            businessCode.id = businessCodeQuery.id;
            businessCode.use = 'yes';
            businessCode.businessVender = businessVender;
            await new ServiceBusinessCode().post(businessCode);
            responseJson(res, [businessVender], method, 'success');
        } catch (error) {
            tryCatch(res, error);
        }
    },
];

const apiPatch = [
    [
        businessVenderPermission.apply(this),
        check('data')
            .not()
            .isEmpty()
            .isArray(),
    ],
    async (req: Request, res: Response) => {
        const method: RequestRole = req.method.toString() as any;
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            responseJson(res, errors.array(), method, 'invalid');
            return;
        }

        const service = new ServiceBusinessVender();
        const businessVender = new BusinessVender();
        const body: Array<{ id: number; businessVenderField: number; value: string }> = req.body.data;
        const vender = req.user.vender;
        businessVender.id = vender.id;
        const businessVenderValeQuery: Array<BusinessVenderFieldValue> = [];
        for (let i = 0; body.length > i; i++) {
            const businessVenderValue = new BusinessVenderFieldValue();
            const businessVenderField = new BusinessVenderField();
            businessVenderValue.id = body[i].id;
            businessVenderValue.businessVender = businessVender;

            businessVenderField.id = body[i].businessVenderField; // field 아이디
            businessVenderValue.businessVenderField = businessVenderField;
            const fieldTypeQuery = await service.checkFieldType(businessVenderField); // 필드가 어떤 타입인지 체크
            if (fieldTypeQuery) {
                if (fieldTypeQuery.fieldType.columnType === 'text') {
                    businessVenderValue.text = body[i].value;
                } else {
                    businessVenderValue.textarea = body[i].value;
                }
            } else {
                responseJson(res, [{ message: `${body[i].businessVenderField} dose net exist.` }], method, 'invalid');
                return;
            }

            businessVenderValeQuery.push(businessVenderValue);
        }

        delete businessVender.updatedAt;

        const query = await service.postVenderFieldValue(businessVenderValeQuery);
        query.map((v: any) => {
            v.businessVenderField = v.businessVenderField.id;
            delete v.businessVender;
            v.value = v.text || v.textarea;
            delete v.text;
            delete v.textarea;
            return v;
        });
        responseJson(res, query, method, 'success');
    },
];

const apiDelete = [
    [businessVenderPermission.apply(this)],
    async (req: Request, res: Response) => {
        const method: RequestRole = req.method.toString() as any;
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            responseJson(res, errors.array(), method, 'invalid');
            return;
        }

        const service = new ServiceBusinessVender();
        const businessVender = new BusinessVender();
        businessVender.id = req.user.vender.id;
        const query = await service.delete(businessVender);

        responseJson(res, [query], method, 'delete');
    },
];

export default {
    apiGet,
    apiGets,
    apiPost,
    apiPatch,
    apiDelete,
    apiGetField,
};

/*
 check('title', 'Name cannot be blank')
            .not()
            .isEmpty(),
        check('email', 'Email is not valid').isEmail(),
        check('message', 'Message cannot be blank')
            .not()
            .isEmpty(),
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(200).json({ error: errors.array() });
        }
        */
