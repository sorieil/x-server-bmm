import { Request, Response } from 'express';
import { responseJson, RequestRole } from '../util/common';
import { validationResult } from 'express-validator';

const apiGet = [
    [''],
    async (req: Request, res: Response) => {
        const method: RequestRole = req.method.toString() as any;
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            responseJson(res, errors.array(), method, 'invalid');
            return;
        }

        responseJson(res, [], method, 'success');
    },
];

export default {
    apiGet,
};
