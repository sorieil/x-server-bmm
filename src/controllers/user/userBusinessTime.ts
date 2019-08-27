import { Business } from '../../entity/mysql/entities/MysqlBusiness';
import { Request, Response } from 'express';
import { RequestRole, responseJson, tryCatch } from '../../util/common';
import { validationResult, param } from 'express-validator';
import { userPermission } from '../../util/permission';
import { ServiceBusinessTime } from '../../service/ServiceBusinessTime';
import moment = require('moment');

const apiPost = [
    async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req);
            const method: RequestRole = req.method.toString() as any;

            if (!errors.isEmpty()) {
                responseJson(res, errors.array(), method, 'invalid');
                return;
            }

            responseJson(res, [], method, 'success');
        } catch (error) {
            tryCatch(res, error);
        }
    },
];

/**
 * 행사기간 동안 미팅이 가능한 시간과 인터벌 시간을 가져온다.
 */
const apiGets = [
    [userPermission.apply(this)],
    async (req: Request, res: Response) => {
        const method: RequestRole = req.method.toString() as any;
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            responseJson(res, errors.array(), method, 'invalid');
            return;
        }

        const service = new ServiceBusinessTime();
        const business = new Business();
        business.id = req.user.business.id; // passport 에서 주입한다.
        console.log('business:', business);
        const query = await service.get(business);

        responseJson(res, [query], method, 'success');
    },
];

/**
 * @description
 * 날짜 별로 타임 리스트를 가져온다.
 * @data 2019-01-02 식으로 데이터를 넣는다.
 */
const apiGet = [
    [
        userPermission.apply(this),
        param('date').custom((value, { req }) => {
            const test = moment(value).format('YYYY/MM/DD');
            console.log('test:', test);
            if (test === 'Invalid date') {
                return Promise.reject('Please input date format.');
            } else {
            }
        }),
    ],
    async (req: Request, res: Response) => {
        const method: RequestRole = req.method.toString() as any;
        const errors = validationResult(req);
        console.log('errors.isEmpty():', errors.isEmpty());
        if (!errors.isEmpty()) {
            responseJson(res, errors.array(), method, 'invalid');
            return;
        }

        const service = new ServiceBusinessTime();
        const business = new Business();
        business.id = req.user.business.id;
        console.log('business:', business);
        const query = await service.get(business);

        responseJson(res, [query], method, 'success');
    },
];

export default {
    apiPost,
    apiGets,
    apiGet,
};
