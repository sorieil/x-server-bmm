import { Base } from './MysqlBase';
import { Entity, Column, OneToMany } from 'typeorm';
import { BusinessVendorField } from './MysqlBusinessVendorField';
import { BusinessVendorFieldValue } from './MysqlBusinessVendorFieldValue';
import { BusinessVendorFieldManagerValue } from './MysqlBusinessVendorFieldManagerValue';

@Entity()
export class Code extends Base {
  @Column('varchar', { nullable: false })
  name: string;

  @Column({
    type: 'enum',
    enum: [
      'information',
      'company_info_type',
      'business_category',
      'service_category',
      'field_type',
      'manager',
    ],
    nullable: true,
  })
  category:
    | 'information'
    | 'company_info_type'
    | 'business_category'
    | 'service_category'
    | 'field_type'
    | 'manager';

  @Column('tinyint', { default: 0 })
  sort: number;

  @Column({
    type: 'enum',
    enum: [
      'textarea',
      'text',
      'select_box',
      'no_type',
      null,
      'checkbox',
      'idx',
    ],
  })
  columnType:
    | 'textarea'
    | 'text'
    | 'select_box'
    | 'no_type'
    | 'checkbox'
    | 'idx'
    | null;

  @OneToMany(
    type => BusinessVendorFieldValue,
    businessVendorField => businessVendorField.code,
  )
  businessVendorFieldValues: BusinessVendorFieldValue[];

  @OneToMany(
    type => BusinessVendorFieldManagerValue,
    businessVendorManagerField => businessVendorManagerField.code,
  )
  businessVendorFieldManagerValues: BusinessVendorFieldManagerValue[];

  @OneToMany(
    type => BusinessVendorField,
    businessVendorField => businessVendorField.informationType,
  )
  businessVendorFieldInformationTypes: BusinessVendorField[];

  @OneToMany(
    type => BusinessVendorField,
    businessVendorField => businessVendorField.fieldType,
  )
  businessVendorFieldTypes: BusinessVendorField[];
}
