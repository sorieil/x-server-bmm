import { BaseService } from './BaseService';
import { BusinessVendorField } from '../entity/mysql/entities/MysqlBusinessVendorField';
import { Business } from '../entity/mysql/entities/MysqlBusiness';
import { StatusTypeRole } from '../entity/mysql/entities/MysqlBase';
export interface BusinessVendorFieldType {
    name: string;
    require: StatusTypeRole;
    informationType: number;
    fieldType: number;
}
export default class ServiceBusinessVendorField extends BaseService {
    constructor() {
        super();
    }

    public async postArray(vendorInformation: BusinessVendorField[]) {
        const query = await this.mysqlManager(BusinessVendorField).save(
            vendorInformation,
        );
        await query.map((v: any) => {
            delete v.business;
            v.informationType = v.informationType.id;
            v.fieldType = v.fieldType.id;
            return v;
        });
        return query;
    }

    public async post(businessVendorField: BusinessVendorField) {
        const query = await this.mysqlManager(BusinessVendorField).save(
            businessVendorField,
        );
        delete query.business;
        return query;
    }

    public get(businessVendorField: BusinessVendorField) {
        const query = this.mysqlManager(BusinessVendorField).findOne({
            where: {
                id: businessVendorField.id,
            },
        });

        return query;
    }

    public async _getByBusiness(business: Business) {
        const query = this.mysqlManager(BusinessVendorField).find({
            where: {
                business: business,
            },
            relations: [
                'informationType',
                'fieldType',
                'businessVendorFieldChildNodes',
            ],
        });
        return query;
    }
    /**
     * 비즈니스 정보와 아이디 값으로 데이터르 불러오거나 검증 할 수 있다.
     * @param {BusinessVendorField} businessVendorField
     * @param {Business} business
     * @returns
     */
    public async _getWithBusiness(
        businessVendorField: BusinessVendorField,
        business: Business,
    ) {
        const query = this.mysqlManager(BusinessVendorField).findOne({
            where: {
                business: business,
                id: businessVendorField.id,
            },
            relations: [
                'businessVendorFieldChildNodes',
                'informationType',
                'fieldType',
            ],
        });

        return query;
    }

    public async deleteAll(business: Business) {
        const query = this.mysqlManager(BusinessVendorField).delete({
            business: business,
        });

        return query;
    }

    public async delete(vendorInformation: BusinessVendorField) {
        const query = this.mysqlManager(BusinessVendorField).delete(
            vendorInformation,
        );
        return query;
    }

    public async checkDuplicate(field: BusinessVendorFieldType) {
        const query = this.mysqlManager(BusinessVendorField).findOne({
            where: {
                name: field.name,
                informationType: field.informationType,
                fieldType: field.fieldType,
            },
        });

        return query;
    }
}
