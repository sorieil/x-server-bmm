import { Business } from './MysqlBusiness';
import { Base } from './MysqlBase';
import 'reflect-metadata';
import { Entity, Column, ManyToOne, JoinTable, JoinColumn, RelationId } from 'typeorm';

@Entity()
export class BusinessMeetingRoom extends Base {
    @Column('varchar', { nullable: false })
    name: string;

    @Column('varchar', { nullable: false })
    location: string;

    @Column('tinyint', { nullable: true, default: 0 })
    sort: number;

    @ManyToOne(type => Business, business => business.businessMeetingRoom)
    business: Business;
}
