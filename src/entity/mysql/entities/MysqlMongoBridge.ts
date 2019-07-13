import { AdminLogin } from './MysqlAdminLogin';
import { Base } from './MysqlBase';
import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { Login } from './MysqlLogin';

@Entity()
export class MongoBridge extends Base {
    @Column('varchar', { nullable: false })
    mongodbID: string;

    @OneToOne(type => AdminLogin, adminLogin => adminLogin.mongoBridge)
    @JoinColumn()
    adminLogin: AdminLogin;
}
