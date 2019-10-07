import { BusinessCode } from './MysqlBusinessCode';
import { Base, StatusTypeRole } from './MysqlBase';
import {
  Entity,
  Column,
  OneToMany,
  JoinColumn,
  OneToOne,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Code } from './MysqlCode';
import { BusinessVenderFieldChildNode } from './MysqlBusinessVenderFieldChildNode';
import { Business } from './MysqlBusiness';
import { BusinessVenderFieldValue } from './MysqlBusinessVenderFieldValue';
import UserManager from './MysqlUserManager';

@Entity()
export class BusinessVenderField extends Base {
  @Column('varchar', { nullable: false })
  name: string;

  @Column({ type: 'enum', enum: ['no', 'yes'], default: 'no' })
  require: StatusTypeRole;

  @Column('tinyint', { default: 0 })
  sort: number;

  @OneToMany(
    type => BusinessVenderFieldChildNode,
    businessVenderFieldChildNode =>
      businessVenderFieldChildNode.businessVenderField,
  )
  businessVenderFieldChildNodes: BusinessVenderFieldChildNode[];

  @ManyToOne(type => Business, business => business.businessVenderFields, {
    onDelete: 'CASCADE',
  })
  business: Business;

  // 여긴 비즈니스 밴더 위주로 가는 것이 아니라 비즈니스 기준으로 가는 것이다.. 유의~~ 이유는 밴더마다 커스텀 걸럼이 지정되는데
  // 그 기준은 BusinessVender가 가지고 있는게 아니고, Business 가 가지고 있는 것이다.  BusinessVender 는 의미 그대로
  // Business의 vender가 들어가는 곳임..
  @OneToMany(
    type => BusinessVenderFieldValue,
    businessVenderFieldValue => businessVenderFieldValue.businessVenderField,
  )
  businessVenderFieldValues: BusinessVenderFieldValue[];

  // 일반적으로 BusinessVenderFieldValue 랑 같지만, 이곳은 매니저를 위한 곳이다.
  @OneToMany(
    type => UserManager,
    userManager => userManager.businessVenderField,
  )
  userManagers: UserManager[];

  @ManyToOne(type => Code, code => code.businessVenderFieldInformationTypes)
  informationType: Code;

  @ManyToOne(type => Code, code => code.businessVenderFieldInformationTypes)
  fieldType: Code;
}
