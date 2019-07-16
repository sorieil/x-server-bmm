import { Base } from './MysqlBase';
import { Entity, Column, OneToMany, JoinColumn, OneToOne, ManyToOne, ManyToMany } from 'typeorm';
import { BusinessCategory } from './MysqlBusinessCategory';
import { BusinessVenderInformationField } from './MysqlBusinessVenderInformationField';
import { BusinessVender } from './MysqlBusinessVender';

type CodeCategory = 'information' | 'company_info_type' | 'business_category' | 'service_category';
@Entity()
export class CodeTable extends Base {
    @Column('varchar', { nullable: false })
    name: string;

    @Column({
        type: 'enum',
        enum: ['information', 'company_info_type', 'business_category', 'service_category'],
        nullable: true,
    })
    category: CodeCategory;

    @Column('tinyint', { default: 0 })
    sort: number;

    @OneToMany(
        type => BusinessVenderInformationField,
        businessVenderInformationField => businessVenderInformationField.mainType,
    )
    businessVenderInformationFieldMainType: BusinessVenderInformationField[];

    @OneToMany(
        type => BusinessVenderInformationField,
        businessVenderInformationField => businessVenderInformationField.subType,
    )
    businessVenderInformationFieldSubType: BusinessVenderInformationField[];

    @OneToMany(type => BusinessVender, businessVender => businessVender)
    businessVender: BusinessVender[];
}
