import { BusinessFavorite } from './MysqlBusinessFavorite';
import { Business } from './MysqlBusiness';
import { Base } from './MysqlBase';
import { Entity, Column, ManyToOne, OneToOne, JoinColumn, OneToMany, ManyToMany } from 'typeorm';
import { BusinessVenderManager } from './MysqlBusinessVenderManager';
import { BusinessCode } from './MysqlBusinessCode';
import { BusinessVenderFieldValue } from './MysqlBusinessVenderFieldValue';

@Entity()
export class BusinessVender extends Base {
    @Column('varchar', { nullable: true })
    logoImage: string;

    // @Column('varchar', { nullable: true })
    // serviceTarget: string;

    @OneToMany(type => BusinessVenderManager, businessVenderManager => businessVenderManager.businessVender)
    businessVenderManagers: BusinessVenderManager[];

    @ManyToOne(type => Business, business => business.businessVenders, { onDelete: 'CASCADE' })
    business: Business;

    @ManyToMany(type => BusinessFavorite, businessFavorite => businessFavorite.businessVender)
    businessFavorite: BusinessFavorite;

    @OneToOne(type => BusinessCode, businessCode => businessCode.businessVender, { onDelete: 'CASCADE' })
    @JoinColumn()
    businessCode: BusinessCode;

    @OneToMany(type => BusinessVenderFieldValue, businessVenderFieldValue => businessVenderFieldValue.businessVender)
    businessVenderFieldValues: BusinessVenderFieldValue[];
}
