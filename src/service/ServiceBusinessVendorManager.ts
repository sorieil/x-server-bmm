import { BusinessVendorFieldValue } from '../entity/mysql/entities/MysqlBusinessVendorFieldValue';
import { BusinessVendorField } from '../entity/mysql/entities/MysqlBusinessVendorField';
import { BusinessVendor } from '../entity/mysql/entities/MysqlBusinessVendor';
import { BaseService } from './BaseService';
import { Business } from '../entity/mysql/entities/MysqlBusiness';
import { Code } from '../entity/mysql/entities/MysqlCode';
import ServiceSearchVendor from './ServiceSearchVendor';
import { BusinessVendorFieldManagerValue } from '../entity/mysql/entities/MysqlBusinessVendorFieldManagerValue';
import { BusinessVenderManager } from '../entity/mysql/entities/MysqlBusinessVendorManager';

export default class ServiceBusinessVendorManager extends BaseService {
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
        'businessVendorFieldManagerValues',
        'businessVendorFieldManagerValues.idx',
        'businessVendorFieldManagerValues.businessVendorField',
        'businessVendorFieldManagerValues.businessVendorField.informationType',
        'businessVendorFieldManagerValues.businessVendorField.fieldType',
      ],
      where: { id: businessVendor.id },
    });
    return query;
  }

  public async _getWithBusinessVendor(businessVendor: BusinessVendor) {
    const query = this.mysqlManager(BusinessVenderManager).findOne({
      relations: [
        'businessVendorFieldManagerValues',
        'businessVendorFieldManagerValues.idx',
        'businessVendorFieldManagerValues.businessVendorField',
        'businessVendorFieldManagerValues.businessVendorField.informationType',
        'businessVendorFieldManagerValues.businessVendorField.fieldType',
      ],
      where: { businessVendor: businessVendor },
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
        'businessVendorFieldManagerValues',
        'businessVendorFieldManagerValues.idx',
        'businessVendorFieldManagerValues.businessVendorField',
        'businessVendorFieldManagerValues.businessVendorField.informationType',
        'businessVendorFieldManagerValues.businessVendorField.fieldType',
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

  public async _postVendorFieldManagerValue(
    businessVendorFieldManagerValue: BusinessVendorFieldManagerValue[],
  ) {
    const query = await this.mysqlManager(BusinessVendorFieldManagerValue).save(
      businessVendorFieldManagerValue,
    );
    return query;
  }

  public async _getByBusiness(business: Business) {
    const query = this.mysqlManager(BusinessVendor).find({
      relations: [
        'businessCode',
        'businessVendorFieldManagerValues',
        'businessVendorFieldManagerValues.idx',
        'businessVendorFieldManagerValues.businessVendorField',
        'businessVendorFieldManagerValues.businessVendorField.informationType',
        'businessVendorFieldManagerValues.businessVendorField.fieldType',
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
        'businessVendorFieldManagerValues',
        'businessVendorFieldManagerValues.idx',
        'businessVendorFieldManagerValues.businessVendorField',
        'businessVendorFieldManagerValues.businessVendorField.informationType',
        'businessVendorFieldManagerValues.businessVendorField.fieldType',
      ],
      where: {
        id: businessVendor.id,
      },
    });

    return query;
  }
  /**
   * 매니저는 삭제는 밴더의 아이디와, 매니저 값 그룹 코드가 필요하다.
   * TODO: 권한 체크 부분에서는 해당 토큰의 값이 벤더를 소유하고 있어야 한다.
   * @param businessVendor 밴더 아이디
   * @param businessVendorFieldManagerValueGroup 매니저의 메인 키값을 하는 그룹 코드
   */
  public async delete(
    businessVendor: BusinessVendor,
    businessVendorFieldManagerValueGroup: BusinessVenderManager,
  ) {
    const query = this.mysqlManager(BusinessVenderManager).delete({
      businessVendor: businessVendor,
      id: businessVendorFieldManagerValueGroup.id,
    });
    return query;
  }

  public _getByCode(code: Code) {
    const query = this.mysqlManager(Code).findOne(code);
    return query;
  }

  public _getByVendorFieldManagerValue(
    businessVendorFieldManagerValue: BusinessVendorFieldManagerValue,
  ) {
    const query = this.mysqlManager(BusinessVendorFieldManagerValue).findOne({
      where: {
        id: businessVendorFieldManagerValue.id,
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
}
