import { BusinessVendorFieldChildNode } from './MysqlBusinessVendorFieldChildNode';
import { BusinessVendorField } from './MysqlBusinessVendorField';
import { Base } from './MysqlBase';
import 'reflect-metadata';
import {
  Entity,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
  OneToMany,
  ManyToMany,
} from 'typeorm';
import { BusinessVendor } from './MysqlBusinessVendor';
import { Code } from './MysqlCode';

@Entity()
export class BusinessVendorFieldValue extends Base {
  @ManyToOne(
    type => BusinessVendor,
    businessVendor => businessVendor.businessVendorFieldValues,
    {
      onDelete: 'CASCADE',
      nullable: false,
    },
  )
  businessVendor: BusinessVendor;

  /**
   * 필드의 타입을 조인으로 가져오고 있는데 이 방법이 부적절하다면, 이 필드를 활용할 수도 있다.
   * 하지만 데이터 마이그레이션 작업이 필요 하다.
   * @type {Code}
   * @memberof BusinessVendorFieldValue
   */
  @ManyToOne(type => Code, code => code.businessVendorFieldValues)
  code: Code;

  @ManyToOne(
    type => BusinessVendorField,
    businessVendorField => businessVendorField.businessVendorFieldValues,
    {
      nullable: false,
      onDelete: 'CASCADE',
    },
  )
  businessVendorField: BusinessVendorField;

  @Column('varchar', { nullable: true })
  text: string;

  @Column('text', { nullable: true })
  textarea: string;

  @ManyToOne(
    type => BusinessVendorFieldChildNode,
    businessVendorFieldChildNode =>
      businessVendorFieldChildNode.businessVendorFieldValues,
    { nullable: true, onDelete: 'CASCADE' },
  )
  idx: BusinessVendorFieldChildNode;
}
