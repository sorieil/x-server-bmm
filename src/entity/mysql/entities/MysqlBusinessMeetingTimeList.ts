import { BusinessVendorMeetingTimeList } from './MysqlBusinessVendorMeetingTimeList';
import { Base, StatusTypeRole } from './MysqlBase';
import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { BusinessMeetingTime } from './MysqlBusinessMeetingTime';
import { UserBuyerMeetingTimeList } from './MysqlUserBuyerMeetingTimeList';

/**
 * BusinessMeetingTime 에서 정산 시간에 따라서 인터벌 값이 저장된다.
 */
@Entity()
export class BusinessMeetingTimeList extends Base {
  @Column('varchar', { nullable: false })
  timeBlock: string;

  @Column('varchar', { nullable: false })
  dateBlock: string;

  @Column({ type: 'enum', enum: ['no', 'yes'], default: 'yes' })
  use: StatusTypeRole;

  @ManyToOne(
    type => BusinessMeetingTime,
    businessMeetingTime => businessMeetingTime.businessMeetingTimeLists,
    {
      onDelete: 'CASCADE',
    },
  )
  businessMeetingTime: BusinessMeetingTime;

  @OneToMany(
    type => UserBuyerMeetingTimeList,
    userBuyerMeetingTimeList =>
      userBuyerMeetingTimeList.businessMeetingTimeList,
  )
  userBuyerMeetingTimeLists: UserBuyerMeetingTimeList[];

  @OneToMany(
    type => BusinessVendorMeetingTimeList,
    businessVendorMeetingTimeList =>
      businessVendorMeetingTimeList.businessMeetingTimeList,
  )
  businessVendorMeetingTimeLists: BusinessVendorMeetingTimeList[];
}
