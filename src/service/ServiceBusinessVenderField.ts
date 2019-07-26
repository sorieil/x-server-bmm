import { BaseService } from './BaseService';
import { BusinessVenderField } from '../entity/mysql/entities/MysqlBusinessVenderField';
import { ServiceBusiness } from './ServiceBusiness';
import { Business } from '../entity/mysql/entities/MysqlBusiness';
import { Code } from '../entity/mysql/entities/MysqlCode';
import { StatusTypeRole } from '../entity/mysql/entities/MysqlBase';
export type BusinessVenderFieldType = {
    name: string;
    require: StatusTypeRole;
    informationType: number;
    fieldType: number;
};
export default class ServiceBusinessVenderField extends BaseService {
    constructor() {
        super();
    }

    public async postArray(venderInformation: BusinessVenderField[]) {
        const query = await this.mysqlManager(BusinessVenderField).save(venderInformation);
        await query.map((v: any) => {
            delete v.business;
            v.informationType = v.informationType.id;
            v.fieldType = v.fieldType.id;
            return v;
        });
        return query;
    }

    public async post(venderInformation: BusinessVenderField) {
        const query = await this.mysqlManager(BusinessVenderField).save(venderInformation);
        delete query.business;
        return query;
    }

    public async get(business: Business) {
        const query = this.mysqlManager(BusinessVenderField).find({
            where: {
                business: business,
            },
            relations: ['informationType', 'fieldType', 'businessVenderFieldChildNodes'],
        });
        return query;
    }
    /**
     * 비즈니스 정보와 아이디 값으로 데이터르 불러오거나 검증 할 수 있다.
     * @param {BusinessVenderField} businessVenderField
     * @param {Business} business
     * @returns
     */
    public async getWithBusiness(businessVenderField: BusinessVenderField, business: Business) {
        const query = this.mysqlManager(BusinessVenderField).findOne({
            where: {
                business: business,
                id: businessVenderField.id,
            },
            relations: ['businessVenderFieldChildNodes', 'informationType', 'fieldType'],
        });

        return query;
    }

    public async deleteAll(business: Business) {
        const query = this.mysqlManager(BusinessVenderField).delete({
            business: business,
        });

        return query;
    }

    public async delete(venderInformation: BusinessVenderField) {
        const query = this.mysqlManager(BusinessVenderField).delete(venderInformation);
        return query;
    }

    public async checkDuplicate(field: BusinessVenderFieldType) {
        const query = this.mysqlManager(BusinessVenderField).findOne({
            where: {
                name: field.name,
                informationType: field.informationType,
                fieldType: field.fieldType,
            },
        });

        return query;
    }
}
