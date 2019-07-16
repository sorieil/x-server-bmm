import { BusinessCode } from './../../entity/mysql/entities/MysqlBusinessCode';
import { BusinessVender } from './../../entity/mysql/entities/MysqlBusinessVender';
import { Request, Response } from 'express';
import { ServiceBusiness } from '../../service/ServiceBusiness';
import { responseJson, RequestRole, tryCatch } from '../../util/common';
import { Business } from '../../entity/mysql/entities/MysqlBusiness';
import { check, validationResult, query, param } from 'express-validator';
import { businessPermission } from '../../util/permission';
import ServiceBusinessVender from '../../service/ServiceBusinessVender';
import ServiceBusinessCode from '../../service/ServiceBusinessCode';
import { Admin } from '../../entity/mysql/entities/MysqlAdmin';
import { ServiceBusinessPermission } from '../../service/ServiceBusinessPermission';

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
                return Promise.reject('You don`t have permission or first insert business information..');
            }

            if (r) {
                Object.assign(req.user, { vender: r });
            } else {
                return Promise.reject('You don`t have permission or first insert vender information..');
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

            responseJson(res, [req.user.vender], method, 'success');
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
    [
        businessPermission.apply(this),
        check('name')
            .not()
            .isEmpty(),
        check('ceoName')
            .not()
            .isEmpty(),
        check('establishmentDate')
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

            const businessVender = new BusinessVender();
            const service = new ServiceBusinessVender();
            const business = new Business();
            const body = req.body;

            business.id = req.user.business.id;

            businessVender.name = body.name;
            businessVender.ceoName = body.ceoName;
            businessVender.establishmentDate = body.establishmentDate;
            businessVender.business = business;

            // 사용하지 않는 코드를 가져온다.
            const businessCodeQuery = await new ServiceBusinessCode().getNotUseOneCode();
            if (!businessCodeQuery) {
                responseJson(res, [{ message: '사용가능한 코드가 없습니다.' }], method, 'invalid');
                return;
            }

            businessVender.businessCode = businessCodeQuery;

            const query = await service.post(businessVender);
            const businessCode = new BusinessCode();
            businessCode.id = businessCodeQuery.id;
            businessCode.use = 'yes';
            businessCode.businessVender = businessVender;
            await new ServiceBusinessCode().post(businessCode);
            responseJson(res, [query], method, 'success');
        } catch (error) {
            tryCatch(res, error);
        }
    },
];

const apiPatch = [
    [
        businessVenderPermission.apply(this),
        check('businessCategory')
            .not()
            .isEmpty()
            .isNumeric(),
        check('serviceCategory')
            .not()
            .isEmpty()
            .isNumeric(),
        check('serviceTarget')
            .not()
            .isEmpty(),
        check('serviceDescription')
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

        const service = new ServiceBusinessVender();
        const businessVender = new BusinessVender();
        const body = req.body;
        const vender = req.user.vender;
        await Object.assign(businessVender, vender, body);
        delete businessVender.createdAt;
        delete businessVender.updatedAt;

        const query = await service.post(businessVender);
        responseJson(res, [query], method, 'success');
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

        responseJson(res, [{ message: `${query.raw.affectedRows} is deleted.` }], method, 'success');
    },
];

export default {
    apiGet,
    apiGets,
    apiPost,
    apiPatch,
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
