import { BaseService } from './BaseService';
import { BusinessVenderInformationField } from '../entity/mysql/entities/MysqlBusinessVenderInformationField';
import { ServiceBusiness } from './ServiceBusiness';
import { Business } from '../entity/mysql/entities/MysqlBusiness';
export default class ServiceBusinessVenderInformationField extends BaseService {
    constructor() {
        super();
    }

    public async post(venderInformation: BusinessVenderInformationField) {
        const query = this.mysqlManager(BusinessVenderInformationField).save(venderInformation);
        return query;
    }

    public async get(business: Business) {
        const query = this.mysqlManager(BusinessVenderInformationField).find({
            where: {
                business: business,
            },
            relations: ['businessVenderInformationFieldChildNode'],
        });

        return query;
    }

    public async delete(business: Business) {
        const query = this.mysqlManager(BusinessVenderInformationField).delete({
            business: business,
        });

        return query;
    }
}
