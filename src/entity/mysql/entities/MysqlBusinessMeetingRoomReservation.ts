import { BusinessVendorManager } from './MysqlBusinessVendorManager';
import { BusinessMeetingRoom } from './MysqlBusinessMeetingRoom';
import { BusinessMeetingTimeList } from './MysqlBusinessMeetingTimeList';

import { Base } from './MysqlBase';
import {
  Entity,
  ManyToOne,
  JoinColumn,
  OneToOne,
  ManyToMany,
  Column,
} from 'typeorm';
import { UserBuyerMeetingTimeList } from './MysqlUserBuyerMeetingTimeList';
import { BusinessVendorMeetingTimeList } from './MysqlBusinessVendorMeetingTimeList';

@Entity()
export class BusinessMeetingRoomReservation extends Base {
  @ManyToOne(
    type => BusinessVendorMeetingTimeList,
    businessVendorMeetingTimeList =>
      businessVendorMeetingTimeList.businessMeetingRoomReservations,
    { onDelete: 'CASCADE' },
  )
  businessVendorMeetingTimeList: BusinessVendorMeetingTimeList;

  @ManyToOne(
    type => BusinessMeetingRoom,
    businessMeetingRoom => businessMeetingRoom.businessMeetingRoomReservations,
  )
  businessMeetingRoom: BusinessMeetingRoom;

  @OneToOne(
    type => UserBuyerMeetingTimeList,
    userBuyerMeetingTimeList =>
      userBuyerMeetingTimeList.businessMeetingRoomReservation,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn()
  userBuyerMeetingTimeList: UserBuyerMeetingTimeList;

  @Column('text', { nullable: true })
  memo: string;

  @ManyToOne(
    type => BusinessVendorManager,
    businessVendorManager =>
      businessVendorManager.businessMeetingRoomReservations,
  )
  businessVendorManager: BusinessVendorManager;
}
