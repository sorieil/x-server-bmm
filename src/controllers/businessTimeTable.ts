import { Request, Response } from 'express';
import { RequestRole, responseJson, tryCatch } from '../util/common';
import { check, validationResult } from 'express-validator';

const apiPost = [
    [
        check()
            .not()
            .isEmpty(),
    ],
    async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req);
            const method: RequestRole = req.method.toString() as any;

            if (!errors.isEmpty()) {
                console.log(errors.isEmpty());
                responseJson(res, errors.array(), method, 'invalid');
                return;
            }
        } catch (error) {
            tryCatch(res, error);
        }
    },
];

export default {
    apiPost,
};
