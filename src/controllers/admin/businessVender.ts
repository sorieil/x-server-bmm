import { BusinessVenderFieldValue } from './../../entity/mysql/entities/MysqlBusinessVenderFieldValue';
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
import { BusinessVenderField } from '../../entity/mysql/entities/MysqlBusinessVenderField';
import { Code } from '../../entity/mysql/entities/MysqlCode';
const businessVenderFieldTypePermission = () =>
    param('informationType').custom(async (v, { req }) => {
        const service = new ServiceBusinessVender();
        const code = new Code();
        code.id = v;
        const codeQuery = await service._getByCode(code);
        if (!codeQuery) {
            return Promise.reject(`Does not exist '${v}' informationType key.`);
        }
    });
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

            const query = await service._getWithBusiness(businessVender, business);

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
                j.value = j.text || j.textarea || j.idx;
                delete j.text;
                delete j.textarea;
                delete j.idx;
                // j.businessVenderField = j.businessVenderField.id;
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
            const query = await service._getField(business, informationType);

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
            const query = await service._getByBusiness(business);
            query.map((v: any) => {
                delete v.createdAt;
                delete v.updatedAt;
                v.businessCode = v.businessCode.code;
                v.businessVenderFieldValues.map((j: any) => {
                    delete j.createdAt;
                    delete j.updatedAt;
                    j.value = j.text || j.textarea || j.idx;
                    delete j.text;
                    delete j.textarea;
                    delete j.idx;
                    // j.businessVenderField = j.businessVenderField.id;
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

const apiGetInformationType = [
    [businessVenderPermission.apply(this), businessVenderFieldTypePermission.apply(this)],
    async (req: Request, res: Response) => {
        try {
            const method: RequestRole = req.method.toString() as any;
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                responseJson(res, errors.array(), method, 'invalid');
                return;
            }

            const service = new ServiceBusinessVender();
            const businessVender = new BusinessVender();
            const informationType = req.params.informationType;
            businessVender.id = req.user.vender.id;
            const query = await service._getByVender(businessVender);

            query.businessCode = query.businessCode.code as any;
            query.businessVenderFieldValues.filter((j: any) => {
                console.log('id:', j['Code']);
                return j.informationType.id === informationType;
            });

            responseJson(res, [query], method, 'success');
        } catch (error) {
            tryCatch(res, error);
        }
    },
];

/**
 * 밴더 값 입력 / 수정
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

            // 사용하지 않는 코드를 가져온다.
            const businessCodeQuery = await new ServiceBusinessCode().getNotUseOneCode();
            if (!businessCodeQuery) {
                responseJson(res, [{ message: '사용가능한 코드가 없습니다.' }], method, 'invalid');
                return;
            }

            // 비즈니스 설정
            business.id = req.user.business.id;
            businessVender.business = business;

            // 비즈니스 코드 저장
            businessVender.businessCode = businessCodeQuery;

            // 밴더 기본정보 저장
            await service.post(businessVender);

            // 비즈니스 코드 상태 변경
            businessCodeQuery.use = 'yes';
            businessCodeQuery.businessVender = businessVender;
            await new ServiceBusinessCode().post(businessCodeQuery);

            const query: BusinessVenderFieldValue[] = [];

            for (let field in body) {
                const businessVenderFieldValue = new BusinessVenderFieldValue();
                const businessVenderField = new BusinessVenderField();
                businessVenderField.id = parseInt(field, 10); // field 아이
                const fieldTypeQuery = await service.checkFieldType(businessVenderField); // 필드가 어떤 타입인지 체크

                // text textarea idx 로 조회 해서 구분해줘야 한다.
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
                } else if (fieldTypeQuery.fieldType.columnType === 'textarea') {
                    businessVenderFieldValue.textarea = body[field];
                } else {
                    businessVenderFieldValue.idx = Number(body[field]) as any;
                }
                businessVenderFieldValue.businessVenderField = businessVenderField; // 필드의 아아디 값 지정
                businessVenderFieldValue.businessVender = businessVender;
                query.push(businessVenderFieldValue);
            }

            await service._postVenderFieldValue(query);
            const businessVenderQuery = await service.get(businessVender);
            businessVenderQuery.businessCode = businessVenderQuery.businessCode.code as any;
            businessVenderQuery.businessVenderFieldValues.map((v: any) => {
                delete v.createdAt;
                delete v.updatedAt;
                v.value = v.text || v.textarea || v.idx;
                delete v.text;
                delete v.textarea;
                delete v.idx;
                // j.businessVenderField = j.businessVenderField.id;
                return v;
            });

            responseJson(res, [businessVenderQuery], method, 'success');
        } catch (error) {
            tryCatch(res, error);
        }
    },
];

const apiPatch = [
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
        const body: Array<{ id: number; businessVenderField: number; value: string }> = req.body.data;

        // 밴더 인증후 밴더 아이디 지정
        const vender = req.user.vender;
        businessVender.id = vender.id;

        const businessVenderValueQuery: Array<BusinessVenderFieldValue> = [];
        for (let i = 0; body.length > i; i++) {
            const businessVenderValue = new BusinessVenderFieldValue();
            businessVenderValue.id = body[i].id;
            const businessVenderFieldValueQuery = await service._getBVenderFieldValue(businessVenderValue);
            const fieldType = businessVenderFieldValueQuery.businessVenderField.fieldType;
            if (fieldType) {
                if (fieldType.columnType === 'text') {
                    businessVenderFieldValueQuery.text = body[i].value;
                } else if (fieldType.columnType === 'textarea') {
                    businessVenderFieldValueQuery.textarea = body[i].value;
                } else {
                    businessVenderFieldValueQuery.idx = Number(body[i].value) as any;
                }
            } else {
                responseJson(res, [{ message: `${body[i].businessVenderField} dose net exist.` }], method, 'invalid');
                return;
            }

            businessVenderValueQuery.push(businessVenderFieldValueQuery);
        }

        await setTimeout(async () => {
            const query = await service._postVenderFieldValue(businessVenderValueQuery);
            query.map((v: any) => {
                // v.businessVenderField = v.businessVenderField.id;
                delete v.businessVender;
                v.value = v.text || v.textarea || v.idx;
                delete v.text;
                delete v.textarea;
                delete v.idx;
                return v;
            });
            responseJson(res, query, method, 'success');
        }, 0);
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
    apiGetInformationType,
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
