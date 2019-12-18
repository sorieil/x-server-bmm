import { query } from 'express-validator';
import { BusinessVendorField } from '../entity/mysql/entities/MysqlBusinessVendorField';
import { BaseService } from './BaseService';
import { BusinessVendorFieldChildNode } from '../entity/mysql/entities/MysqlBusinessVendorFieldChildNode';
export default class ServiceBusinessVendorFieldChildNode extends BaseService {
    constructor() {
        super();
    }

    public async post(childNode: BusinessVendorFieldChildNode[]) {
        const query = this.mysqlManager(BusinessVendorFieldChildNode).save(
            childNode,
        );
        return query;
    }

    public async delete(
        businessVendorFieldChildNode: BusinessVendorFieldChildNode,
    ) {
        const query = this.mysqlManager(BusinessVendorFieldChildNode).delete(
            businessVendorFieldChildNode,
        );

        return query;
    }

    public async get(businessVendorField: BusinessVendorField) {
        const query = this.mysqlManager(BusinessVendorFieldChildNode).findOne({
            where: {
                businessVendorField: businessVendorField,
            },
        });
        return query;
    }

    public async gets(businessVendorField: BusinessVendorField) {
        const query = this.mysqlManager(BusinessVendorFieldChildNode).find({
            where: {
                businessVendorField: businessVendorField,
            },
        });
        return query;
    }

    public async getByBusinessVendorField(
        businessVendorField: BusinessVendorField,
        businessVendorFieldChildNode: BusinessVendorFieldChildNode,
    ) {
        const query = this.mysqlManager(BusinessVendorFieldChildNode).findOne({
            where: {
                // businessVendorField: businessVendorField,
                id: businessVendorFieldChildNode.id,
            },
        });
        return query;
    }
}
