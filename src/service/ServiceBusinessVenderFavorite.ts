import { BusinessFavorite } from './../entity/mysql/entities/MysqlBusinessFavorite';
import { BusinessVender } from '../entity/mysql/entities/MysqlBusinessVender';
import { BaseService } from './BaseService';
import { BusinessVenderField } from '../entity/mysql/entities/MysqlBusinessVenderField';
import { ServiceBusiness } from './ServiceBusiness';
import { Business } from '../entity/mysql/entities/MysqlBusiness';
import { Login } from '../entity/mysql/entities/MysqlLogin';
import { User } from '../entity/mysql/entities/MysqlUser';
export default class ServiceBusinessVenderFavorite extends BaseService {
    constructor() {
        super();
    }

    public async post(venderInformation: BusinessVenderField) {
        const query = this.mysqlManager(BusinessVenderField).save(venderInformation);
        return query;
    }

    public async getByUser(user: User) {
        const query = this.mysqlManager(BusinessFavorite).find({
            where: {
                user: user,
            },
        });

        return query;
    }

    public async delete(business: Business) {
        const query = this.mysqlManager(BusinessVenderField).delete({
            business: business,
        });

        return query;
    }
}
