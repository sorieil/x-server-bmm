import { BusinessVenderFavorite } from '../../entity/mysql/entities/MysqlBusinessVenderFavorite';
import { responseJson, RequestRole, tryCatch } from '../../util/common';
import { validationResult, check, param } from 'express-validator';
import { Request, Response } from 'express';
import ServiceBusinessVenderFavorite from '../../service/ServiceBusinessVenderFavorite';
import { User } from '../../entity/mysql/entities/MysqlUser';
import ServiceUserPermission from '../../service/ServiceUserPermission';
import { BusinessVender } from '../../entity/mysql/entities/MysqlBusinessVender';
import { Business } from '../../entity/mysql/entities/MysqlBusiness';

const businessVenderPermission = () =>
    param('venderId').custom((value, { req }) => {
        const businessVender = new BusinessVender();
        const service = new ServiceUserPermission();
        const business = new Business();

        if (!value) {
            return Promise.reject('Invalid insert data.');
        }

        businessVender.id = value;
        return new Promise(async resolve => {
            // 비즈니스 퍼미션과 다르게 유저는 비즈니스 아이디가 특정되어 있기 때문에,
            // 관리자 처럼 비즈니스 보유 여부를 체크 할 필요가 없다.
            // 로그인할때 이벤트 아이디로 req.user 에 담겨져 있다. (req.user.business)

            business.id = req.user.business.id;
            const query = await service._getWithBusiness(businessVender, business);
            resolve(query);
        }).then(r => {
            if (r) {
                Object.assign(req.user, { vender: r });
            } else {
                return Promise.reject('This is no vender id.');
            }
        });
    });

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
    [businessVenderPermission.apply(this)],
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
