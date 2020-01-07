import { BusinessEventBridge } from '../entity/mysql/entities/MysqlBusinessEventBridge';
import { BaseService } from './BaseService';
export default class ServiceBusinessEventBridge extends BaseService {
    constructor() {
        super();
    }

    public async post(businessEventBridge: BusinessEventBridge) {
        const query = await this.mysqlManager(BusinessEventBridge).save(
            businessEventBridge,
        );
        return query;
    }

    public async get(businessEventBridge: BusinessEventBridge) {
        const query = await this.mysqlManager(BusinessEventBridge).findOne({
            where: {
                eventId: businessEventBridge.eventId,
            },
            relations: ['business'],
        });
        return query;
    }
}
