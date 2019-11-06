import { UserBuyerMeetingTimeList } from './MysqlUserBuyerMeetingTimeList';
import { BusinessMeetingTimeList } from './MysqlBusinessMeetingTimeList';
import { Base, StatusTypeRole } from './MysqlBase';
import {
  Entity,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  JoinColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { BusinessMeetingTime } from './MysqlBusinessMeetingTime';
import { BusinessMeetingRoomReservation } from './MysqlBusinessMeetingRoomReservation';
import { BusinessVendor } from './MysqlBusinessVendor';

/**
 * BusinessMeetingTime 에서 정산 시간에 따라서 인터벌 값이 저장된다.
 */
@Entity()
export class BusinessVendorMeetingTimeList extends Base {
  @Column('varchar', { nullable: false })
  timeBlock: string;

  @Column('varchar', { nullable: false })
  dateBlock: string;

  @Column({ type: 'enum', enum: ['no', 'yes'], default: 'yes' })
  use: StatusTypeRole;

  @OneToMany(
    type => BusinessMeetingRoomReservation,
    businessMeetingRoomReservation =>
      businessMeetingRoomReservation.businessVendorMeetingTimeList,
    { nullable: true },
  )
  businessMeetingRoomReservations: BusinessMeetingRoomReservation[];

  @ManyToOne(
    type => BusinessVendor,
    businessVendor => businessVendor.businessVendorMeetingTimeLists,
    { onDelete: 'CASCADE' },
  )
  businessVendor: BusinessVendor;

  @ManyToOne(
    type => BusinessMeetingTimeList,
    businessMeetingTimeList =>
      businessMeetingTimeList.businessVendorMeetingTimeLists,
  )
  businessMeetingTimeList: BusinessMeetingTimeList;
}
