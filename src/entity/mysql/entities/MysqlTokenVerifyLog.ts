import { Login } from './MysqlLogin';
import { AdminLogin } from './MysqlAdminLogin';
import { Base } from './MysqlBase';
import {
  Entity,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { Business } from './MysqlBusiness';
import { UploadFile } from './MysqlUploadFile';

@Entity()
export class TokenVerifyLog extends Base {
  @Column('varchar')
  token: string;

  @Column('varchar')
  tokenAnalyzed: string;

  @Column('boolean')
  tokenVerifyResult: boolean;

  @Column('varchar')
  tokenType: string;

  @ManyToOne(type => AdminLogin, { nullable: true })
  adminLogin: AdminLogin;

  @ManyToOne(type => Login, { nullable: true })
  login: Login;
  @Column('varchar')
  referenceUrl: string;

  @Column('varchar')
  requestUrl: string;

  @Column('text')
  body: string;
}
