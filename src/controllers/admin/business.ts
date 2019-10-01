import { Request, Response } from 'express';
import { ServiceBusiness } from '../../service/ServiceBusiness';
import { responseJson, RequestRole, tryCatch } from '../../util/common';
import { Business } from '../../entity/mysql/entities/MysqlBusiness';
import { businessAdminPermission } from '../../util/permission';
import { validationResult } from 'express-validator';
import { Admin } from '../../entity/mysql/entities/MysqlAdmin';
import { BusinessEventBridge } from '../../entity/mysql/entities/MysqlBusinessEventBridge';
import ServiceBusinessEventBridge from '../../service/ServiceBusinessEventBridge';

/**
 * 비즈니스의 상태 값을 가져온다. Header, status
 */
const apiGet = [
    async (req: Request, res: Response) => {
        try {
            // admin 으로 비지니스 정보를 조회 하기 때문에 권한 검증은 필요 없음.
            const query = await new ServiceBusiness().get(req.user.admins[0]);
            const method: RequestRole = req.method.toString() as any;
            responseJson(res, [query], method, 'success');
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
                const eventBridgeQuery = await serviceEventBridge.post(eventBridge);
                business.businessEventBridge = eventBridgeQuery;
                business.admin = admin;
            }

            business.title = body.title;
            business.subTitle = body.subTitle;
            business.status = body.status;

            const query = await new ServiceBusiness().post(business);
            responseJson(res, [query], method, 'success');
        } catch (error) {
            tryCatch(res, error);
        }
    },
];

const apiDelete = [
    [businessAdminPermission.apply(this)],
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
