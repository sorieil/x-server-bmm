import { BusinessMeetingTimeList } from './MysqlBusinessMeetingTimeList';
import { Base } from './MysqlBase';
import { Entity, Column, OneToMany, JoinColumn, OneToOne, ManyToOne } from 'typeorm';
import { Business } from './MysqlBusiness';

@Entity()
export class BusinessMeetingTime extends Base {
    @Column('datetime', { nullable: false })
    startDate: Date;

    @Column('datetime', { nullable: false })
    endDate: Date;

    @Column('char', { length: 5, nullable: false, default: '00:00' })
    startTime: string;

    @Column('char', { length: 5, nullable: false, default: '00:00' })
    endTime: string;

    @Column('int', { default: false })
    intervalTime: number;

    @ManyToOne(type => Business, business => business.businessMeetingTimes, {
        onDelete: 'CASCADE',
    })
    business: Business;

    @OneToMany(type => BusinessMeetingTimeList, businessMeetingTimeList => businessMeetingTimeList.businessMeetingTime)
    businessMeetingTimeLists: BusinessMeetingTimeList[];
}
