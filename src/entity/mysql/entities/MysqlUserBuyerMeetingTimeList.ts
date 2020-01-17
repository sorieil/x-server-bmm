import { BusinessVendorMeetingTimeList } from './MysqlBusinessVendorMeetingTimeList';
import { Base } from './MysqlBase';
import { Entity, ManyToOne, OneToOne } from 'typeorm';
import { BusinessMeetingRoomReservation } from './MysqlBusinessMeetingRoomReservation';
import UserBuyer from './MysqlUserBuyer';
import { BusinessMeetingTimeList } from './MysqlBusinessMeetingTimeList';
import { BusinessMeetingRoom } from './MysqlBusinessMeetingRoom';

@Entity()
export class UserBuyerMeetingTimeList extends Base {
    // @Column('varchar', { nullable: false })
    // timeBlock: string;

    // @Column('varchar', { nullable: false })
    // dateBlock: string;

    // TODO: 여기에서 비즈니스 주최자가 타임 블럭을 비활성화 시키면, 바이어도 못하게 되어야 하는데
    // TODO:  밴더는 그걸 다시 수정 할 수 있는 구조로 되어 있다. 논리적 오류.
    // @Column({ type: 'enum', enum: ['no', 'yes'], default: 'yes' })
    // use: StatusTypeRole;

    @OneToOne(
        type => BusinessMeetingRoomReservation,
        businessMeetingRoomReservation =>
            businessMeetingRoomReservation.userBuyerMeetingTimeList,
    )
    businessMeetingRoomReservation: BusinessMeetingRoomReservation;

    @ManyToOne(
        type => BusinessMeetingTimeList,
        businessMeetingTimeList =>
            businessMeetingTimeList.userBuyerMeetingTimeLists,
        { onDelete: 'CASCADE' },
    )
    businessMeetingTimeList: BusinessMeetingTimeList;

    @ManyToOne(
        type => UserBuyer,
        userBuyer => userBuyer.userBuyerMeetingTimeLists,
        { nullable: true, onDelete: 'CASCADE' },
    )
    userBuyer: UserBuyer;

    @ManyToOne(
        type => BusinessVendorMeetingTimeList,
        businessVendorMeetingTimeList =>
            businessVendorMeetingTimeList.userBuyerMeetingTimeLists,
    )
    businessVendorMeetingTimeList: BusinessVendorMeetingTimeList;
}
