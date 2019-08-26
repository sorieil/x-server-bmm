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
            delete v.businessMeetingTime;
            delete v.createdAt;
            delete v.updatedAt;
            return v;
        });
        return query;
    }

    public async update(businessMeetingTimeList: BusinessMeetingTimeList) {
        const query = await this.mysqlManager(BusinessMeetingTimeList).save(businessMeetingTimeList);
        return query;
    }

    public getByBusiness(business: Business) {
        const query = this.mysqlManager(BusinessMeetingTime).findOne({
            where: {
                business: business,
            },
            relations: ['businessMeetingTimeLists'],
        });

        return query;
    }

    public get(businessMeetingTimeList: BusinessMeetingTimeList) {
        const query = this.mysqlManager(BusinessMeetingTimeList).findOne(businessMeetingTimeList);
        return query;
    }

    public deleteAllMeetingTimeList(businessMeetingTime: BusinessMeetingTime) {
        const query = this.mysqlManager(BusinessMeetingTimeList).delete({
            businessMeetingTime: businessMeetingTime,
        });

        return query;
    }
}
