import { BusinessFavorite } from './../entity/mysql/entities/MysqlBusinessFavorite';
import { BusinessVender } from '../entity/mysql/entities/MysqlBusinessVender';
import { BaseService } from './BaseService';
import { BusinessVenderInformationField } from '../entity/mysql/entities/MysqlBusinessVenderInformationField';
import { ServiceBusiness } from './ServiceBusiness';
import { Business } from '../entity/mysql/entities/MysqlBusiness';
import { Login } from '../entity/mysql/entities/MysqlLogin';
import { User } from '../entity/mysql/entities/MysqlUser';
export default class ServiceBusinessVenderFavorite extends BaseService {
    constructor() {
        super();
    }

    public async post(venderInformation: BusinessVenderInformationField) {
        const query = this.mysqlManager(BusinessVenderInformationField).save(venderInformation);
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
        const query = this.mysqlManager(BusinessVenderInformationField).delete({
            business: business,
        });

        return query;
    }
}
