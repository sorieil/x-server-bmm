import { BusinessVendor } from '../entity/mysql/entities/MysqlBusinessVendor';
import { UserBuyerMeetingTimeList } from './../entity/mysql/entities/MysqlUserBuyerMeetingTimeList';
import { BusinessMeetingRoomReservation } from './../entity/mysql/entities/MysqlBusinessMeetingRoomReservation';
import { BusinessMeetingTimeList } from './../entity/mysql/entities/MysqlBusinessMeetingTimeList';
import { BaseService } from './BaseService';
import { BusinessMeetingRoom } from '../entity/mysql/entities/MysqlBusinessMeetingRoom';

export default class ServiceUserMeetingRoomReservation extends BaseService {
  constructor() {
    super();
  }

  /**
   * @description
   * 예약 정보를 저장한다.
   */
  public post(businessMeetingRoomReservation: BusinessMeetingRoomReservation) {
    const query = this.mysqlManager(BusinessMeetingRoomReservation).save(
      businessMeetingRoomReservation,
    );
    return query;
  }

  /**
   * 비즈니스의타임테이블 아이디로 바이어의 타임 테이불을 알아낸다.
   * 그래서 바이어의 타임 테이블의 아이디를 예약 정보에 넣준다.
   * 그래야 바이어가 자기의 타엠 테이블을 불러 올때 예약 정보를
   * 불러 올 수 있다.
   *
   * @param {BusinessMeetingTimeList} businessMeetingTimeList
   * @returns
   * @memberof ServiceUserMeetingRoomReservation
   */
  public _getUserBuyerMeetingTimeListByBusinessMeetingTimeList(
    businessMeetingTimeList: BusinessMeetingTimeList,
    businessVendor: BusinessVendor,
  ) {
    const query = this.mysqlManager(UserBuyerMeetingTimeList).findOne({
      where: {
        businessMeetingTimeList: businessMeetingTimeList,
        businessVendor: businessVendor,
      },
    });

    return query;
  }

  public _getBusinessMeetingRoomReservationBySelf(
    businessMeetingTimeList: BusinessMeetingTimeList,
    businessVendor: BusinessVendor,
    businessMeetingRoom: BusinessMeetingRoom,
  ) {
    const query = this.mysqlManager(BusinessMeetingRoomReservation).find({
      where: {
        businessMeetingTimeList: businessMeetingTimeList,
        businessVendor: businessVendor,
        businessMeetingRoom: businessMeetingRoom,
      },
    });

    return query;
  }

  public async update(businessMeetingTimeList: BusinessMeetingTimeList) {
    const queryRunner = this.mysqlConnection.queryRunner;
    await queryRunner.connect();

    await queryRunner.startTransaction();
    const checkQuery = await queryRunner.manager.find(BusinessMeetingTimeList, {
      where: {
        id: businessMeetingTimeList.id,
        user: '!=NULL',
      },
    });

    try {
      if (checkQuery) {
        return false;
      } else {
        await queryRunner.manager.save(businessMeetingTimeList);
      }

      // commit transaction now:
      await queryRunner.commitTransaction();
    } catch (err) {
      // since we have errors lets rollback changes we made
      await queryRunner.rollbackTransaction();
      return false;
    } finally {
      // you need to release query runner which is manually created:
      await queryRunner.release();
      return true;
    }
  }
}
