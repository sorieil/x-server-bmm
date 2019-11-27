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
      .leftJoinAndSelect(
        'buyerTime.businessMeetingTimeList',
        'businessTimeList',
      )
      .leftJoinAndSelect(
        'buyerTime.businessMeetingRoomReservation',
        'reservation',
      )
      .leftJoinAndSelect('reservation.businessMeetingRoom', 'room')
      .leftJoinAndSelect('reservation.businessVendor', 'vendor')
      .leftJoinAndSelect('vendor.businessVendorFieldValues', 'fieldValue')
      .leftJoinAndSelect('fieldValue.businessVendorField', 'field')
      .leftJoinAndSelect('field.informationType', 'informationType')
      .leftJoinAndSelect('field.fieldType', 'fieldType')
      .andWhere('businessTimeList.dateBlock = :dateBlock', {
        dateBlock: businessMeetingTimeList.dateBlock,
      })
      .andWhere('userBuyerId = :userBuyerId', {
        userBuyerId: userBuyer.id,
      })
      .orderBy('businessTimeList.id');
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
        'businessTime.userBuyerMeetingTimeLists',
        'userListTime',
      )
      .leftJoinAndSelect(
        'userListTime.businessMeetingRoomReservation',
        'reservation',
      )
      .leftJoinAndSelect('userListTime.userBuyer', 'user');

    if (businessMeetingTimeList.dateBlock) {
      queryBuilder.andWhere('businessTime.dateBlock = :dateBlock', {
        dateBlock: businessMeetingTimeList.dateBlock,
      });
    }
    console.log('vendor:', businessVendor);

    if (businessVendor.id) {
      queryBuilder.andWhere('vendorTime.businessVendorId = :businessVendorId', {
        businessVendorId: businessVendor.id,
      });
    }
    // queryBuilder.orderBy('businessTimeList.id');

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
      .leftJoinAndSelect('vendorTime.businessVendor', 'vendor')
      .leftJoinAndSelect(
        'vendor.businessMeetingRoomReservations',
        'reservation',
      )
      .leftJoinAndSelect('reservation.userBuyerMeetingTimeList', 'userTimeList')
      .leftJoinAndSelect('userTimeList.userBuyer', 'userBuyer');

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
