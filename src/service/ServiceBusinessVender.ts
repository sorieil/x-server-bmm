import { BusinessVender } from './../entity/mysql/entities/MysqlBusinessVender';
import { BaseService } from './BaseService';
import { Business } from '../entity/mysql/entities/MysqlBusiness';

export default class ServiceBusinessVender extends BaseService {
    constructor() {
        super();
    }

    public async get(businessVender: BusinessVender) {
        const query = this.mysqlManager(BusinessVender).findOne({
            relations: ['businessCode', 'serviceCategory', 'businessCategory'],
            where: { id: businessVender.id },
        });
        return query;
    }

    public async getWithBusiness(businessVender: BusinessVender, business: Business) {
        const query = this.mysqlManager(BusinessVender).findOne({
            relations: ['businessCode', 'serviceCategory', 'businessCategory'],
            where: { id: businessVender.id, business: business },
        });
        return query;
    }

    public async post(businessVender: BusinessVender) {
        const query = this.mysqlManager(BusinessVender).save(businessVender);
        return query;
    }

    public async getByBusiness(business: Business) {
        const query = this.mysqlManager(BusinessVender).find({
            relations: ['businessCode', 'serviceCategory', 'businessCategory'],
            where: {
                business: business,
            },
        });

        return query;
    }

    public async delete(businessVender: BusinessVender) {
        const query = this.mysqlManager(BusinessVender).delete(businessVender);
        return query;
    }
}
