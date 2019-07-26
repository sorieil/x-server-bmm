import { BusinessVenderField } from './MysqlBusinessVenderField';
import { Base } from './MysqlBase';
import 'reflect-metadata';
import { Entity, Column, ManyToOne, OneToOne, JoinColumn, OneToMany, ManyToMany } from 'typeorm';
import { BusinessVender } from './MysqlBusinessVender';
import { Code } from './MysqlCode';

@Entity()
export class BusinessVenderFieldValue extends Base {
    @ManyToOne(type => BusinessVender, businessVender => businessVender.businessVenderFieldValues, {
        onDelete: 'CASCADE',
        nullable: false,
    })
    businessVender: BusinessVender;

    @ManyToOne(type => Code, code => code.businessVenderFieldValues)
    code: Code;

    @ManyToOne(type => BusinessVenderField, businessVenderField => businessVenderField.businessVenderFieldValues, {
        nullable: false,
    })
    businessVenderField: BusinessVenderField;

    @Column('varchar', { nullable: true })
    text: string;

    @Column('text', { nullable: true })
    textarea: string;
}
