import { BusinessVender } from '../entity/mysql/entities/MysqlBusinessVender';
import { BaseService } from './BaseService';
import { Business } from '../entity/mysql/entities/MysqlBusiness';
import { BusinessVenderManager } from '../entity/mysql/entities/MysqlBusinessVenderManager';

export default class ServiceBusinessVenderManager extends BaseService {
    constructor() {
        super();
    }

    public async get(businessVenderManager: BusinessVenderManager) {
        const query = this.mysqlManager(BusinessVenderManager).findOne({
            where: { id: businessVenderManager.id },
        });
        return query;
    }

    public async getWithBusinessVender(businessVenderManager: BusinessVenderManager, businessVender: BusinessVender) {
        const query = this.mysqlManager(BusinessVenderManager).findOne({
            relations: ['businessVender'],
            where: { id: businessVenderManager.id, businessVender: businessVender },
        });
        return query;
    }

    public async post(businessVenderManager: BusinessVenderManager) {
        const query = this.mysqlManager(BusinessVenderManager).save(businessVenderManager);
        return query;
    }

    public async getByBusiness(business: Business) {
        const query = this.mysqlManager(BusinessVender).find({
            relations: ['businessVender'],
            where: {
                business: business,
            },
        });

        return query;
    }

    public async delete(businessVenderManager: BusinessVenderManager) {
        const query = this.mysqlManager(BusinessVenderManager).delete(businessVenderManager);
        return query;
    }
}
