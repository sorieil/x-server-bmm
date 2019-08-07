import { BusinessVenderFavorite } from './../entity/mysql/entities/MysqlBusinessVenderFavorite';
import { BaseService } from './BaseService';
import { BusinessVender } from '../entity/mysql/entities/MysqlBusinessVender';
import { Business } from '../entity/mysql/entities/MysqlBusiness';
export default class ServiceUserVender extends BaseService {
    constructor() {
        super();
    }

    public _getByBusiness(business: Business) {
        const query = this.mysqlManager(BusinessVender).find({
            where: {
                business: business,
            },
            relations: ['businessVenderFavorities'],
        });
        return query;
    }
}
