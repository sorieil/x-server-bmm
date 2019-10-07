import { BaseService } from './BaseService';
import UserBuyer from '../entity/mysql/entities/MysqlUserBuyer';

export default class ServiceUserBuyer extends BaseService {
  constructor() {
    super();
  }

  public post(userBuyer: UserBuyer) {
    const query = this.mysqlManager(UserBuyer).save(userBuyer);
    return query;
  }

  public get(userBuyer: UserBuyer) {
    const query = this.mysqlManager(UserBuyer).findOne(userBuyer);
    return query;
  }
}
