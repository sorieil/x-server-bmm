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

    public async checkFieldType(businessVenderField: BusinessVenderField) {
        const query = this.mysqlConnection
            .getRepository(BusinessVenderField)
            .createQueryBuilder('field')
            .leftJoinAndSelect('field.fieldType', 'code')
            .where('field.id = :id', { id: businessVenderField.id })
            .getOne();
        return query;
    }

    public async _getField(business: Business, informationType: Code) {
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
            relations: [
                'businessCode',
                'businessVenderFieldValues',
                'businessVenderFieldValues.businessVenderField',
                'businessVenderFieldValues.businessVenderField.informationType',
            ],
            where: { id: businessVender.id },
        });
        return query;
    }

    public async _getWithBusiness(businessVender: BusinessVender, business: Business) {
        const query = this.mysqlManager(BusinessVender).findOne({
            relations: [
                'businessCode',
                'businessVenderFieldValues',
                'businessVenderFieldValues.businessVenderField',
                'businessVenderFieldValues.businessVenderField.informationType',
                'businessVenderFieldValues.businessVenderField.fieldType',
            ],
            where: { id: businessVender.id, business: business },
        });
        return query;
    }

    public async post(businessVender: BusinessVender) {
        const query = this.mysqlManager(BusinessVender).save(businessVender);
        return query;
    }

    public async _postVenderFieldValue(businessVenderFieldValue: BusinessVenderFieldValue[]) {
        const query = this.mysqlManager(BusinessVenderFieldValue).save(businessVenderFieldValue);
        return query;
    }

    public async _getByBusiness(business: Business) {
        const query = this.mysqlManager(BusinessVender).find({
            relations: [
                'businessCode',
                'businessVenderFieldValues',
                'businessVenderFieldValues.businessVenderField',
                'businessVenderFieldValues.businessVenderField.fieldType',
                'businessVenderFieldValues.businessVenderField.informationType',
            ],
            where: {
                business: business,
            },
        });

        // query.map((v: any) => {});

        return query;
    }

    public async _getByVender(businessVender: BusinessVender) {
        const query = this.mysqlManager(BusinessVender).findOne({
            relations: [
                'businessCode',
                'businessVenderFieldValues',
                'businessVenderFieldValues.businessVenderField',
                'businessVenderFieldValues.businessVenderField.informationType',
            ],
            where: {
                id: businessVender.id,
            },
        });

        return query;
    }

    public async delete(businessVender: BusinessVender) {
        const query = this.mysqlManager(BusinessVender).delete(businessVender);
        return query;
    }

    public _getByCode(code: Code) {
        const query = this.mysqlManager(Code).findOne(code);
        return query;
    }

    public _getBVenderFieldValue(businessVenderFieldValue: BusinessVenderFieldValue) {
        const query = this.mysqlManager(BusinessVenderFieldValue).findOne({
            where: {
                id: businessVenderFieldValue.id,
            },
            relations: ['businessVenderField', 'businessVenderField.fieldType'],
        });
        return query;
    }
}
