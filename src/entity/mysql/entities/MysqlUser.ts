import { UserEvent } from './MysqlUserEvent';
import { Base, StatusTypeRole } from './MysqlBase';
import { Entity, Column, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { UserPermission } from './MysqlUserPermission';
import { Login } from './MysqlLogin';
@Entity()
export class User extends Base {
    @Column('varchar', { nullable: true })
    name: string;

    @Column('varchar', { nullable: true })
    locale: string;

    @Column('varchar', { nullable: true })
    profileImg: string;

    @Column({ type: 'enum', enum: [false, true], default: false })
    isInactive: StatusTypeRole;

    @Column({ type: 'enum', enum: [false, true], default: false })
    isWithdrawal: StatusTypeRole;

    @OneToMany(type => UserEvent, userEvent => userEvent.user, {
        cascade: true,
    })
    @JoinColumn()
    event: UserEvent[];

    @OneToMany(type => UserPermission, userPermission => userPermission.user, {
        cascade: true,
    })
    @JoinColumn()
    permission: UserPermission[];

    @OneToOne(type => Login, login => login.user)
    login: Login;
}
