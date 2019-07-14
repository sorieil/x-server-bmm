import { Base, StatusTypeRole } from './MysqlBase';
import { Entity, Column, OneToMany, JoinColumn, OneToOne, ManyToOne, ManyToMany } from 'typeorm';
import { type } from 'os';
import { CodeTable } from './MysqlCodeTable';
import { BusinessVenderInformationField } from './MysqlBusinessVenderInformationField';

@Entity()
export class BusinessVenderInformationFieldChildNode extends Base {
    @Column('varchar')
    text: string;

    @Column('tinyint', { default: 0 })
    sort: number;
    @ManyToOne(
        type => BusinessVenderInformationField,
        businessVenderInformationField => BusinessVenderInformationFieldChildNode,
        { onDelete: 'CASCADE' },
    )
    @JoinColumn()
    businessVenderInformationField: BusinessVenderInformationField;
}
