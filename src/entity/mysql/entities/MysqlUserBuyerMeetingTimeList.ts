import { BusinessMeetingRoom } from './MysqlBusinessMeetingRoom';
import { Base, StatusTypeRole } from './MysqlBase';
import { Entity, Column, ManyToOne, OneToOne } from 'typeorm';
import { BusinessMeetingRoomReservation } from './MysqlBusinessMeetingRoomReservation';
import UserBuyer from './MysqlUserBuyer';

@Entity()
export class UserBuyerMeetingTimeList extends Base {
  @Column('varchar', { nullable: false })
  timeBlock: string;

  @Column('varchar', { nullable: false })
  dateBlock: string;

  @Column('text', { nullable: true })
  memo: string;

  @OneToOne(
    type => BusinessMeetingRoomReservation,
    businessMeetingRoomReservation =>
      businessMeetingRoomReservation.userBuyerMeetingTimeList,
  )
  businessMeetingRoomReservation: BusinessMeetingRoom;

  @ManyToOne(
    type => UserBuyer,
    userBuyer => userBuyer.userBuyerMeetingTimeLists,
    { nullable: true },
  )
  userBuyer: UserBuyer;
}
