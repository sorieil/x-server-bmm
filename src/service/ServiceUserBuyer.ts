import { BaseService } from './BaseService';
import UserBuyer from '../entity/mysql/entities/MysqlUserBuyer';
import { User } from '../entity/mysql/entities/MysqlUser';

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

  public _getUserBuyerByUser(user: User) {
    const query = this.mysqlManager(UserBuyer).findOne({
      where: {
        user: user,
      },
    });
    return query;
  }
}
