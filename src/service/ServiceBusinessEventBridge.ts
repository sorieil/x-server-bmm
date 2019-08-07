import { BusinessEventBridge } from '../entity/mysql/entities/MysqlBusinessEventBridge';
import { BaseService } from './BaseService';
export default class ServiceBusinessEventBridge extends BaseService {
    constructor() {
        super();
    }

    public post(businessEventBridge: BusinessEventBridge) {
        const query = this.mysqlManager(BusinessEventBridge).save(businessEventBridge);
        return query;
    }

    public get(businessEventBridge: BusinessEventBridge) {
        const query = this.mysqlManager(BusinessEventBridge).findOne({
            where: {
                eventId: businessEventBridge.eventId,
            },
            relations: ['business'],
        });
        return query;
    }
}
