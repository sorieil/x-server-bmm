import { BusinessVendorFieldValue } from '../entity/mysql/entities/MysqlBusinessVendorFieldValue';
import { BusinessVendorField } from '../entity/mysql/entities/MysqlBusinessVendorField';
import { BusinessVendor } from '../entity/mysql/entities/MysqlBusinessVendor';
import { BaseService } from './BaseService';
import { Business } from '../entity/mysql/entities/MysqlBusiness';
import { Code } from '../entity/mysql/entities/MysqlCode';
import ServiceSearchVendor from './ServiceSearchVendor';

export default class ServiceBusinessVendor extends BaseService {
  constructor() {
    super();
  }

  public async checkFieldType(businessVendorField: BusinessVendorField) {
    const query = this.mysqlConnection
      .getRepository(BusinessVendorField)
      .createQueryBuilder('field')
      .leftJoinAndSelect('field.fieldType', 'code')
      .where('field.id = :id', { id: businessVendorField.id })
      .getOne();
    return query;
  }

  public async _getField(business: Business, informationType: Code) {
    const query = this.mysqlManager(BusinessVendorField).find({
      where: {
        business: business,
        informationType: informationType,
      },
      relations: ['informationType'],
    });
    return query;
  }

  public async get(businessVendor: BusinessVendor) {
    const query = this.mysqlManager(BusinessVendor).findOne({
      relations: [
        'businessCode',
        'businessVendorFieldValues',
        'businessVendorFieldValues.idx',
        'businessVendorFieldValues.businessVendorField',
        'businessVendorFieldValues.businessVendorField.informationType',
        'businessVendorFieldValues.businessVendorField.fieldType',
      ],
      where: { id: businessVendor.id },
    });
    return query;
  }

  public async _getWithBusiness(
    businessVendor: BusinessVendor,
    business: Business,
  ) {
    const query = this.mysqlManager(BusinessVendor).findOne({
      relations: [
        'businessCode',
        'businessVendorFieldValues',
        'businessVendorFieldValues.idx',
        'businessVendorFieldValues.businessVendorField',
        'businessVendorFieldValues.businessVendorField.informationType',
        'businessVendorFieldValues.businessVendorField.fieldType',
      ],
      where: { id: businessVendor.id, business: business },
    });
    return query;
  }

  public async post(businessVendor: BusinessVendor) {
    const query = await this.mysqlManager(BusinessVendor).save(businessVendor);
    const serviceSearchVendor = new ServiceSearchVendor();
    await serviceSearchVendor._updateBySelectBusinessVendor(businessVendor);
    return query;
  }

  public async _postVendorFieldValue(
    businessVendorFieldValue: BusinessVendorFieldValue[],
  ) {
    const query = await this.mysqlManager(BusinessVendorFieldValue).save(
      businessVendorFieldValue,
    );
    const serviceSearchVendor = new ServiceSearchVendor();
    // 여기에서는 밴더의 아이디를 받지 않는다.. value의 값으로 한다.
    // 업데이트시에는 밴더 아이디가 없다... 어떻게 해야 할까..?
    console.log('query =>>>> \n', query);
    console.log('BusinessVendorFieldValue =>>>> \n', businessVendorFieldValue);
    await serviceSearchVendor._updateBySelectBusinessVendor(
      businessVendorFieldValue[0].businessVendor,
    );
    return query;
  }

  public async _getByBusiness(business: Business) {
    const query = this.mysqlManager(BusinessVendor).find({
      relations: [
        'businessCode',
        'businessVendorFieldValues',
        'businessVendorFieldValues.idx',
        'businessVendorFieldValues.businessVendorField',
        'businessVendorFieldValues.businessVendorField.informationType',
        'businessVendorFieldValues.businessVendorField.fieldType',
      ],
      where: {
        business: business,
      },
    });

    // query.map((v: any) => {});

    return query;
  }

  public async _getByVendor(businessVendor: BusinessVendor) {
    const query = this.mysqlManager(BusinessVendor).findOne({
      relations: [
        'businessCode',
        'businessVendorFieldValues',
        'businessVendorFieldValues.idx',
        'businessVendorFieldValues.businessVendorField',
        'businessVendorFieldValues.businessVendorField.informationType',
        'businessVendorFieldValues.businessVendorField.fieldType',
      ],
      where: {
        id: businessVendor.id,
      },
    });

    return query;
  }

  public async delete(businessVendor: BusinessVendor) {
    const query = this.mysqlManager(BusinessVendor).delete(businessVendor);
    return query;
  }

  public _getByCode(code: Code) {
    const query = this.mysqlManager(Code).findOne(code);
    return query;
  }

  public _getByVendorFieldValue(
    businessVendorFieldValue: BusinessVendorFieldValue,
  ) {
    const query = this.mysqlManager(BusinessVendorFieldValue).findOne({
      where: {
        id: businessVendorFieldValue.id,
      },
      relations: [
        'businessVendor',
        'businessVendorField',
        'businessVendorField.fieldType',
        'businessVendorField.informationType',
      ],
    });
    return query;
  }

  public gets(business: Business) {
    const query = this.mysqlManager(BusinessVendor).find({
      where: { business: business },
    });

    return query;
  }
}
