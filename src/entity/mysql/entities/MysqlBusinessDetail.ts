import { Business } from './MysqlBusiness';
import { Base } from './MysqlBase';
import 'reflect-metadata';
import { Entity, Column, ManyToMany, ManyToOne } from 'typeorm';

@Entity()
export class BusinessDetail extends Base {
    @Column('varchar', { nullable: true })
    title: string;

    @Column('varchar', { nullable: true })
    subTitle: string;

    @Column('boolean', { default: false })
    status: boolean;

    @Column('tinyint')
    sort: number;

    @ManyToOne(type => Business, business => business.detail)
    business: Business;
}
