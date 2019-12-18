import { ServiceBusinessTime } from './../../service/ServiceBusinessTime';
import { Business } from '../../entity/mysql/entities/MysqlBusiness';
import { Request, Response } from 'express';
import { RequestRole, responseJson, tryCatch } from '../../util/common';
import { validationResult, param } from 'express-validator';

/**
 * 내 스케쥴 보기에서 사용
 */
const apiGet = [
    [
        param('requestType')
            .equals('vendor')
            .optional(),
    ],
    async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req);
            const method: RequestRole = req.method.toString() as any;

            if (!errors.isEmpty()) {
                responseJson(res, errors.array(), method, 'invalid');
                return;
            }

            const requestType = req.params.requestType;

            const serviceBusinessTime = new ServiceBusinessTime();
            const business = new Business();
            business.id = req.user.business.id;
            const businessTimeQuery = await serviceBusinessTime.get(business);
            delete businessTimeQuery.id;

            // 일반적으로 예약화면에서 주최사가 정해놓은 시간만 가져오면 되기때문에..
            if (requestType === 'vendor') {
                responseJson(
                    res,
                    [{ businessTime: businessTimeQuery }],
                    method,
                    'success',
                );
                return;
            }
            if (req.user.users[0].type === 'buyer') {
                responseJson(
                    res,
                    [
                        {
                            businessTime: businessTimeQuery,
                            userBuyer: req.user.users[0].userBuyer,
                        },
                    ],
                    method,
                    'success',
                );
            } else {
                const businessVendorManagerQuery = await serviceBusinessTime._getBusinessVendorManagerByBusinessVendorManager(
                    req.user.users[0].businessVendorManager,
                );

                businessVendorManagerQuery.businessVendorFieldManagerValues.map(
                    (v: any) => {
                        delete v.createdAt;
                        delete v.updatedAt;
                        const fieldType =
                            v.businessVendorField.fieldType.columnType;
                        if (fieldType === 'idx') {
                            v.value = v[fieldType].id || null;
                        } else {
                            v.value = v[fieldType] || null;
                        }
                        delete v.text;
                        delete v.textarea;
                        delete v.idx;
                        return v;
                    },
                );

                responseJson(
                    res,
                    [
                        {
                            businessTime: businessTimeQuery,
                            businessVendorManager: businessVendorManagerQuery,
                        },
                    ],
                    method,
                    'success',
                );
            }
        } catch (error) {
            tryCatch(res, error);
        }
    },
];

export default {
    apiGet,
};
