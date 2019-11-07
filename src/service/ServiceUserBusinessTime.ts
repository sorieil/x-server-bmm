import { BusinessVendorMeetingTimeList } from './../entity/mysql/entities/MysqlBusinessVendorMeetingTimeList';
import { User } from './../entity/mysql/entities/MysqlUser';
import { BusinessMeetingTimeList } from './../entity/mysql/entities/MysqlBusinessMeetingTimeList';
import { BaseService } from './BaseService';
import UserBuyer from '../entity/mysql/entities/MysqlUserBuyer';
import { UserBuyerMeetingTimeList } from '../entity/mysql/entities/MysqlUserBuyerMeetingTimeList';
import { BusinessVendor } from '../entity/mysql/entities/MysqlBusinessVendor';

export default class ServiceUserBusinessTime extends BaseService {
  constructor() {
    super();
  }

  /**
   * 타임블럭의 날짜를 기준으로 데이터를 가져온다.
   * @param businessMeetingTimeList.dateBlock dateBlock 의 값 2019-01-01
   * @param businessMeetingTimeList.businessMeetingTimeId 타임테이블의 부모 테이블의 아이디 값
   */
  public _getTimeListByDateBlockForBuyer(
    userBuyer: UserBuyer,
    businessMeetingTimeList: BusinessMeetingTimeList,
  ) {
    const queryBuilder = this.mysqlConnection
      .getRepository(UserBuyerMeetingTimeList)
      .createQueryBuilder('buyerTime')
      .leftJoinAndSelect('buyerTime.businessMeetingTimeList', 'businessTime')
      .leftJoinAndSelect(
        'buyerTime.businessMeetingRoomReservation',
        'reservation',
      )
      // .leftJoinAndSelect('buyerTime.userBuyer', 'userBuyer')
      .andWhere('businessTime.dateBlock = :dateBlock', {
        dateBlock: businessMeetingTimeList.dateBlock,
      })
      .andWhere('userBuyerId = :userBuyerId', {
        userBuyerId: userBuyer.id,
      });
    const query = queryBuilder.getMany();
    return query;
  }

  public _getTimeListByDateBlockForManger(
    businessVendor: BusinessVendor,
    businessMeetingTimeList?: BusinessMeetingTimeList,
  ) {
    const queryBuilder = this.mysqlConnection
      .getRepository(BusinessVendorMeetingTimeList)
      .createQueryBuilder('vendorTime')
      .leftJoinAndSelect('vendorTime.businessMeetingTimeList', 'businessTime')
      .leftJoinAndSelect(
        'vendorTime.businessMeetingRoomReservations',
        'reservation',
      );

    if (businessMeetingTimeList.dateBlock) {
      queryBuilder.andWhere('businessTime.dateBlock = :dateBlock', {
        dateBlock: businessMeetingTimeList.dateBlock,
      });
    }

    if (businessVendor.id) {
      queryBuilder.andWhere('businessVendorId = :businessVendorId', {
        businessVendorId: businessVendor.id,
      });
    }

    const query = queryBuilder.getMany();
    return query;
  }

  public _getTimeListByDateBlockForAllBuyer(
    businessVendor: BusinessVendor,
    businessMeetingTimeList?: BusinessMeetingTimeList,
  ) {
    const queryBuilder = this.mysqlConnection
      .getRepository(BusinessVendorMeetingTimeList)
      .createQueryBuilder('vendorTime')
      .leftJoinAndSelect('vendorTime.businessMeetingTimeList', 'businessTime')
      .leftJoinAndSelect(
        'vendorTime.businessMeetingRoomReservations',
        'reservation',
      )
      .leftJoinAndSelect('vendorTime.businessVendor', 'vendor')
      .leftJoinAndSelect('vendor.businessVendorManagers', 'manager');

    if (businessMeetingTimeList.dateBlock) {
      queryBuilder.andWhere('businessTime.dateBlock = :dateBlock', {
        dateBlock: businessMeetingTimeList.dateBlock,
      });
    }

    if (businessVendor.id) {
      queryBuilder.andWhere('businessVendorId = :businessVendorId', {
        businessVendorId: businessVendor.id,
      });
    }

    const query = queryBuilder.getMany();
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
