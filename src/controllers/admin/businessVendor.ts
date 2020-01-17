import { BusinessVendorFieldChildNode } from './../../entity/mysql/entities/MysqlBusinessVendorFieldChildNode';
import { Request, Response } from 'express';
import { BusinessVendorFieldValue } from './../../entity/mysql/entities/MysqlBusinessVendorFieldValue';
import { BusinessVendor } from './../../entity/mysql/entities/MysqlBusinessVendor';
import { responseJson, RequestRole, tryCatch } from '../../util/common';
import { Business } from '../../entity/mysql/entities/MysqlBusiness';
import { validationResult, param, body } from 'express-validator';
import { CheckPermissionBusinessForAdmin } from '../../util/permission';
import { Admin } from '../../entity/mysql/entities/MysqlAdmin';
import { ServiceBusinessPermission } from '../../service/ServiceBusinessPermission';
import { BusinessVendorField } from '../../entity/mysql/entities/MysqlBusinessVendorField';
import { Code } from '../../entity/mysql/entities/MysqlCode';
import ServiceBusinessVendor from '../../service/ServiceBusinessVendor';
import ServiceBusinessCode from '../../service/ServiceBusinessCode';
import ServiceBusinessVendorField from '../../service/ServiceBusinessVendorField';

/**
 * @description
 * 커스텀 필드의 타입이 존재 하는지 체크한다.
 *
 * @returns 없는 코드 일경우 리젝을 한다.
 */
const CheckExistingBusinessVendorFieldType = () =>
    param('informationType').custom(async (value, { req }) => {
        const service = new ServiceBusinessVendor();
        const code = new Code();
        code.id = value;
        const codeQuery = await service._getByCode(code);
        if (!codeQuery) {
            return Promise.reject(
                `Does not exist '${value}' informationType key.`,
            );
        }
    });
/**
 * @requires vendorId
 *
 * @description
 * 비즈니스 아이디로 관리자가 소유 하고 있는 밴더 인지 체크하고, 밴더 정보를 리턴한다.
 *
 * @target 관리자
 *
 * @returns vendor
 */
const CheckPermissionBusinessVendor = () =>
    param('vendorId').custom((value, { req }) => {
        const businessVendor = new BusinessVendor();
        const service = new ServiceBusinessVendor();
        const business = new Business();

        if (!value) {
            return Promise.reject('Invalid insert data.');
        }

        const admin = new Admin();
        admin.id = req.user.admins[0];

        businessVendor.id = value;
        return new Promise(async resolve => {
            const businessQuery = await new ServiceBusinessPermission()._getBusinessByAdmin(
                admin,
            );

            if (!businessQuery) {
                resolve(null);
            }

            business.id = businessQuery.id;

            const query = await service._getWithBusiness(
                businessVendor,
                business,
            );

            resolve(query);
        }).then(result => {
            if (result === null) {
                return Promise.reject(
                    'You are not authorized or have no data.',
                );
            }

            if (result) {
                Object.assign(req.user, { vendor: result, business: business });
            } else {
                return Promise.reject(
                    'You are not authorized or have no data.',
                );
            }
        });
    });

/**
 * 비즈니스의 상태 값을 가져온다. Header, status
 */
const apiGet = [
    [CheckPermissionBusinessVendor.apply(this)],
    async (req: Request, res: Response) => {
        try {
            const method: RequestRole = req.method.toString() as any;
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                responseJson(res, errors.array(), method, 'invalid');
                return;
            }
            const query = req.user.vendor;

            delete query.createdAt;
            delete query.updatedAt;
            query.businessCode = query.businessCode.code;
            query.businessVendorFieldValues.map((j: any) => {
                console.log(j);
                delete j.createdAt;
                delete j.updatedAt;

                // 빈값이 있는 경우도  false로 보기 때문에 분기 처리를 해줘야 한다.
                j.value =
                    j.text !== null
                        ? j.text
                        : null || j.textarea !== null
                        ? j.textarea
                        : null || j.idx.id;

                delete j.text;
                delete j.textarea;
                delete j.idx;

                return j;
            });

            // console.log('query: ', query);

            if (query) {
                responseJson(res, [query], method, 'success');
            } else {
                responseJson(res, [], method, 'success');
            }
        } catch (error) {
            tryCatch(res, error);
        }
    },
];

