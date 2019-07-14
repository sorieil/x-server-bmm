import { Request, Response } from 'express';
import ServiceBusinessCode from '../../service/ServiceBusinessCode';
import { responseJson, RequestRole } from '../../util/common';
import { businessPermission } from '../../util/permission';
import { validationResult } from 'express-validator';

const apiGet = [
    [businessPermission.apply(this)],
    async (req: Request, res: Response) => {
        const method: RequestRole = req.method.toString() as any;
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            responseJson(res, errors.array(), method, 'invalid');
            return;
        }

        const service = new ServiceBusinessCode();
        const query = await service.getNotUseOneCode();
        console.log(query);
        responseJson(res, [query], method, 'success');
    },
];

export default {
    apiGet,
};
