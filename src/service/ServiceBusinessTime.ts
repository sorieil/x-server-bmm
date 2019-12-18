import { BusinessVendorManager } from './../entity/mysql/entities/MysqlBusinessVendorManager';
import { BusinessMeetingTime } from './../entity/mysql/entities/MysqlBusinessMeetingTime';
import { BusinessMeetingRoom } from '../entity/mysql/entities/MysqlBusinessMeetingRoom';
import { AdminLogin } from '../entity/mysql/entities/MysqlAdminLogin';
import { Admin } from '../entity/mysql/entities/MysqlAdmin';
import { BusinessDetail } from '../entity/mysql/entities/MysqlBusinessDetail';
import { Business } from '../entity/mysql/entities/MysqlBusiness';
import { BaseService } from './BaseService';
import { read, write, utils } from 'xlsx';

/**
 * 비즈니스 관련 서비스 클래스이다.
 */
export class ServiceBusinessTime extends BaseService {
    constructor() {
        super();
    }
    /**
     * 시간을 저장한다.
     * @param businessMeetingTime  businessMeetingTime
     */
    public async post(businessMeetingTime: BusinessMeetingTime) {
        const query = await this.mysqlManager(BusinessMeetingTime).save(
            businessMeetingTime,
        );
        delete query.business;
        return query;
    }

    /**
     * 비즈니스 아이디로 설정한 타임을 조회 한다.
     * @param business business.id
     */
    public async get(business: Business) {
        const query = await this.mysqlManager(BusinessMeetingTime).findOne({
            where: {
                business: business,
            },
        });
        return query;
    }

    public async _getBusinessVendorManagerByBusinessVendorManager(
        businessVendorManager: BusinessVendorManager,
    ) {
        const query = this.mysqlManager(BusinessVendorManager).findOne({
            where: {
                id: businessVendorManager.id,
            },
            relations: [
                'businessVendorFieldManagerValues',
                'businessVendorFieldManagerValues.idx',
                'businessVendorFieldManagerValues.businessVendorField',
                'businessVendorFieldManagerValues.businessVendorField.informationType',
                'businessVendorFieldManagerValues.businessVendorField.fieldType',
            ],
        });

        return query;
    }
}
