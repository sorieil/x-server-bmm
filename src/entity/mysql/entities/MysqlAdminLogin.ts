import { UserEvent } from './MysqlUserEvent';
import { MongoBridge } from './MysqlMongoBridge';
import { Base, StatusTypeRole } from './MysqlBase';
import { Entity, Column, OneToMany, OneToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Admin } from './MysqlAdmin';
@Entity()
export class AdminLogin extends Base {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('varchar', { nullable: false })
    email: string;

    @Column({ type: 'enum', enum: [false, true], default: false })
    emailVerified: StatusTypeRole;

    @Column('varchar', { nullable: true })
    locale: string;

    @Column('varchar', { nullable: false })
    password: string;

    @OneToMany(type => Admin, admin => admin.adminLogin)
    admin: Admin[];

    @OneToOne(type => MongoBridge, mongoBridge => mongoBridge.adminLogin, {
        cascade: true,
    })
    mongoBridge: MongoBridge;
}
