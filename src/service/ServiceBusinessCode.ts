import { BusinessCode } from './../entity/mysql/entities/MysqlBusinessCode';
import { BaseService } from './BaseService';

export default class ServiceBusinessCode extends BaseService {
    constructor() {
        super();
    }

    public async get(businessCode: BusinessCode) {
        const query = this.mysqlManager(BusinessCode).findOne({ where: { id: businessCode.id } });
        return query;
    }

    public async post(businessCode: BusinessCode) {
        const query = this.mysqlManager(BusinessCode).save(businessCode);
        return query;
    }

    public getNotUseOneCode() {
        const query = this.mysqlManager(BusinessCode).findOne({
            where: {
                use: 'no',
            },
        });

        return query;
    }
}
