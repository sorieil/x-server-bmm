import { Base } from './MysqlBase';
import { Entity, Column, ManyToOne } from 'typeorm';
import { BusinessVendorFieldValue } from './MysqlBusinessVendorFieldValue';
import { BusinessVendor } from './MysqlBusinessVendor';
import { BusinessVendorField } from './MysqlBusinessVendorField';
import { Code } from './MysqlCode';

/**
 * 관리자 페이지에서 추가한 담당자와 매칭을 하기 위해서는 담당자의 이름을 앱에서 입력을 한다면,
 * 담당자를 검색 해오고, 그 담당자의 정보와 유저와 매칭을 해야 하기 때문에 BusinessFieldValue
 * 값을 가져다가 여기에다가 매칭을 넣어준다.
 */
@Entity()
export default class UserManager extends Base {
  // @ManyToOne(type => User, user => user.userManagers, { onDelete: 'CASCADE' })
  // user: User;
  // businessVendorFieldManagerValueGroup 에서 기능을 대신 할 예정이라서 우선 주석 처리

  @ManyToOne(
    type => BusinessVendorFieldValue,
    businessVendorFieldValue => businessVendorFieldValue.userManagers,
  )
  businessVendorFieldValue: BusinessVendorFieldValue;

  // 여기에서.... 밴더 별로 맴버를 가져와야 하기 때문에...
  @ManyToOne(type => BusinessVendor)
  businessVendor: BusinessVendor;

  /**
   * 필드의 타입을 조인으로 가져오고 있는데 이 방법이 부적절하다면, 이 필드를 활용할 수도 있다.
   * 하지만 데이터 마이그레이션 작업이 필요 하다.
   * @type {Code}
   * @memberof businessVendorFieldValue
   */
  @ManyToOne(type => Code, code => code.businessVendorFieldValues)
  code: Code;

  @ManyToOne(
    type => BusinessVendorField,
    businessVendorField => businessVendorField.businessVendorFieldValues,
    {
      nullable: false,
    },
  )
  businessVendorField: BusinessVendorField;

  @Column('varchar', { nullable: true })
  text: string;

  @Column('text', { nullable: true })
  textarea: string;
}
