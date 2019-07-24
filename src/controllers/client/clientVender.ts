import { responseJson, RequestRole, tryCatch } from '../../util/common';
import { validationResult, check } from 'express-validator';
import { Request, Response } from 'express';
import ServiceBusinessVender from '../../service/ServiceBusinessVender';
import { Business } from '../../entity/mysql/entities/MysqlBusiness';
const userPermission = () => {};
/**
 *
 * 비즈니스 아이디로 벤더의 정보를 가져온다.
 * @method Get
 * @param businessId business.id
 *
 */
const apiGet = [
    [
        check('businessId')
            .not()
            .isEmpty(),
    ],
    async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req);
            const method: RequestRole = req.method.toString() as any;

            if (!errors.isEmpty()) {
                responseJson(res, errors.array(), method, 'invalid');
                return;
            }

            const service = new ServiceBusinessVender();

            responseJson(res, [], method, 'success');
        } catch (error) {
            tryCatch(res, error);
        }
    },
];

export default { apiGet };
