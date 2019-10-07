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
export class Admin extends Base {
  @Column('varchar')
  name: string;

  @Column('varchar', { default: '0' })
  phone: string;

  @ManyToOne(type => AdminLogin, adminLogin => adminLogin.admins, {
    onDelete: 'CASCADE',
  })
  adminLogin: AdminLogin;

  @OneToMany(type => Business, business => business.admin)
  businesses: Business[];
  @OneToMany(type => UploadFile, uploadFile => uploadFile.admin)
  uploadFiles: UploadFile[];

  _id: any;
  /**
   * Mongodb 에서 _id는 암묵적인 아이디 인데 id를 필드로 설정 해서 사용할경우 orm에서는 암묵적으로
   * _id가 자동으로 생성이 되기 때문에 사용하면 안되지만, Mongodb 에서 가져올때 특수성 때문에 사용
   */
}
