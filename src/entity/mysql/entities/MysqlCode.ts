import { Base } from './MysqlBase';
import { Entity, Column, OneToMany, ManyToMany } from 'typeorm';
import { BusinessVenderFieldValue } from './MysqlBusinessVenderFieldValue';
import { BusinessVenderField } from './MysqlBusinessVenderField';

@Entity()
export class Code extends Base {
    @Column('varchar', { nullable: false })
    name: string;

    @Column({
        type: 'enum',
        enum: ['information', 'company_info_type', 'business_category', 'service_category', 'field_type'],
        nullable: true,
    })
    category: 'information' | 'company_info_type' | 'business_category' | 'service_category' | 'field_type';

    @Column('tinyint', { default: 0 })
    sort: number;

    @Column({ type: 'enum', enum: ['textarea', 'text', 'select_box', 'no_type', null, 'checkbox', 'idx'] })
    columnType: 'textarea' | 'text' | 'select_box' | 'no_type' | 'checkbox' | 'idx' | null;

    @OneToMany(type => BusinessVenderFieldValue, businessVenderField => businessVenderField.code)
    businessVenderFieldValues: BusinessVenderFieldValue[];

    @OneToMany(type => BusinessVenderField, businessVenderField => businessVenderField.informationType)
    businessVenderFieldInformationTypes: BusinessVenderField[];

    @OneToMany(type => BusinessVenderField, businessVenderField => businessVenderField.fieldType)
    businessVenderFieldTypes: BusinessVenderField[];
}
