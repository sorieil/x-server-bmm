import { MongoBridge } from './MysqlMongoBridge';
import { Base, StatusTypeRole } from './MysqlBase';
import { Entity, Column, OneToMany, OneToOne } from 'typeorm';
import { User } from './MysqlUser';
@Entity()
export class Login extends Base {
  @Column('varchar', { nullable: true })
  email: string;

  @Column({ type: 'enum', enum: ['no', 'yes'], default: 'no' })
  emailVerified: StatusTypeRole;

  @Column('varchar', { nullable: true })
  phone: string;

  @Column('varchar', { nullable: true })
  qrCode: string;

  @Column('varchar', { nullable: true })
  locale: string;

  @Column('varchar', { nullable: true })
  password: string;

  @OneToMany(type => User, user => user.login)
  users: User[];

  @OneToOne(type => MongoBridge, mongoBridge => mongoBridge.login)
  mongoBridge: MongoBridge;
}
