import { BusinessVender } from '../entity/mysql/entities/MysqlBusinessVender';
import { BaseService } from './BaseService';
import { Business } from '../entity/mysql/entities/MysqlBusiness';
import { BusinessVenderManager } from '../entity/mysql/entities/MysqlBusinessVenderManager';

export default class ServiceBusinessVenderManager extends BaseService {
    constructor() {
        super();
    }
    /**
     * 하나씩 불러오기
     *
     * @param {BusinessVenderManager} businessVenderManager
     * @returns
     * @memberof ServiceBusinessVenderManager
     */
    public async get(businessVenderManager: BusinessVenderManager) {
        const query = this.mysqlManager(BusinessVenderManager).find({
            where: { id: businessVenderManager.id },
        });
        return query;
    }

    /**
     * 밴더 기준으로 여러개 불러오기
     *
     * @param {BusinessVender} businessVender
     * @returns
     * @memberof ServiceBusinessVenderManager
     */
    public async gets(businessVender: BusinessVender) {
        const query = this.mysqlManager(BusinessVenderManager).find({
            where: { businessVender: businessVender },
        });
        return query;
    }

    public async getWithBusinessVender(businessVender: BusinessVender, business: Business) {
        const query = this.mysqlManager(BusinessVender).findOne({
            where: { id: businessVender.id, business: business },
        });
        return query;
    }

    /**
     * 매니저 입력
     *
     * @param {BusinessVenderManager} businessVenderManager
     * @returns
     * @memberof ServiceBusinessVenderManager
     */
    public async post(businessVenderManager: BusinessVenderManager) {
        const query = this.mysqlManager(BusinessVenderManager).save(businessVenderManager);
        return query;
    }

    public async getByBusiness(business: Business) {
        const query = this.mysqlManager(BusinessVender).find({
            relations: ['businessVenderManager'],
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
