import { BusinessMeetingRoom } from './MysqlBusinessMeetingRoom';
import { BusinessDetail } from './MysqlBusinessDetail';
import { BusinessVender } from './MysqlBusinessVender';
import { Base, StatusTypeRole } from './MysqlBase';
import { Entity, Column, OneToMany, JoinColumn, OneToOne, ManyToOne } from 'typeorm';
import { Admin } from './MysqlAdmin';
import { Business } from './MysqlBusiness';
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

    @ManyToOne(type => BusinessMeetingRoom, businessMeetingRoom => businessMeetingRoom.businessMeetingTimeLists, {
        onDelete: 'CASCADE',
    })
    @JoinColumn()
    businessMeetingRoom: BusinessMeetingRoom;
    @ManyToOne(type => User, user => user.businessMeetingTimeLists, { nullable: true })
    user: number;
    @OneToOne(type => BusinessMeetingTime, businessMeetingTime => businessMeetingTime.businessMeetingTimeList)
    @JoinColumn()
    businessMeetingTime: BusinessMeetingTime;
}
