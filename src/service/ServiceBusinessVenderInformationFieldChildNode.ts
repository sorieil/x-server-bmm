import { BaseService } from './BaseService';
import { BusinessVenderInformationFieldChildNode } from '../entity/mysql/entities/MysqlBusinessVenderInformationFieldChildNode';
export default class ServiceBusinessVenderInformationFieldChildNode extends BaseService {
    constructor() {
        super();
    }

    public async post(childNode: BusinessVenderInformationFieldChildNode) {
        const query = this.mysqlManager(BusinessVenderInformationFieldChildNode).save(childNode);
        return query;
    }

    public async delete(childNode: BusinessVenderInformationFieldChildNode) {
        const query = this.mysqlManager(BusinessVenderInformationFieldChildNode).delete({
            id: childNode.id,
        });

        return query;
    }
}
