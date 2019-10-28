import { BusinessVendorFavorite } from './MysqlBusinessVendorFavorite';
import { UserEvent } from './MysqlUserEvent';
import { Base, StatusTypeRole, UserTypeRole } from './MysqlBase';
import {
  Entity,
  Column,
  OneToMany,
  ManyToOne,
  OneToOne,
  JoinTable,
} from 'typeorm';
import { UserPermission } from './MysqlUserPermission';
import { Login } from './MysqlLogin';
import UserBuyer from './MysqlUserBuyer';
import { BusinessVendorManager } from './MysqlBusinessVendorManager';
/**
 * 로그인 정보가 아님 오해 하지 마세요~ 로그인 정보는 따로 있고, 이 부분은 하나의 로그인이 여러개의 유저 타입을 소유 할 수 있기 때문에
 * 구조를 나눠 놓은 것입니다.
 */
@Entity()
export class User extends Base {
  @Column('varchar', { nullable: true })
  name: string;

  @Column('varchar', { nullable: true })
  locale: string;

  @Column('varchar', { nullable: true })
  profileImg: string;

  @Column({ type: 'enum', enum: ['no', 'yes'], default: 'no' })
  isInactive: StatusTypeRole;

  @Column({ type: 'enum', enum: ['no', 'yes'], default: 'no' })
  isWithdrawal: StatusTypeRole;

  // 유저가 보유한 이벤트에 관한 내용. - 구현은 되어 있으나 사용은 안함
  @OneToMany(type => UserEvent, userEvent => userEvent.user, {
    cascade: true,
  })
  events: UserEvent[];

  // 유저가 가지고 있는 권한 - 구현은 되어 있으나 사용은 안함
  @OneToMany(type => UserPermission, userPermission => userPermission.user, {
    cascade: true,
  })
  permissions: UserPermission[];

  // 로그인 정보는 유니크 하고, 하나의 로그인이 여러개의 유저를 보유 할 수 있다.
  @ManyToOne(type => Login, login => login.users, { onDelete: 'CASCADE' })
  login: Login;

  // 유저가 보유한 즐겨 찾기 밴더
  @OneToMany(
    type => BusinessVendorFavorite,
    businessFavorite => businessFavorite.user,
  )
  businessFavorites: BusinessVendorFavorite[];

  // 유저가 바이어로 등록되어 있다면, 바이어로 연결
  @OneToOne(type => UserBuyer, userBuyer => userBuyer.user, { nullable: true })
  userBuyer: UserBuyer;

  // 밴더 아이디가 있으면, 매니저 없으면(null) 바이어
  @OneToOne(
    type => BusinessVendorManager,
    businessVendorManager => businessVendorManager.user,
    {
      nullable: true,
    },
  )
  businessVendorManager: BusinessVendorManager;

  @Column({ type: 'enum', enum: ['buyer', 'manager', null], default: null })
  type: UserTypeRole;
}
