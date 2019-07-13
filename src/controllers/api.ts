import ServiceAccount from '../service/ServiceAccount';
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Request, Response } from 'express';
import { check, validationResult } from 'express-validator';
import { NextFunction } from 'connect';
import { tryCatch, RequestRole, responseJson } from '../util/common';

const generateToken = [
    (req: Request, res: Response) => {
        try {
            const serviceAccount = new ServiceAccount();
            const method: RequestRole = req.method.toString() as any;
            const result = serviceAccount.generateToken('xsync-admin');
            result.then(query => responseJson(res, [query], method, 'success'));
        } catch (error) {
            tryCatch(res, error);
        }
    },
];

export default {
    generateToken,
};
