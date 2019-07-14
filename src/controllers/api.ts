import ServiceAccount from '../service/ServiceAccount';
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Request, Response } from 'express';
import { check, validationResult } from 'express-validator';
import { NextFunction } from 'connect';
import { tryCatch, RequestRole, responseJson } from '../util/common';

const generateToken = [
    [
        check('type')
            .not()
            .isEmpty(),
    ],
    (req: Request, res: Response) => {
        try {
            const errors = validationResult(req);
            const method: RequestRole = req.method.toString() as any;

            if (!errors.isEmpty()) {
                responseJson(res, errors.array(), method, 'invalid');
                return;
            }

            const tokenType = req.body.type;
            const serviceAccount = new ServiceAccount();
            if (req.body.type === 'xsync-admin') {
                const result = serviceAccount.generateToken(tokenType);
                result.then(query => responseJson(res, [query], method, 'success'));
            } else {
                const result = serviceAccount.generateUserToken(tokenType);
                result.then(query => responseJson(res, [query], method, 'success'));
            }
        } catch (error) {
            tryCatch(res, error);
        }
    },
];

export default {
    generateToken,
};