const apiGetField = [
    [
        CheckPermissionBusinessForAdmin.apply(this),
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

            const service = new ServiceBusinessVendor();
            const business = new Business();
            const informationType = new Code();
            business.id = req.user.business.id;
            informationType.id = Number(req.params.informationTypeId);
            const query = await service._getField(business, informationType);

            console.log('query:', query);

            const companyInformation = query.filter((v: any) => {
                return v.informationType.id === 4;
            });

            const vendorInformation = query.filter((v: any) => {
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
                        vendorInformation: vendorInformation,
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
    [CheckPermissionBusinessForAdmin.apply(this)],
    async (req: Request, res: Response) => {
        try {
            const method: RequestRole = req.method.toString() as any;
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                responseJson(res, errors.array(), method, 'invalid');
                return;
            }

            const service = new ServiceBusinessVendor();
            const business = new Business();
            business.id = req.user.business.id;
            const query = await service._getByBusiness(business);
            query.map(async (v: any) => {
                delete v.createdAt;
                delete v.updatedAt;
                v.businessCode = v.businessCode.code;
                await v.businessVendorFieldValues.map(
                    (j: any, index: number) => {
                        j.value = j.text || j.textarea || j.idx;
                        delete j.createdAt;
                        delete j.updatedAt;
                        delete j.text;
                        delete j.textarea;
                        delete j.idx;
                        return j;
                    },
                );
                return v;
            });

            responseJson(res, query, method, 'success');
        } catch (error) {
            tryCatch(res, error);
        }
    },
];

const apiGetInformationType = [
    [
        CheckPermissionBusinessVendor.apply(this),
        CheckExistingBusinessVendorFieldType.apply(this),
    ],
    async (req: Request, res: Response) => {
        try {
            const method: RequestRole = req.method.toString() as any;
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                responseJson(res, errors.array(), method, 'invalid');
                return;
            }

            const service = new ServiceBusinessVendor();
            const businessVendor = new BusinessVendor();
            const informationType = req.params.informationType;
            businessVendor.id = req.user.vendor.id;
            const query = await service._getByVendor(businessVendor);

            query.businessCode = query.businessCode.code as any;
            query.businessVendorFieldValues.filter((j: any) => {
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
    [CheckPermissionBusinessForAdmin.apply(this)],
    async (req: Request, res: Response) => {
        try {
            const method: RequestRole = req.method.toString() as any;
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                responseJson(res, errors.array(), method, 'invalid');
                return;
            }

            const businessVendor = new BusinessVendor();
            const service = new ServiceBusinessVendor();
            const serviceBusinessCode = new ServiceBusinessCode();
            const business = new Business();
            const body = req.body.data;

            console.log('===========================');
            console.log(body);

            // 사용하지 않는 코드를 가져온다.
            const businessCodeQuery = await new ServiceBusinessCode().getNotUseOneCode();
            if (!businessCodeQuery) {
                responseJson(
                    res,
                    [{ message: '사용가능한 코드가 없습니다.' }],
                    method,
                    'invalid',
                );
                return;
            }

            // 비즈니스 설정
            business.id = req.user.business.id;
            businessVendor.business = business;

            // 비즈니스 코드 저장
            businessVendor.businessCode = businessCodeQuery;

            // 밴더 기본정보 저장
            await service.post(businessVendor);

            // 비즈니스 코드 상태 변경
            businessCodeQuery.use = 'yes';
            businessCodeQuery.businessVendor = businessVendor;
            await serviceBusinessCode.post(businessCodeQuery);

            const query: BusinessVendorFieldValue[] = [];

            // 필드 조회 및 데이터 버킷 저장
            for (let field of body) {
                console.log('field------------------------>', field);
                const businessVendorFieldValue = new BusinessVendorFieldValue();
                const businessVendorField = new BusinessVendorField();
                businessVendorField.id = field.id; // field 아이

                const fieldTypeQuery = await service.checkFieldType(
                    businessVendorField,
                ); // 필드가 어떤 타입인지 체크

                // text textarea idx 로 조회 해서 구분해줘야 한다.
                // 필드 정보가 없으면, 잘못된 field id 값을 입력한 것이다.
                if (!fieldTypeQuery) {
                    responseJson(
                        res,
                        [
                            {
                                message: `The parameter field id ${parseInt(
                                    field,
                                    10,
                                )} of  does not exist.`,
                            },
                        ],
                        method,
                        'invalid',
                    );
                    return;
                }

                if (fieldTypeQuery.fieldType.columnType === 'text') {
                    businessVendorFieldValue.text = field.value;
                } else if (fieldTypeQuery.fieldType.columnType === 'textarea') {
                    businessVendorFieldValue.textarea = field.value;
                } else {
                    businessVendorFieldValue.idx = Number(field.value) as any;
                }
                businessVendorFieldValue.businessVendorField = businessVendorField; // 필드의 아아디 값 지정
                businessVendorFieldValue.businessVendor = businessVendor;
                query.push(businessVendorFieldValue);
            }

            // 입력한 필드의 값을 기준으로 데이터를 저장해주면, search를 위해서 데이터를 시리얼라이즈 해준다. 그리고 별도의 테이블에 저장한다.
            await service._postVendorFieldValue(query);
            const businessVendorQuery = await service.get(businessVendor);
            businessVendorQuery.businessCode = businessVendorQuery.businessCode
                .code as any;
            businessVendorQuery.businessVendorFieldValues.map((v: any) => {
                delete v.createdAt;
                delete v.updatedAt;
                const fieldType = v.businessVendorField.fieldType.columnType;
                if (fieldType === 'idx') {
                    v.value = v[fieldType].id || null;
                } else {
                    v.value = v[fieldType] || null;
                }
                delete v.text;
                delete v.textarea;
                delete v.idx;
                v.businessVendorField.informationType =
                    v.businessVendorField.informationType.id;
                v.businessVendorField.fieldType =
                    v.businessVendorField.fieldType.columnType;
                // j.businessVendorField = j.businessVendorField.id;
                return v;
            });

            // 타임 테이블을 저장한다.
            await service.cloneFormBusinessTimeTableListsToBusinessVendor(
                businessVendorQuery,
                business,
            );

            responseJson(res, [businessVendorQuery], method, 'success');
        } catch (error) {
            tryCatch(res, error);
        }
    },
];

const apiPatch = [
    [CheckPermissionBusinessVendor.apply(this)],
    async (req: Request, res: Response) => {
        try {
            const method: RequestRole = req.method.toString() as any;
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                responseJson(res, errors.array(), method, 'invalid');
                return;
            }

            const service = new ServiceBusinessVendor();
            // const businessVendor = new BusinessVendor();
            const body: {
                id: number;
                value: string;
            }[] = req.body.data;

            // console.log('body => \n', body);

            // 밴더 인증후 밴더 아이디 지정
            const vendor = req.user.vendor;
            // businessVendor.id = vendor.id;
            // console.log('vender id:', vendor.id);
            console.log('========= BODY ========== \n', body);

            const businessVendorValueBucket: BusinessVendorFieldValue[] = [];
            for (const item of body) {
                if (!item.value) {
                    console.log('계속 value:', item.value);
                    continue;
                }

                console.log('item id : ', item);

                const businessVendorValue = new BusinessVendorFieldValue();

                // 저장할 데이터 테이블과 맵핑
                businessVendorValue.id = item.id;
                businessVendorValue.businessVendor = vendor.id; // 미들웨어에서 가져옴

                // 기존 데이터 가져옴
                let businessVendorFieldValueQuery = await service._getByVendorFieldValue(
                    businessVendorValue,
                );

                // 필드값이 없을 경우. 여기에서 데이터를 새로 저장 해야 한다.
                if (!businessVendorFieldValueQuery) {
                    const serviceBusinessVendorField = new ServiceBusinessVendorField();
                    const businessVendorField = new BusinessVendorField();
                    businessVendorField.id = item.id;
                    businessVendorFieldValueQuery = new BusinessVendorFieldValue();
                    const newFieldType = await serviceBusinessVendorField._getWithBusiness(
                        businessVendorField,
                        req.user.business,
                    );

                    console.log(
                        'newFieldType:',
                        req.user.vendor,
                        newFieldType,
                        req.user.business,
                        item.id,
                    );
                    businessVendorFieldValueQuery.businessVendor =
                        req.user.vendor;
                    businessVendorFieldValueQuery.businessVendorField = newFieldType;
                }
                // 기존 데이터에서 필드 타입 가져옴
                const fieldType =
                    businessVendorFieldValueQuery.businessVendorField.fieldType;

                // 옵데이트를 해야 하는데 만약 데이터가 없다면,, 추가 해줘야 한다.
                console.log(
                    `================= FIELD TYPE: ${fieldType.columnType} => ${item.value} field id: ${businessVendorFieldValueQuery.businessVendorField.id} ================ \n `,
                );
                // 타입체크를 해서 타입에 따른 필드에 데이터를 세팅해준다.
                if (fieldType) {
                    if (fieldType.columnType === 'text') {
                        businessVendorFieldValueQuery.text = item.value;
                    } else if (fieldType.columnType === 'textarea') {
                        businessVendorFieldValueQuery.textarea = item.value;
                    } else {
                        // 값이 셀렉트 값인경우
                        const businessVendorFieldChildNode = new BusinessVendorFieldChildNode();
                        businessVendorFieldChildNode.id = Number(item.value);
                        businessVendorFieldValueQuery.idx = businessVendorFieldChildNode;
                    }
                } else {
                    // 조회를 했는데 데이터가 없는 경우 오류 출력
                    responseJson(
                        res,
                        [{ message: `${item.id} dose not exist.` }],
                        method,
                        'invalid',
                    );
                    return;
                }
                //
                businessVendorValueBucket.push(businessVendorFieldValueQuery);
            }

            // setTimeout에 0 초로 두면, setTimeout이 프로세스상 제일 마지막에 파싱되기 때문에 모든 스크립트가 파싱되고나서 실행된다.
            setTimeout(async () => {
                // 배열로 저장한다.
                const query = await service._postVendorFieldValue(
                    businessVendorValueBucket,
                );
                query.map((v: any) => {
                    delete v.businessVendor;
                    const fieldType =
                        v.businessVendorField.fieldType.columnType;
                    if (fieldType === 'idx') {
                        v.value = v[fieldType].id || null;
                    } else {
                        v.value = v[fieldType] || null;
                    }
                    delete v.text;
                    delete v.textarea;
                    delete v.idx;
                    return v;
                });
                responseJson(res, query, method, 'success');
            }, 0);
        } catch (error) {
            tryCatch(res, error);
        }
    },
];

const apiDelete = [
    CheckPermissionBusinessForAdmin.apply(this),
    body('data')
        .not()
        .isEmpty()
        .isArray(),
    async (req: Request, res: Response) => {
        try {
            const method: RequestRole = req.method.toString() as any;
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                responseJson(res, errors.array(), method, 'invalid');
                return;
            }
            const vendors = req.body.data;
            const service = new ServiceBusinessVendor();

            const deleteBucket: BusinessVendor[] = [];
            // console.log('vendors:', vendors);
            for (let vendor of vendors) {
                // console.log('vendor:', typeof vendor, parseInt(vendor, 10));
                const businessVendor = new BusinessVendor();
                businessVendor.id = parseInt(vendor, 10);
                businessVendor.business = req.user.business;
                deleteBucket.push(businessVendor);
            }

            // console.log('deleteBucket:', deleteBucket.length);

            const query = service.remove(deleteBucket);

            query
                .then(result => {
                    // console.log('삭제된 데이터가 있는지: ', result.length);
                    responseJson(res, result, method, 'delete');
                })
                .catch(() => {
                    responseJson(
                        res,
                        ['존재 하지 않는 밴더가 포함되어 있습니다.'],
                        method,
                        'invalid',
                    );
                    return;
                });
        } catch (error) {
            tryCatch(res, error);
        }
    },
];

// TODO : 밴더에서 빈값을 입력하면, 입력은 성공하나, 에러가 다시 나오고, 업데이트를 계속 하게 되면, keyword 필드에서 데이터가 너무 길게 들어간다는 에러가 또 나온다.

export default {
    apiGet,
    apiGets,
    apiPost,
    apiPatch,
    apiDelete,
    apiGetField,
    apiGetInformationType,
};
