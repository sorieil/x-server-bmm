import { BusinessEventBridge } from './../entity/mysql/entities/MysqlBusinessEventBridge';
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
    public async _getByAdminWidthBusinessAdmin(
        admin: Admin,
        business: Business,
    ) {
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
    public _getBusinessByAdmin(admin: Admin) {
        const query = this.mysqlManager(Business).findOne({
            // 왜 아아디를 별도로 써주냐면, admin 객체에 각 필드마다 내용이 들어가 있어서 그 내용들이
            // 같이 where 절로 검색하기 때문에 에러가 난다.
            where: { admin: admin.id },
        });
        return query;
    }

    public _getBusinessByEventId(businessEventBridge: BusinessEventBridge) {
        const query = this.mysqlManager(BusinessEventBridge).findOne({
            where: { eventId: businessEventBridge.eventId },
            relations: ['business'],
        });

        return query;
    }

    public _getBusinessById(business: Business) {
        const query = this.mysqlManager(Business).findOne({
            where: {
                id: business.id,
            },
        });

        return query;
    }
}
