import { BusinessCategory } from './MysqlBusinessCategory';
import { CodeTable } from './MysqlCodeTable';
import { BusinessFavorite } from './MysqlBusinessFavorite';
import { Business } from './MysqlBusiness';
import { Base } from './MysqlBase';
import 'reflect-metadata';
import { Entity, Column, ManyToOne, OneToOne, JoinColumn, OneToMany, ManyToMany } from 'typeorm';
import { BusinessVenderManager } from './MysqlBusinessVenderManager';
import { BusinessCode } from './MysqlBusinessCode';

@Entity()
export class BusinessVender extends Base {
    @Column('varchar', { nullable: true })
    name: string;

    @Column('varchar', { nullable: true })
    logoImage: string;

    @Column('varchar', { nullable: true })
    ceoName: string;

    @Column('date', { nullable: true })
    establishmentDate: Date;

    @Column('text', { nullable: true })
    serviceDescription: string;

    /**
     * 업체구분
     * @type {CodeTable}
     * @memberof BusinessVender
     */
    @ManyToOne(type => CodeTable, codeTable => codeTable.businessVender)
    businessCategory: CodeTable;

    /**
     *
     * 제품/서비스
     * @type {CodeTable}
     * @memberof BusinessVender
     */
    @ManyToOne(type => CodeTable, codeTable => codeTable.businessVender)
    serviceCategory: CodeTable;

    @Column('varchar', { nullable: true })
    serviceTarget: string;

    @OneToMany(type => BusinessVenderManager, businessVenderManager => businessVenderManager.businessVender)
    businessVenderManagers: BusinessVenderManager[];

    @ManyToOne(type => Business, business => business.businessVenders, { onDelete: 'CASCADE' })
    @JoinColumn()
    business: Business;

    @ManyToMany(type => BusinessFavorite, businessFavorite => businessFavorite.businessVender)
    businessFavorite: BusinessFavorite;

    @OneToOne(type => BusinessCode, businessCode => businessCode.businessVender)
    businessCode: BusinessCode;
}
