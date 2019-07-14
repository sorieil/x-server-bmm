import { AdminLogin } from './MysqlAdminLogin';
import { Base } from './MysqlBase';
import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { Login } from './MysqlLogin';

@Entity()
export class MongoBridge extends Base {
    @Column('varchar', { nullable: false })
    mongodbID: string;

    @OneToOne(type => AdminLogin, adminLogin => adminLogin.mongoBridge, { onDelete: 'CASCADE' })
    @JoinColumn()
    adminLogin: AdminLogin;

    @OneToOne(type => Login, login => login.mongoBridge, { onDelete: 'CASCADE' })
    @JoinColumn()
    login: Login;
}
