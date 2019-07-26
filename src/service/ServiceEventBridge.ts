import { EventBridge } from './../entity/mysql/entities/MysqlEventBridge';
import { BaseService } from './BaseService';
export default class ServiceEventBridge extends BaseService {
    constructor() {
        super();
    }

    public post(eventBridge: EventBridge) {
        const query = this.mysqlManager(EventBridge).save(eventBridge);
        return query;
    }
}
