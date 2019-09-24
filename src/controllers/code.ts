import { BusinessMeetingTimeList } from '../entity/mysql/entities/MysqlBusinessMeetingTimeList';
import { Business } from '../entity/mysql/entities/MysqlBusiness';
import { BusinessMeetingTime } from '../entity/mysql/entities/MysqlBusinessMeetingTime';
import { Request, Response } from 'express';
import { RequestRole, responseJson, tryCatch } from '../util/common';
import { check, validationResult, param } from 'express-validator';
import { ServiceBusinessTimeList } from '../service/ServiceBusinessTimeList';
import ServiceCode from '../service/ServiceCode';
import { Code } from '../entity/mysql/entities/MysqlCode';

const apiGet = [
    async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req);
            const method: RequestRole = req.method.toString() as any;

            if (!errors.isEmpty()) {
                responseJson(res, errors.array(), method, 'invalid');
                return;
            }

            const service = new ServiceCode();
            const code = new Code();
            code.category = req.query.category;
            let query;

            // 지정 카테고리가 있는 경우
            if (req.query.category) {
                query = await service.get(code);
            } else {
                // 지정 카테고리가 없는 경우
                query = await service.gets();
            }

            responseJson(res, query, method, 'success');
        } catch (error) {
            tryCatch(res, error);
        }
    },
];

export default {
    apiGet,
};
