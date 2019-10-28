import { BusinessVendorFieldManagerValue } from './MysqlBusinessVendorFieldManagerValue';
import { Base } from './MysqlBase';
import 'reflect-metadata';
import { Entity, OneToMany, OneToOne, JoinTable, ManyToOne } from 'typeorm';
import { User } from './MysqlUser';
import { BusinessVendor } from './MysqlBusinessVendor';

/**
 * 벤더의 커스텀 필드에서 매니저를 등록하면, 밴더의 경우 한번에 하나씩만 입력이 가능하고
 */
@Entity()
export class BusinessVendorManager extends Base {
  @OneToMany(
    type => BusinessVendorFieldManagerValue,
    BusinessVendorFieldManagerValue =>
      BusinessVendorFieldManagerValue.businessVendorManager,
  )
  businessVendorFieldManagerValues: BusinessVendorFieldManagerValue[];

  @ManyToOne(
    type => BusinessVendor,
    businessVendor => businessVendor.businessVendorManagers,
  )
  businessVendor: BusinessVendor;
  // 나중에 매너저로 된다면, 여기에 유저의 아이디가 들어 가야 한다. 그래서 매칭을 시켜준다.
  // 유저의 아이디가 들어 간다면, 매니저 매칭 완료
  @OneToOne(type => User, user => user.businessVendorManager)
  user: User;
}
