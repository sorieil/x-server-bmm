import { UserBuyerMeetingTimeList } from './MysqlUserBuyerMeetingTimeList';
import { BusinessMeetingTimeList } from './MysqlBusinessMeetingTimeList';
import { Base, StatusTypeRole } from './MysqlBase';
import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
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

    // 예약테이블에 입력할 방도가 없어서 사용못함.. 어렵다.
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
        { onDelete: 'CASCADE' },
    )
    businessMeetingTimeList: BusinessMeetingTimeList;
}
