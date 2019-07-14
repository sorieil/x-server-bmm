import { Base, StatusTypeRole } from './MysqlBase';
import { Entity, Column, OneToMany, JoinColumn, OneToOne, ManyToOne, ManyToMany } from 'typeorm';
import { type } from 'os';
import { CodeTable } from './MysqlCodeTable';
import { BusinessVenderInformationFieldChildNode } from './MysqlBusinessVenderInformationFieldChildNode';
import { Business } from './MysqlBusiness';

@Entity()
export class BusinessVenderInformationField extends Base {
    @Column('varchar', { nullable: false })
    name: string;

    @Column({ type: 'enum', enum: ['no', 'yes'], default: 'no' })
    require: StatusTypeRole;

    @Column('tinyint', { default: 0 })
    sort: number;

    @ManyToOne(type => CodeTable, codeTable => codeTable.businessVenderInformationFieldMainType)
    @JoinColumn()
    mainType: CodeTable;

    @ManyToOne(type => CodeTable, codeTable => codeTable.businessVenderInformationFieldSubType)
    @JoinColumn()
    subType: CodeTable;
    @OneToMany(
        type => BusinessVenderInformationFieldChildNode,
        businessVenderInformationFieldChildNode =>
            businessVenderInformationFieldChildNode.businessVenderInformationField,
    )
    businessVenderInformationFieldChildNodes: BusinessVenderInformationFieldChildNode[];

    @ManyToOne(type => Business, business => business.businessVenderInformationFields, {
        onDelete: 'CASCADE',
    })
    @JoinColumn()
    business: Business;
}
