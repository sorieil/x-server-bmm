import { BaseService } from './BaseService';
import { Login } from '../entity/mysql/entities/MysqlLogin';
import { User } from '../entity/mysql/entities/MysqlUser';
import { BusinessVendor } from '../entity/mysql/entities/MysqlbusinessVendor';
import { Business } from '../entity/mysql/entities/MysqlBusiness';
export default class ServiceUserPermission extends BaseService {
  constructor() {
    super();
  }

  public async _byLogin(login: Login) {
    const query = this.mysqlManager(User).findOne({
      where: {
        login: login,
      },
    });
    return query;
  }

  public async _getWithBusinessVendor(
    businessVendor: BusinessVendor,
    business: Business,
  ) {
    const query = this.mysqlManager(BusinessVendor).findOne({
      where: { id: businessVendor.id, business: business },
    });
    return query;
  }
}
