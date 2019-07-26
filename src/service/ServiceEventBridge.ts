import { BusinessEventBridge } from '../entity/mysql/entities/MysqlBusinessEventBridge';
import { BaseService } from './BaseService';
export default class ServiceEventBridge extends BaseService {
    constructor() {
        super();
    }

    public post(eventBridge: BusinessEventBridge) {
        const query = this.mysqlManager(BusinessEventBridge).save(eventBridge);
        return query;
    }
}
