import { responseJson, RequestRole, tryCatch } from '../../util/common';
import { validationResult, check } from 'express-validator';
import { Request, Response } from 'express';
import ServiceBusinessVender from '../../service/ServiceBusinessVender';
import { Business } from '../../entity/mysql/entities/MysqlBusiness';
import ServiceBusinessVenderFavorite from '../../service/ServiceBusinessVenderFavorite';
import { User } from '../../entity/mysql/entities/MysqlUser';

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

            const service = new ServiceBusinessVenderFavorite();
            const user = new User();
            user.id = req.params.businessId;
            const query = await service.getByUser(user);
            responseJson(res, query, method, 'success');
        } catch (error) {
            tryCatch(res, error);
        }
    },
];

export default { apiGet };
