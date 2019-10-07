import { User } from './../entity/mysql/entities/MysqlUser';
import { BusinessMeetingTimeList } from './../entity/mysql/entities/MysqlBusinessMeetingTimeList';
import { BaseService } from './BaseService';
import UserBuyer from '../entity/mysql/entities/MysqlUserBuyer';

export default class ServiceUserBusinessTime extends BaseService {
  constructor() {
    super();
  }

  /**
   * 타임블럭의 날짜를 기준으로 데이터를 가져온다.
   * @param businessMeetingTimeList.dateBlock dateBlock 의 값 2019-01-01
   * @param businessMeetingTimeList.businessMeetingTimeId 타임테이블의 부모 테이블의 아이디 값
   */
  public _getByDateBlock(businessMeetingTimeList: BusinessMeetingTimeList) {
    const query = this.mysqlManager(BusinessMeetingTimeList).find({
      where: {
        dateBlock: businessMeetingTimeList.dateBlock,
        businessMeetingTime: businessMeetingTimeList.businessMeetingTime,
      },
    });
    return query;
  }

  public _getByUser(user: User) {
    const query = this.mysqlManager(UserBuyer).findOne({
      where: {
        user: user,
      },
      relations: ['user'],
    });

    return query;
  }
}
