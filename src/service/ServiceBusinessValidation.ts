import { Admin } from '../entity/mysql/entities/MysqlAdmin';
import { Business } from '../entity/mysql/entities/MysqlBusiness';
import { BaseService } from './BaseService';

/**
 * 비즈니스 관련 서비스 클래스이다.
 */
export class ServiceBusinessValidation extends BaseService {
    constructor() {
        super();
    }

    /**
     * req.user.admin 의 아이디로 business id가 있는지 체크 한다.
     * @param admin admin.id
     */
    public async admin(admin: Admin) {
        const query = await this.mysqlManager(Business).find({ where: { admin: admin } });
        return query;
    }

    /**
     * @param business business.id
     */
    public async business(business: Business) {
        const query = await this.mysqlManager(Business).find({ where: { id: business.id }, relations: ['admin'] });
        return query;
    }
}
