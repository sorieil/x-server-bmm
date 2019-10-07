import { BusinessCode } from '../entity/mysql/entities/MysqlBusinessCode';
import { BaseService } from './BaseService';

export default class ServiceSample extends BaseService {
  constructor() {
    super();
  }

  public async get(businessCode: BusinessCode) {
    const query = this.mysqlManager(BusinessCode).findOne({
      where: { id: businessCode.id },
    });
    return query;
  }
}
