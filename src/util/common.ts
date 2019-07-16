import { RequestRole } from './common';
import { Response } from 'express';
import logger from './logger';
export type RequestRole = 'POST' | 'GET' | 'PATCH' | 'DELETE';
type ResponseRole = 'success' | 'invalid' | 'delete';
export const responseRole = {
    POST: {
        success: 201,
        error: 409,
        errorMessage: 'Already exists data.',
    },
    GET: {
        success: 200,
        error: 200,
        errorMessage: 'No Content',
    },
    PATCH: {
        success: 201,
        error: 200,
        errorMessage: 'Failed to update the request.',
    },
    DELETE: {
        success: 200,
        error: 200,
        errorMessage: 'Failed to delete the request.',
    },
};
export const responseJson = (res: Response, data: Array<any>, requestType: RequestRole, responseType: ResponseRole) => {
    if (responseType === 'success') {
        if (data.length > 0) {
            const code = responseRole[requestType].success;
            res.status(code).json({
                resCode: code,
                message: 'Success',
                result: data,
            });
        } else {
            const message = responseRole[requestType].errorMessage;
            const code = responseRole[requestType].error;
            res.status(code).json({
                resCode: code,
                message: message,
                result: data,
            });
        }
    } else if (responseType === 'delete') {
        if (data.length > 0) {
            const code = responseRole[requestType].success;
            res.status(code).json({
                resCode: code,
                message: `${data[0].raw.affectedRows} is deleted.`,
                result: [],
            });
        } else {
            const code = responseRole[requestType].error;
            const message = responseRole[requestType].errorMessage;
            res.status(code).json({
                resCode: code,
                message: message,
                result: [],
            });
        }
    } else {
        res.status(400).json({
            resCode: 400,
            message: 'Input data is invalid',
            result: data,
        });
    }
};

export const tryCatch = (res: Response, error: any) => {
    logger.error('try catch error: ' + error);
    return res.status(500).json({
        resCode: 500,
        message: 'Server error',
    });
};
