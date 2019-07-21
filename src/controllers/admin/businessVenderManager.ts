import { BusinessVender } from '../../entity/mysql/entities/MysqlBusinessVender';
import { Request, Response } from 'express';
import { responseJson, RequestRole, tryCatch } from '../../util/common';
import { Business } from '../../entity/mysql/entities/MysqlBusiness';
import { check, validationResult, query, param } from 'express-validator';
import { Admin } from '../../entity/mysql/entities/MysqlAdmin';
import { ServiceBusinessPermission } from '../../service/ServiceBusinessPermission';
import ServiceBusinessVenderManager from '../../service/ServiceBusinessVenderManager';
import { BusinessVenderManager } from '../../entity/mysql/entities/MysqlBusinessVenderManager';

const businessVenderPermission = () =>
    param('venderId').custom((value, { req }) => {
        const businessVender = new BusinessVender();
        const service = new ServiceBusinessVenderManager();
        const business = new Business();

        if (!value) {
            return Promise.reject('Invalid insert data.');
        }

        const admin = new Admin();
        admin.id = req.user.admins[0];

        businessVender.id = value;
        return new Promise(async resolve => {
            // 비즈니스 조회
            const businessQuery = await new ServiceBusinessPermission()._ByAdmin(admin);

            if (!businessQuery) {
                resolve(null);
            }

            business.id = businessQuery.id;

            // 비즈니스 벤더로 조회
            const query = await service.getWithBusinessVender(businessVender, business);
            resolve(query);
        }).then((r: BusinessVender) => {
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
    [
        businessVenderPermission.apply(this),
        param('venderManagerId')
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

            const service = new ServiceBusinessVenderManager();
            const businessVenderManager = new BusinessVenderManager();

            businessVenderManager.id = req.params.venderManagerId;
            const query = await service.get(businessVenderManager);
            console.log('api get:', query);
            responseJson(res, query, method, 'success');
        } catch (error) {
            tryCatch(res, error);
        }
    },
];

const apiPost = [
    [
        businessVenderPermission.apply(this),
        check('name')
            .not()
            .isEmpty(),
        check('phone')
            .not()
            .isEmpty(),
        check('email')
            .not()
            .isEmpty()
            .isEmail(),
    ],
    async (req: Request, res: Response) => {
        try {
            const method: RequestRole = req.method.toString() as any;
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                responseJson(res, errors.array(), method, 'invalid');
                return;
            }

            const service = new ServiceBusinessVenderManager();
            const businessVenderManager = new BusinessVenderManager();
            const body = req.body;

            businessVenderManager.name = body.name;
            businessVenderManager.phone = body.phone;
            businessVenderManager.email = body.email;
            businessVenderManager.businessVender = req.user.vender;

            const query = await service.post(businessVenderManager);

            responseJson(res, [query], method, 'success');
        } catch (error) {
            tryCatch(res, error);
        }
    },
];

// 벤더 아이디로 매니저를 조회 한다.
const apiGets = [
    [businessVenderPermission.apply(this)],
    async (req: Request, res: Response) => {
        try {
            const method: RequestRole = req.method.toString() as any;
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                responseJson(res, errors.array(), method, 'invalid');
                return;
            }

            const service = new ServiceBusinessVenderManager();
            const businessVender = new BusinessVender();
            businessVender.id = req.user.vender.id;
            console.log('vender:', businessVender);
            const query = await service.gets(businessVender);

            responseJson(res, query, method, 'success');
        } catch (error) {
            tryCatch(res, error);
        }
    },
];

const apiPatch = [
    [
        businessVenderPermission.apply(this),
        param('venderManagerId')
            .not()
            .isEmpty(),
        check('email')
            .optional()
            .isEmail(),
    ],
    async (req: Request, res: Response) => {
        try {
            const method: RequestRole = req.method.toString() as any;
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                responseJson(res, errors.array(), method, 'invalid');
                return;
            }

            const service = new ServiceBusinessVenderManager();
            const businessVenderManager = new BusinessVenderManager();
            const body = req.body;

            businessVenderManager.id = Number(req.params.venderManagerId);
            businessVenderManager.name = body.name;
            businessVenderManager.phone = body.phone;
            businessVenderManager.email = body.email;

            const query = await service.post(businessVenderManager);

            responseJson(res, [query], method, 'success');
        } catch (error) {
            tryCatch(res, error);
        }
    },
];

const apiDelete = [
    [
        businessVenderPermission.apply(this),
        param('venderManagerId')
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

        const service = new ServiceBusinessVenderManager();
        const businessVenderManager = (new BusinessVenderManager().id = req.params.venderManagerId);
        const query = await service.delete(businessVenderManager);

        responseJson(res, [query], method, 'delete');
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
