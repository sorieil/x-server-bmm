import { query } from 'express-validator';
import { BusinessVendorFieldManagerValue } from './../entity/mysql/entities/MysqlBusinessVendorFieldManagerValue';
import { BaseService } from './BaseService';
import { User } from '../entity/mysql/entities/MysqlUser';
import { BusinessVendorManager } from '../entity/mysql/entities/MysqlBusinessVendorManager';
export default class ServiceUser extends BaseService {
  constructor() {
    super();
  }

  public post(user: User) {
    const query = this.mysqlManager(User).save(user);
    return query;
  }

  public _getBusinessVendorManager(
    businessVendorManager: BusinessVendorManager,
  ) {
    console.log('businessVendorManager.id:', businessVendorManager.id);
    const query = this.mysqlManager(BusinessVendorManager).findOne({
      where: {
        id: businessVendorManager.id,
      },
      relations: [
        'businessVendorFieldManagerValues',
        'businessVendorFieldManagerValues.businessVendorField',
        'businessVendorFieldManagerValues.businessVendorField.informationType',
        'businessVendorFieldManagerValues.businessVendorField.fieldType',
        'businessVendorFieldManagerValues.idx',
      ],
    });
    return query;
  }
}
