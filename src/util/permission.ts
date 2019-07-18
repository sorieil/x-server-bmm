import { param, header, check, query } from 'express-validator';
import { ServiceBusinessPermission } from '../service/ServiceBusinessPermission';
import { Admin } from '../entity/mysql/entities/MysqlAdmin';
import { Business } from '../entity/mysql/entities/MysqlBusiness';

export const businessPermission = () => {
    return param('permission').custom((value, { req }) => {
        const admin = new Admin();
        admin.id = req.user.admins[0];
        const query = new ServiceBusinessPermission()._ByAdmin(admin);
        return query.then((r: Business) => {
            if (r) {
                Object.assign(req.user, { business: r });
            } else {
                return Promise.reject('You don`t have permission or first insert business information..');
            }
        });
    });
};
