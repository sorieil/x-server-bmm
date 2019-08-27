import { Admin } from '../entity/mysql/entities/MysqlAdmin';
import { Business } from '../entity/mysql/entities/MysqlBusiness';
import { BaseService } from './BaseService';

/**
 * 비즈니스 관련 서비스 클래스이다.
 */
export class ServiceBusinessPermission extends BaseService {
    constructor() {
        super();
    }

    /**
     * Admin id 와 business id 로 business의 소유권이 있는지 체크
     * @param admin admin.id
     * @param business business.id
     */
    public async _ByAdminWidthBusiness(admin: Admin, business: Business) {
        const query = await this.mysqlManager(Admin).findOne({
            where: { id: admin.id },
            relations: ['business'],
        });
        // Business 정보가 있는지 체크
        if (query.businesses.length > 0) {
            if (query.businesses[0].id === business.id) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    /**
     * Admin id 와 business id 로 business의 소유권이 있는지 체크
     * @param admin admin.id
     */
    public _ByAdmin(admin: Admin) {
        const query = this.mysqlManager(Business).findOne({
            where: { admin: admin },
        });
        return query;
    }
}
