import { Request, Response } from 'express';
import { ServiceBusiness } from '../service/ServiceBusiness';
import { responseJson, RequestRole, tryCatch } from '../util/common';
import { Business } from '../entity/mysql/entities/MysqlBusiness';

/**
 * 비즈니스의 상태 값을 가져온다. Header, status
 */
const apiGet = [
    async (req: Request, res: Response) => {
        try {
            // admin 으로 비지니스 정보를 조회 하기 때문에 권한 검증은 필요 없음.
            const query = await new ServiceBusiness().get(req.user);
            const method: RequestRole = req.method.toString() as any;
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
    async (req: Request, res: Response) => {
        try {
            const method: RequestRole = req.method.toString() as any;
            const business = new Business();
            const body = req.body;

            const queryBusiness = await new ServiceBusiness().get(req.user);
            if (queryBusiness.length > 0) {
                business.id = queryBusiness[0].id;
                // 비즈니스는 계정한 한번만 입력을 할 수 있기때문에, 널 표시, 수정은 Patch 메서드로~
                if (method === 'POST') {
                    responseJson(res, [], method, 'success');
                    return;
                }
            }

            business.title = body.title;
            business.subTitle = body.subTitle;
            business.status = body.status === 'true' ? true : false;
            business.admin = req.user.admin[0];

            const query = await new ServiceBusiness().post(business);
            responseJson(res, [query], method, 'success');
        } catch (error) {
            tryCatch(res, error);
        }
    },
];

export default {
    apiGet,
    apiPost,
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