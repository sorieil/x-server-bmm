import { Request, Response } from 'express';
import { ServiceBusiness } from '../../service/ServiceBusiness';
import { responseJson, RequestRole, tryCatch } from '../../util/common';
import { Business } from '../../entity/mysql/entities/MysqlBusiness';
import { CheckPermissionBusinessForAdmin } from '../../util/permission';
import { validationResult } from 'express-validator';
import { Admin } from '../../entity/mysql/entities/MysqlAdmin';
import { BusinessEventBridge } from '../../entity/mysql/entities/MysqlBusinessEventBridge';
import ServiceBusinessEventBridge from '../../service/ServiceBusinessEventBridge';
import { BusinessVendorFieldType } from '../../service/ServiceBusinessVendorField';
import ServiceBusinessVendorField from '../../service/ServiceBusinessVendorField';
import { BusinessVendorField } from '../../entity/mysql/entities/MysqlBusinessVendorField';
import { Code } from '../../entity/mysql/entities/MysqlCode';

/**
 * 비즈니스의 상태 값을 가져온다. Header, status
 */
const apiGet = [
    async (req: Request, res: Response) => {
        try {
            // admin 으로 비지니스 정보를 조회 하기 때문에 권한 검증은 필요 없음.
            const query = await new ServiceBusiness().get(req.user.admins[0]);
            const method: RequestRole = req.method.toString() as any;
            if (query) {
                Object.assign(query, { eventId: req.user });
                responseJson(res, [query], method, 'success');
            } else {
                responseJson(
                    res,
                    [
                        {
                            message:
                                'Please input your company information first.',
                        },
                    ],
                    method,
                    'success',
                );
            }
        } catch (error) {
            tryCatch(res, error);
        }
    },
];

/**
 * 비즈니스의 상태값을 저장/ 수정 한다.
 */
const apiPost = [
    async (req: Request, res: Response) => {
        try {
            const method: RequestRole = req.method.toString() as any;
            const business = new Business();
            const body = req.body;
            const service = new ServiceBusiness();
            const admin = new Admin();
            admin.id = req.user.admins[0].id;
            // console.log('admin:', admin);
            const queryBusiness = await service.get(admin);
            if (queryBusiness) {
                business.id = queryBusiness.id;
                // 비즈니스는 계정한 한번만 입력을 할 수 있기때문에, 널 표시, 수정은 Patch 메서드로~
                if (method === 'POST') {
                    responseJson(res, [], method, 'success');
                    return;
                }
            } else {
                // 새로 입력하는 경우 이벤트 아이디와 브릿지를 해준다.
                // 모든 유저가 이벤트 아이디의 토큰을 xsync 2.0 에서 발급 받아, 이 값으로 이벤트 가입 여부를 확인한다.
                const eventBridge = new BusinessEventBridge();
                const serviceEventBridge = new ServiceBusinessEventBridge();
                eventBridge.eventId = req.user.eventId;
                const eventBridgeQuery = await serviceEventBridge.post(
                    eventBridge,
                );
                business.businessEventBridge = eventBridgeQuery;
                business.admin = admin;
            }

            // EventId 가 없으면, 저장을 해준다.
            business.title = body.title;
            business.subTitle = body.subTitle;
            business.status = body.status;

            // 비즈니스 정보를 입력/수정을 해준다.
            const query = await new ServiceBusiness().post(business);

            // 조회된 비즈니스 아이디가 없는 경우 필드 초기화를 해준다.
            // 새로 생긴 비즈니스 아이디가 있어야 한다.
            const serviceBusinessVendorField = new ServiceBusinessVendorField();
            const queryBusinessVendorField = await serviceBusinessVendorField._getByBusiness(
                query,
            );
            console.log('필드 조회 결과', queryBusinessVendorField.length);
            // 필드를 조회 했을때 필드가 없는 경우 초기화를 해준다.
            if (queryBusinessVendorField.length === 0) {
                console.log('필드 초기화 해줌');
                const initFields: BusinessVendorFieldType[] = [
                    {
                        name: '기업명',
                        require: 'yes',
                        informationType: 4,
                        fieldType: 1,
                    },
                    {
                        name: '노출명',
                        require: 'yes',
                        informationType: 4,
                        fieldType: 1,
                    },
                    {
                        name: '대표명',
                        require: 'no',
                        informationType: 4,
                        fieldType: 1,
                    },
                    {
                        name: '설립일',
                        require: 'no',
                        informationType: 4,
                        fieldType: 1,
                    },
                    {
                        name: '업체구분',
                        require: 'no',
                        informationType: 5,
                        fieldType: 3,
                    },
                    {
                        name: '제품/서비스',
                        require: 'no',
                        informationType: 5,
                        fieldType: 3,
                    },
                    {
                        name: '관심분야',
                        require: 'no',
                        informationType: 5,
                        fieldType: 1,
                    },
                    {
                        name: '제품소개',
                        require: 'no',
                        informationType: 5,
                        fieldType: 1,
                    },
                    {
                        name: '담당자명',
                        require: 'yes',
                        informationType: 6,
                        fieldType: 1,
                    },
                    {
                        name: '연락처',
                        require: 'yes',
                        informationType: 6,
                        fieldType: 1,
                    },
                    {
                        name: '이메일',
                        require: 'yes',
                        informationType: 6,
                        fieldType: 1,
                    },
                ];

                // 필드 입력
                return await new Promise(async resolve => {
                    const promiseBucket: any[] = [];
                    initFields.forEach(element => {
                        promiseBucket.push(
                            serviceBusinessVendorField.checkDuplicate(
                                element,
                                query,
                            ),
                        );
                    });

                    resolve(promiseBucket);
                }).then(async (process: object[]) => {
                    const result = await Promise.all(process);
                    const exists = result.filter(v => typeof v !== 'undefined');
                    if (exists.length === initFields.length) {
                        console.log('이미 필드가 존재 합니다.');
                    } else {
                        const insertData = await initFields.map(v => {
                            const businessVendorField = new BusinessVendorField();
                            const informationType = new Code();
                            informationType.id = v.informationType;
                            const fieldType = new Code();
                            fieldType.id = v.fieldType;
                            businessVendorField.name = v.name;
                            businessVendorField.business = business;
                            businessVendorField.require = 'yes';
                            businessVendorField.informationType = informationType;
                            businessVendorField.fieldType = fieldType;
                            return businessVendorField;
                        });
                        const queryBusinessVendorField = await serviceBusinessVendorField.postArray(
                            insertData,
                        );
                        console.log(
                            '필드가 생성되었습니다.',
                            queryBusinessVendorField,
                        );
                    }
                });
            }
            responseJson(res, [query], method, 'success');
        } catch (error) {
            tryCatch(res, error);
        }
    },
];

const apiDelete = [
    [CheckPermissionBusinessForAdmin.apply(this)],
    async (req: Request, res: Response) => {
        const method: RequestRole = req.method.toString() as any;
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            responseJson(res, errors.array(), method, 'invalid');
            return;
        }

        const service = new ServiceBusiness();
        const business = new Business();
        business.id = req.user.business.id;
        const query = await service.delete(business);

        responseJson(res, [query], method, 'delete');
    },
];

export default {
    apiGet,
    apiPost,
    apiDelete,
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
