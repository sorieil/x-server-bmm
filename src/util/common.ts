import { RequestRole } from './common';
import { Response } from 'express';
import logger from './logger';
import { isArray } from 'util';
import { getManager } from 'typeorm';
export type RequestRole = 'POST' | 'GET' | 'PATCH' | 'DELETE';
type ResponseRole = 'success' | 'invalid' | 'delete' | 'fails';
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
export const responseJson = (
    res: Response,
    data: any[],
    requestType: RequestRole,
    responseType: ResponseRole,
): void => {
    console.log('-----------------\n');
    // if (typeof res.req.user.business !== undefined) {
    // console.log('Business id: ', typeof res.req.user.business);
    // }
    console.log('Request body-----* \n', res.req.body);
    // console.log('Response body-----* \n', data);
    console.log(
        `<<<<<<<<<<<<< Log End <<<<<<<<<<<< URL => [${res.req.originalUrl}]`,
    );

    if (responseType === 'success') {
        if (data.length > 0 && isArray(data)) {
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
                result: [],
            });
        }
    } else if (responseType === 'delete') {
        if (data.length > 0) {
            const code = responseRole[requestType].success;
            console.log(data);
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
            message: data,
        });
    }
};

export const tryCatch = (res: Response, error: any): Response => {
    logger.error('try catch error: ' + error);
    // getManager('mysqlDB').connection.close();
    return res.status(500).json({
        resCode: 500,
        message: 'Server error',
    });
};
