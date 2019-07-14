import { BusinessVender } from './MysqlBusinessVender';
import { Business } from './MysqlBusiness';
import { Base } from './MysqlBase';
import 'reflect-metadata';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity()
export class BusinessVenderManager extends Base {
    @Column('varchar', { nullable: true })
    name: string;

    @Column('varchar', { nullable: true })
    profileImg: string;

    @Column('varchar', { nullable: true })
    phone: string;

    @Column('varchar')
    email: string;

    @ManyToOne(type => BusinessVender, businessVender => businessVender.businessVenderManagers, { onDelete: 'CASCADE' })
    @JoinColumn()
    businessVender: BusinessVender;
}
