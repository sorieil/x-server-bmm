import { BaseService } from './BaseService';
import { Login } from '../entity/mysql/entities/MysqlLogin';
import { User } from '../entity/mysql/entities/MysqlUser';
import { BusinessVender } from '../entity/mysql/entities/MysqlBusinessVender';
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

  public async _getWithBusinessVender(
    businessVender: BusinessVender,
    business: Business,
  ) {
    const query = this.mysqlManager(BusinessVender).findOne({
      where: { id: businessVender.id, business: business },
    });
    return query;
  }
}
