import { Base } from './MysqlBase';
import { Entity, Column, OneToMany, ManyToOne } from 'typeorm';
import { BusinessVendorField } from './MysqlBusinessVendorField';
import { BusinessVendorFieldValue } from './MysqlBusinessVendorFieldValue';
import { BusinessVendorFieldManagerValue } from './MysqlBusinessVendorFieldManagerValue';

@Entity()
export class BusinessVendorFieldChildNode extends Base {
  @Column('varchar')
  text: string;

  @Column('tinyint', { default: 0 })
  sort: number;

  @ManyToOne(
    type => BusinessVendorField,
    businessVendorField => businessVendorField.businessVendorFieldChildNodes,
    {
      onDelete: 'CASCADE',
      nullable: false,
    },
  )
  businessVendorField: BusinessVendorField;

  /**
   * field의 타입이 셀렉트 박스 일경우 여러 자식 데이터를 가질 수 있는데 그 데이터를 기준으로 벤더의 카테고리를 결정하기 때문에
   * 이 테이블과 연결이 필요하다.
   * @type {businessVendorFieldValue[]}
   * @memberof businessVendorFieldValues
   */
  @OneToMany(
    type => BusinessVendorFieldValue,
    businessVendorFieldValue => businessVendorFieldValue.idx,
  )
  businessVendorFieldValues: BusinessVendorFieldValue[];

  @OneToMany(
    type => BusinessVendorFieldManagerValue,
    businessVendorFieldManagerValue => businessVendorFieldManagerValue.idx,
  )
  businessVendorFieldManagerValues: BusinessVendorFieldManagerValue[];
}
