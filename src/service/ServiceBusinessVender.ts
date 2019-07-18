import { BusinessVenderFieldValue } from './../entity/mysql/entities/MysqlBusinessVenderFieldValue';
import { BusinessVenderField } from '../entity/mysql/entities/MysqlBusinessVenderField';
import { BusinessVender } from './../entity/mysql/entities/MysqlBusinessVender';
import { BaseService } from './BaseService';
import { Business } from '../entity/mysql/entities/MysqlBusiness';
import { Code } from '../entity/mysql/entities/MysqlCode';

export default class ServiceBusinessVender extends BaseService {
    constructor() {
        super();
    }

    /*
    public async checkFieldType(businessVenderField: BusinessVenderField) {
        const query = this.mysqlManager(BusinessVenderField).findOne({
            where: {
                id: businessVenderField,
            },
            relations: ['fieldType'],
        });

        return query;
    }
    */

    public async checkFieldType(businessVenderField: BusinessVenderField) {
        const query = this.mysqlConnection
            .getRepository(BusinessVenderField)
            .createQueryBuilder('business_vender_field')
            .leftJoinAndSelect('business_vender_field.fieldType', 'code')
            .where('business_vender_field.id = :id', { id: businessVenderField.id })
            .getOne();
        return query;
    }

    public async getField(business: Business, informationType: Code) {
        const query = this.mysqlManager(BusinessVenderField).find({
            where: {
                business: business,
                informationType: informationType,
            },
            relations: ['informationType'],
        });
        return query;
    }

    public async get(businessVender: BusinessVender) {
        const query = this.mysqlManager(BusinessVender).findOne({
            relations: ['businessCode'],
            where: { id: businessVender.id },
        });
        return query;
    }

    public async getWithBusiness(businessVender: BusinessVender, business: Business) {
        const query = this.mysqlManager(BusinessVender).findOne({
            relations: ['businessCode', 'businessVenderFieldValues', 'businessVenderFieldValues.businessVenderField'],
            where: { id: businessVender.id, business: business },
        });
        return query;
    }

    public async post(businessVender: BusinessVender) {
        const query = this.mysqlManager(BusinessVender).save(businessVender);
        return query;
    }

    public async postVenderFieldValue(businessVenderFieldValue: BusinessVenderFieldValue[]) {
        const query = this.mysqlManager(BusinessVenderFieldValue).save(businessVenderFieldValue);
        return query;
    }

    public async getByBusiness(business: Business) {
        const query = this.mysqlManager(BusinessVender).find({
            relations: [
                'businessCode',
                'businessVenderFieldValues',
                'businessVenderFieldValues.businessVenderField',
                'businessVenderFieldValues.businessVenderField.informationType',
            ],
            where: {
                business: business,
            },
        });

        // query.map((v: any) => {});

        return query;
    }

    public async delete(businessVender: BusinessVender) {
        const query = this.mysqlManager(BusinessVender).delete(businessVender);
        return query;
    }
}
