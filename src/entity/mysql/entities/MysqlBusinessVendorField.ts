import { Base, StatusTypeRole } from './MysqlBase';
import { Entity, Column, OneToMany, ManyToOne } from 'typeorm';
import { Code } from './MysqlCode';
import { BusinessVendorFieldChildNode } from './MysqlBusinessVendorFieldChildNode';
import { Business } from './MysqlBusiness';
import { BusinessVendorFieldValue } from './MysqlBusinessVendorFieldValue';
import { BusinessVendorFieldManagerValue } from './MysqlBusinessVendorFieldManagerValue';

@Entity()
export class BusinessVendorField extends Base {
  @Column('varchar', { nullable: false })
  name: string;

  @Column({ type: 'enum', enum: ['no', 'yes'], default: 'no' })
  require: StatusTypeRole;

  @Column('tinyint', { default: 0 })
  sort: number;

  @OneToMany(
    type => BusinessVendorFieldChildNode,
    businessVendorFieldChildNode =>
      businessVendorFieldChildNode.businessVendorField,
  )
  businessVendorFieldChildNodes: BusinessVendorFieldChildNode[];

  @ManyToOne(type => Business, business => business.businessVendorFields, {
    onDelete: 'CASCADE',
  })
  business: Business;

  // 여긴 비즈니스 밴더 위주로 가는 것이 아니라 비즈니스 기준으로 가는 것이다.. 유의~~ 이유는 밴더마다 커스텀 걸럼이 지정되는데
  // 그 기준은 businessVendor가 가지고 있는게 아니고, Business 가 가지고 있는 것이다.  businessVendor 는 의미 그대로
  // Business의 vendor가 들어가는 곳임..
  @OneToMany(
    type => BusinessVendorFieldValue,
    businessVendorFieldValue => businessVendorFieldValue.businessVendorField,
  )
  businessVendorFieldValues: BusinessVendorFieldValue[];

  @OneToMany(
    type => BusinessVendorFieldManagerValue,
    BusinessVendorFieldManagerValue =>
      BusinessVendorFieldManagerValue.businessVendorField,
  )
  BusinessVendorFieldManagerValues: BusinessVendorFieldManagerValue[];

  @ManyToOne(type => Code, code => code.businessVendorFieldInformationTypes)
  informationType: Code;

  @ManyToOne(type => Code, code => code.businessVendorFieldInformationTypes)
  fieldType: Code;
}
