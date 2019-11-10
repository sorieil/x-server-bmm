import { BusinessCode } from '../entity/mysql/entities/MysqlBusinessCode';
import { BaseService } from './BaseService';
import { BusinessMeetingRoom } from '../entity/mysql/entities/MysqlBusinessMeetingRoom';
import { Business } from '../entity/mysql/entities/MysqlBusiness';

export default class ServiceUserMeetingRoom extends BaseService {
  constructor() {
    super();
  }

  /**
   * @description
   * 미팅룸의 정보를 가져온다.
   *
   * @param {BusinessMeetingRoom} businessMeetingRoom
   * @returns
   * @memberof ServiceUserMeetingRoom
   * @target User
   */
  public async _getBusinessMeetingRoomByBusiness(business: Business) {
    const query = this.mysqlManager(BusinessMeetingRoom).find({
      where: { business: business },
    });
    return query;
  }
}
