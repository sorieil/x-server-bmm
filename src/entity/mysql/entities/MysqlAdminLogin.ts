import { UserEvent } from './MysqlUserEvent';
import { MongoBridge } from './MysqlMongoBridge';
import { Base, StatusTypeRole } from './MysqlBase';
import {
  Entity,
  Column,
  OneToMany,
  OneToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Admin } from './MysqlAdmin';
@Entity()
export class AdminLogin extends Base {
  @Column('varchar', { nullable: false })
  email: string;

  @Column({ type: 'enum', enum: ['no', 'yes'], default: 'no' })
  emailVerified: StatusTypeRole;

  @Column('varchar', { nullable: true })
  locale: string;

  @Column('varchar', { nullable: false })
  password: string;

  @OneToMany(type => Admin, admin => admin.adminLogin)
  admins: Admin[];

  @OneToOne(type => MongoBridge, mongoBridge => mongoBridge.adminLogin)
  mongoBridge: MongoBridge;
}
