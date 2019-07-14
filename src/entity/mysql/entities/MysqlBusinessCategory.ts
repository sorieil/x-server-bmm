import { Base } from './MysqlBase';
import { Entity, Column, OneToMany, JoinColumn, OneToOne, ManyToOne, ManyToMany } from 'typeorm';
import { CodeTable } from './MysqlCodeTable';

@Entity()
export class BusinessCategory extends Base {
    @Column('varchar')
    name: string;
    @ManyToOne(type => CodeTable, codeTable => codeTable)
    @JoinColumn()
    codeTable: CodeTable;
}
