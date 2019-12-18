import { BusinessVendorFavorite } from '../../entity/mysql/entities/MysqlBusinessVendorFavorite';
import { responseJson, RequestRole, tryCatch } from '../../util/common';
import { validationResult, check, param } from 'express-validator';
import { Request, Response } from 'express';
import ServiceBusinessVendorFavorite from '../../service/ServiceBusinessVendorFavorite';
import { User } from '../../entity/mysql/entities/MysqlUser';
import ServiceUserPermission from '../../service/ServiceUserPermission';
import { BusinessVendor } from '../../entity/mysql/entities/MysqlBusinessVendor';
import { Business } from '../../entity/mysql/entities/MysqlBusiness';
import { CheckPermissionAdminBusinessVendorForAdmin } from '../../util/permission';

const apiGets = [
    async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req);
            const method: RequestRole = req.method.toString() as any;

            if (!errors.isEmpty()) {
                responseJson(res, errors.array(), method, 'invalid');
                return;
            }

            const service = new ServiceBusinessVendorFavorite();
            const user = new User();
            const business = new Business();
            user.id = req.user.users[0].id;
            business.id = req.user.business.id;
            const query = await service._getByUserWithBusinessVendor(
                user,
                business,
            );
            query.map(v => {
                v.businessVendors.map(m => {
                    m.businessVendorFieldValues = m.businessVendorFieldValues.filter(
                        f => {
                            return f.businessVendorField.name === '기업명';
                        },
                    );
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

            const service = new ServiceBusinessVendorFavorite();
            const user = new User();
            const businessVendor = new BusinessVendor();
            const business = new Business();
            const businessVendorFavorite = new BusinessVendorFavorite();
            user.id = req.user.users[0].id;
            business.id = req.user.business.id;
            businessVendor.id = Number(req.params.vendorId);

            businessVendorFavorite.user = user;
            businessVendorFavorite.businessVendors = [businessVendor];
            businessVendorFavorite.businesses = [business];
            console.log('business vendor favorite: \n', businessVendorFavorite);

            const duplicateCheck = await service._getByWhere(
                businessVendorFavorite,
            );
            console.log('duplicateCheck ===== ', duplicateCheck);
            // 이미 등록되어 있는것이 있으면, 등록되어 있다고 표시 해줘야 한다.
            if (duplicateCheck) {
                responseJson(
                    res,
                    [{ message: 'Already exist.' }],
                    method,
                    'success',
                );
                return;
            }
            const query = await service.post(businessVendorFavorite);
            responseJson(res, [query], method, 'success');
        } catch (error) {
            tryCatch(res, error);
        }
    },
];

const apiDelete = [
    [CheckPermissionAdminBusinessVendorForAdmin.apply(this)],
    async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req);
            const method: RequestRole = req.method.toString() as any;

            if (!errors.isEmpty()) {
                responseJson(res, errors.array(), method, 'invalid');
                return;
            }

            const service = new ServiceBusinessVendorFavorite();
            const user = new User();
            const businessVendor = new BusinessVendor();
            const business = new Business();
            const businessVendorFavorite = new BusinessVendorFavorite();
            user.id = req.user.id;
            business.id = req.user.business.id;
            businessVendor.id = Number(req.params.vendorId);

            businessVendorFavorite.user = user;
            businessVendorFavorite.businessVendors = [businessVendor];
            businessVendorFavorite.businesses = [business];
            const query = await service._deleteByWhere(businessVendorFavorite);
            responseJson(res, [query], method, 'delete');
        } catch (error) {
            tryCatch(res, error);
        }
    },
];

export default { apiGets, apiPost, apiDelete };
