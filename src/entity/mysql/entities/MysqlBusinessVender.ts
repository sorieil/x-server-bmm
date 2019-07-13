/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import { Business } from './MysqlBusiness';
import { Base } from './MysqlBase';
import 'reflect-metadata';
import { Entity, Column, ManyToOne, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { BusinessVenderManager } from './MysqlBusinessVenderManager';

@Entity()
export class BusinessVender extends Base {
    @Column('varchar', { nullable: true })
    name: string;

    @Column('varchar', { nullable: true })
    code: string;

    @Column('varchar', { nullable: true })
    ceoName: string;

    @Column('date')
    establishmentDate: Date;

    @Column('varchar')
    contactName: string;
    @OneToMany(type => BusinessVenderManager, businessVenderManager => businessVenderManager.businessVender)
    @JoinColumn()
    businessVenderManager: BusinessVenderManager[];
    @ManyToOne(type => Business, business => business.businessVender)
    business: Business;
}
