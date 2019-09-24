import { BusinessVenderFavorite } from '../../entity/mysql/entities/MysqlBusinessVenderFavorite';
import { responseJson, RequestRole, tryCatch } from '../../util/common';
import { validationResult, check, param } from 'express-validator';
import { Request, Response } from 'express';
import ServiceBusinessVenderFavorite from '../../service/ServiceBusinessVenderFavorite';
import { User } from '../../entity/mysql/entities/MysqlUser';
import ServiceUserPermission from '../../service/ServiceUserPermission';
import { BusinessVender } from '../../entity/mysql/entities/MysqlBusinessVender';
import { Business } from '../../entity/mysql/entities/MysqlBusiness';
import { adminBusinessVenderPermission } from '../../util/permission';

const apiGets = [
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
            const business = new Business();
            user.id = req.user.users[0].id;
            business.id = req.user.business.id;
            const query = await service._getByUserWithBusinessVender(user, business);
            query.map(v => {
                v.businessVenders.map(m => {
                    m.businessVenderFieldValues = m.businessVenderFieldValues.filter(f => {
                        return f.businessVenderField.name === '기업명';
                    });
                    return m;
                });
            });
            responseJson(res, query, method, 'success');
        } catch (error) {
            tryCatch(res, error);
        }
    },
];

const apiPost = [
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
            const businessVender = new BusinessVender();
            const business = new Business();
            const businessVenderFavorite = new BusinessVenderFavorite();
            user.id = req.user.users[0].id;
            business.id = req.user.business.id;
            businessVender.id = Number(req.params.venderId);

            businessVenderFavorite.user = user;
            businessVenderFavorite.businessVenders = [businessVender];
            businessVenderFavorite.businesses = [business];
            console.log('business vender favorite: \n', businessVenderFavorite);

            const duplicateCheck = await service._getByWhere(businessVenderFavorite);
            console.log('duplicateCheck ===== ', duplicateCheck);
            // 이미 등록되어 있는것이 있으면, 등록되어 있다고 표시 해줘야 한다.
            if (duplicateCheck) {
                responseJson(res, [{ message: 'Already exist.' }], method, 'success');
                return;
            }
            const query = await service.post(businessVenderFavorite);
            responseJson(res, [query], method, 'success');
        } catch (error) {
            tryCatch(res, error);
        }
    },
];

const apiDelete = [
    [adminBusinessVenderPermission.apply(this)],
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
            const businessVender = new BusinessVender();
            const business = new Business();
            const businessVenderFavorite = new BusinessVenderFavorite();
            user.id = req.user.id;
            business.id = req.user.business.id;
            businessVender.id = req.params.venderId;

            businessVenderFavorite.user = user;
            businessVenderFavorite.businessVenders = [businessVender];
            businessVenderFavorite.businesses = [business];
            const query = await service._deleteByWhere(businessVenderFavorite);
            responseJson(res, [query], method, 'delete');
        } catch (error) {
            tryCatch(res, error);
        }
    },
];

export default { apiGets, apiPost, apiDelete };
