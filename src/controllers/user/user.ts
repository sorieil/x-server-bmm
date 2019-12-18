import { tryCatch } from './../../util/common';
import { Request, Response } from 'express';
import { responseJson, RequestRole } from '../../util/common';
import { validationResult } from 'express-validator';
const apiGet = [
    async (req: Request, res: Response) => {
        try {
            const method: RequestRole = req.method.toString() as any;
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                responseJson(res, errors.array(), method, 'invalid');
                return;
            }

            console.log(req.user.users[0]);

            responseJson(res, req.user.users, method, 'success');
        } catch (error) {
            tryCatch(res, error);
        }
    },
];

export default {
    apiGet,
};
