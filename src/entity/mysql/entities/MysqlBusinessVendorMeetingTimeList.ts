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
} from 'typeorm';
import { BusinessMeetingTime } from './MysqlBusinessMeetingTime';
import { BusinessMeetingRoomReservation } from './MysqlBusinessMeetingRoomReservation';

/**
 * BusinessMeetingTime 에서 정산 시간에 따라서 인터벌 값이 저장된다.
 */
@Entity()
export class BusinessVendorMeetingTimeList extends Base {
  @Column('varchar', { nullable: false })
  timeBlock: string;

  @Column('varchar', { nullable: false })
  dateBlock: string;

  // @Column({ type: 'enum', enum: ['no', 'yes'], default: 'yes' })
  // use: StatusTypeRole;

  // 비즈니스에서 만약에 하나의 블럭에
  @OneToOne(
    type => BusinessMeetingTimeList,
    businessMeetingTimeList => businessMeetingTimeList.use,
    { onUpdate: 'CASCADE' },
  )
  @JoinColumn()
  use: StatusTypeRole;

  // @Column('tinyint', { nullable: false, default: 0 })
  // reservationCount: number;

  @Column('tinyint', { nullable: false, default: 0 })
  @ManyToOne(
    type => BusinessMeetingTime,
    businessMeetingTime => businessMeetingTime.businessMeetingTimeLists,
    {
      onDelete: 'CASCADE',
    },
  )
  businessMeetingTime: BusinessMeetingTime;

  // 예약이 가능한지 안한지를 체크 할때는 이 부분에서 결정난다. 각기 다른 미팅룸으로 예약이 잡혀 있다면, 예약은 더이상 불가능
  @ManyToMany(
    type => BusinessMeetingRoomReservation,
    businessMeetingRoomReservation =>
      businessMeetingRoomReservation.businessMeetingTimeLists,
  )
  @JoinTable()
  businessMeetingRoomReservations: BusinessMeetingRoomReservation[];
}
