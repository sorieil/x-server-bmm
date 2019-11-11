import { BusinessVendorManager } from './MysqlBusinessVendorManager';
import { BusinessMeetingRoom } from './MysqlBusinessMeetingRoom';
import { Base } from './MysqlBase';
import { Entity, ManyToOne, JoinColumn, OneToOne, Column } from 'typeorm';
import { UserBuyerMeetingTimeList } from './MysqlUserBuyerMeetingTimeList';
import { BusinessVendorMeetingTimeList } from './MysqlBusinessVendorMeetingTimeList';
import { BusinessVendor } from './MysqlBusinessVendor';

@Entity()
export class BusinessMeetingRoomReservation extends Base {
  // 이 정보로 시간을 가져와야 한다. 시간이 수정된다고 하면...
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

  // 현 시점에서 사실 필요가 없다.
  // 이유는 미팅마다 매니저를 지정하지 않고, 모두 나오게 하기때문이다.

  // TODO: 나중에 매니저를 지정해야 하는 상황이라면, 필요 하겠다.
  @ManyToOne(
    type => BusinessVendorManager,
    businessVendorManager =>
      businessVendorManager.businessMeetingRoomReservations,
  )
  businessVendorManager: BusinessVendorManager;
  @ManyToOne(
    type => BusinessVendor,
    businessVendor => businessVendor.businessMeetingRoomReservations,
    { onDelete: 'CASCADE' },
  )
  businessVendor: BusinessVendor;
}
