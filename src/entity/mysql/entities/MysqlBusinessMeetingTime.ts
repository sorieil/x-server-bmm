import { BusinessMeetingTimeList } from './MysqlBusinessMeetingTimeList';
import { Base } from './MysqlBase';
import { Entity, Column, OneToMany, JoinColumn, OneToOne, ManyToOne } from 'typeorm';
import { Business } from './MysqlBusiness';

@Entity()
export class BusinessMeetingTime extends Base {
    @Column('datetime', { nullable: false })
    startDt: Date;

    @Column('datetime', { nullable: false })
    endDt: Date;

    @Column('int', { default: false })
    intervalTime: number;

    @ManyToOne(type => Business, business => business.businessMeetingTimes, {
        onDelete: 'CASCADE',
    })
    business: Business;

    @OneToMany(type => BusinessMeetingTimeList, businessMeetingTimeList => businessMeetingTimeList.businessMeetingTime)
    businessMeetingTimeLists: BusinessMeetingTimeList[];
}
