import { BusinessVendorMeetingTimeList } from './../entity/mysql/entities/MysqlBusinessVendorMeetingTimeList';
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

  public delete(
    businessMeetingRoomReservation: BusinessMeetingRoomReservation,
  ) {
    const query = this.mysqlManager(BusinessMeetingRoomReservation).delete({
      id: businessMeetingRoomReservation.id,
    });

    return query;
  }

  public get(businessMeetingRoomReservation: BusinessMeetingRoomReservation) {
    const query = this.mysqlManager(BusinessMeetingRoomReservation).findOne({
      where: {
        id: businessMeetingRoomReservation.id,
      },
      relations: [
        'businessMeetingRoom',
        'userBuyerMeetingTimeList',
        'userBuyerMeetingTimeList.userBuyer',
        'userBuyerMeetingTimeList.businessMeetingTimeList',
        'userBuyerMeetingTimeList.businessMeetingTimeList.businessMeetingTime',
        'businessVendor',
        'businessVendor.businessVendorManagers',
        'businessVendor.businessVendorManagers.businessVendorFieldManagerValues',
        'businessVendor.businessVendorManagers.businessVendorFieldManagerValues.businessVendorField',
        'businessVendor.businessVendorManagers.businessVendorFieldManagerValues.businessVendorField.informationType',
        'businessVendor.businessVendorManagers.businessVendorFieldManagerValues.businessVendorField.fieldType',
      ],
    });
    return query;
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
   * @description
   * 해당 타임리스트의 예약정보를 가져온다.
   * @param {BusinessMeetingTimeList} businessMeetingTimeList
   * @returns
   * @memberof ServiceUserMeetingRoomReservation
   */
  public _getVendorMeetingTimeListBySelf(
    businessMeetingTimeList: BusinessVendorMeetingTimeList,
  ) {
    const query = this.mysqlManager(BusinessVendorMeetingTimeList).findOne({
      where: {
        id: businessMeetingTimeList.id,
      },
      relations: ['businessMeetingRoomReservations'],
    });

    return query;
  }

  /**
   * 밴더아이디와, 비즈니스 미팅 타임리스트 번호로 바이어의 타임 리스트 번호를 가져온다.
   * 예약정보를 저장할때 저장해줘야 한다. 그래야 바이어에서 스케쥴 조회 할때 추적이 가능해짐
   *
   * @param {BusinessVendor} businessVendor
   * @param {BusinessMeetingTimeList} businessMeetingTimeList
   * @returns
   * @memberof ServiceUserMeetingRoomReservation
   */
  public _getUserMeetingTimeListByBV_BMTL(
    businessVendor: BusinessVendor,
    businessMeetingTimeList: BusinessMeetingTimeList,
  ) {
    const query = this.mysqlManager(UserBuyerMeetingTimeList).findOne({
      where: {
        businessVendor: businessVendor,
        businessMeetingTimeList: businessMeetingTimeList,
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
