import { BusinessMeetingTimeList } from './MysqlBusinessMeetingTimeList';
import { Base } from './MysqlBase';
import { Entity, Column, OneToMany, JoinColumn, OneToOne } from 'typeorm';
import { Business } from './MysqlBusiness';

@Entity()
export class BusinessMeetingTime extends Base {
    @Column('datetime', { nullable: false })
    startDt: Date;

    @Column('datetime', { nullable: false })
    endDt: Date;

    @Column('int', { default: false })
    intervalTime: number;

    @OneToOne(type => Business, business => business.businessMeetingTime, {
        onDelete: 'CASCADE',
    })
    @JoinColumn()
    business: Business;

    @OneToOne(type => BusinessMeetingTimeList, businessMeetingTimeList => businessMeetingTimeList.businessMeetingTime)
    businessMeetingTimeList: BusinessMeetingTimeList[];
}
