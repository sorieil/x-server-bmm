import { UserEvent } from './MysqlUserEvent';
import { MongoBridge } from './MysqlMongoBridge';
import { Base, StatusTypeRole } from './MysqlBase';
import { Entity, Column, OneToMany, OneToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { UserPermission } from './MysqlUserPermission';
import { User } from './MysqlUser';
@Entity()
export class Login extends Base {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('varchar', { nullable: false })
    email: string;

    @Column({ type: 'enum', enum: [false, true], default: false })
    emailVerified: StatusTypeRole;

    @Column('varchar', { nullable: true })
    phone: string;

    @Column('varchar', { nullable: true })
    qrCode: string;

    @Column('varchar', { nullable: true })
    locale: string;

    @Column('varchar', { nullable: true })
    password: string;

    @OneToOne(type => User, user => user.login, {
        cascade: true,
    })
    @JoinColumn()
    user: User;
}
