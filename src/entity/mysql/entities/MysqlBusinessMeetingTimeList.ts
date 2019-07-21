import { BusinessMeetingRoom } from './MysqlBusinessMeetingRoom';
import { Base, StatusTypeRole } from './MysqlBase';
import { Entity, Column, ManyToOne } from 'typeorm';
import { BusinessMeetingTime } from './MysqlBusinessMeetingTime';
import { User } from './MysqlUser';

@Entity()
export class BusinessMeetingTimeList extends Base {
    @Column('varchar', { nullable: false })
    timeBlock: string;

    @Column('varchar', { nullable: false })
    dateBlock: string;

    @Column({ type: 'enum', enum: ['no', 'yes'], default: 'yes' })
    use: StatusTypeRole;

    @Column('text', { nullable: true })
    memo: string;

    @ManyToOne(type => BusinessMeetingRoom, businessMeetingRoom => businessMeetingRoom.businessMeetingTimeLists)
    businessMeetingRoom: BusinessMeetingRoom;
    @ManyToOne(type => User, user => user.businessMeetingTimeLists, { nullable: true })
    user: number;
    @ManyToOne(type => BusinessMeetingTime, businessMeetingTime => businessMeetingTime.businessMeetingTimeLists, {
        onDelete: 'CASCADE',
    })
    businessMeetingTime: BusinessMeetingTime;
}
