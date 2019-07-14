import { BusinessMeetingTimeList } from '../entity/mysql/entities/MysqlBusinessMeetingTimeList';
import { Business } from '../entity/mysql/entities/MysqlBusiness';
import { BusinessMeetingTime } from '../entity/mysql/entities/MysqlBusinessMeetingTime';
import { Request, Response } from 'express';
import { RequestRole, responseJson, tryCatch } from '../util/common';
import { check, validationResult, param } from 'express-validator';
import { ServiceBusinessTimeList } from '../service/ServiceBusinessTimeList';
import ServiceCodeTable from '../service/ServiceCodeTable';
import { CodeTable } from '../entity/mysql/entities/MysqlCodeTable';

const apiGet = [
    async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req);
            const method: RequestRole = req.method.toString() as any;

            if (!errors.isEmpty()) {
                responseJson(res, errors.array(), method, 'invalid');
                return;
            }

            const service = new ServiceCodeTable();
            const codeTable = new CodeTable();
            codeTable.category = req.params.category;
            let query;

            // 지정 카테고리가 있는 경우
            if (req.params.category) {
                query = await service.get(codeTable);
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
