import { Business } from './MysqlBusiness';
import { Base } from './MysqlBase';
import 'reflect-metadata';
import { Entity, Column, ManyToOne, JoinTable, JoinColumn, RelationId, OneToMany, OneToOne } from 'typeorm';
import { BusinessMeetingTimeList } from './MysqlBusinessMeetingTimeList';
import { BusinessMeetingRoomReservation } from './MysqlBusinessMeetingRoomReservation';

@Entity()
export class BusinessMeetingRoom extends Base {
    @Column('varchar', { nullable: false })
    name: string;

    @Column('varchar', { nullable: false })
    location: string;

    @Column('tinyint', { nullable: true, default: 0 })
    sort: number;

    @ManyToOne(type => Business, business => business.businessMeetingRooms, { onDelete: 'CASCADE' })
    @JoinColumn()
    business: Business;

    @OneToMany(
        type => BusinessMeetingRoomReservation,
        businessMeetingRoomReservation => businessMeetingRoomReservation.businessMeetingRoom,
    )
    businessMeetingRoomReservations: BusinessMeetingRoomReservation[];
}
