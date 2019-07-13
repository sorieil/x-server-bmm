import { AdminLogin } from './MysqlAdminLogin';
import { Base } from './MysqlBase';
import { Entity, Column, OneToOne, JoinColumn, OneToMany, ManyToOne } from 'typeorm';
import { Business } from './MysqlBusiness';

@Entity()
export class Admin extends Base {
    @Column('varchar')
    name: string;

    @Column('varchar', { default: '0' })
    phone: string;

    @ManyToOne(type => AdminLogin, adminLogin => adminLogin.admin)
    adminLogin: AdminLogin;

    @OneToMany(type => Business, business => business.admin, { cascade: true })
    @JoinColumn()
    business: Business[];
}
