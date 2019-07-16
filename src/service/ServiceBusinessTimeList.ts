import { BusinessMeetingTimeList } from './../entity/mysql/entities/MysqlBusinessMeetingTimeList';
import { BusinessMeetingTime } from '../entity/mysql/entities/MysqlBusinessMeetingTime';
import { Business } from '../entity/mysql/entities/MysqlBusiness';
import { BaseService } from './BaseService';

/**
 * 비즈니스 관련 서비스 클래스이다.
 */
export class ServiceBusinessTimeList extends BaseService {
    constructor() {
        super();
    }
    /**
     * 시간을 저장한다.
     * @param businessMeetingTime  businessMeetingTime
     */
    public async post(businessMeetingTimeList: BusinessMeetingTimeList[]) {
        const query = await this.mysqlManager(BusinessMeetingTimeList).save(businessMeetingTimeList);
        await query.map(v => {
            return delete v.businessMeetingTime;
        });
        return query;
    }

    public async get(business: Business) {
        const query = await this.mysqlManager(BusinessMeetingTime).findOne({
            where: {
                Business: Business,
            },
            relations: ['businessMeetingTimeLists'],
        });

        return query;
    }

    public async deleteAll(businessMeetingTime: BusinessMeetingTime) {
        const query = await this.mysqlManager(BusinessMeetingTimeList).delete({
            businessMeetingTime: businessMeetingTime,
        });

        return query;
    }
}
