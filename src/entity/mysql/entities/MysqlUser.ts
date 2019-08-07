import { BusinessVenderFavorite } from './MysqlBusinessVenderFavorite';
import { UserEvent } from './MysqlUserEvent';
import { Base, StatusTypeRole } from './MysqlBase';
import { Entity, Column, OneToMany, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { UserPermission } from './MysqlUserPermission';
import { Login } from './MysqlLogin';
import { BusinessMeetingTimeList } from './MysqlBusinessMeetingTimeList';
@Entity()
export class User extends Base {
    @Column('varchar', { nullable: true })
    name: string;

    @Column('varchar', { nullable: true })
    locale: string;

    @Column('varchar', { nullable: true })
    profileImg: string;

    @Column({ type: 'enum', enum: ['no', 'yes'], default: 'no' })
    isInactive: StatusTypeRole;

    @Column({ type: 'enum', enum: ['no', 'yes'], default: 'no' })
    isWithdrawal: StatusTypeRole;

    @OneToMany(type => UserEvent, userEvent => userEvent.user, {
        cascade: true,
    })
    events: UserEvent[];

    @OneToMany(type => UserPermission, userPermission => userPermission.user, {
        cascade: true,
    })
    permissions: UserPermission[];

    @ManyToOne(type => Login, login => login.users, { onDelete: 'CASCADE' })
    login: Login;

    @OneToMany(type => BusinessMeetingTimeList, businessMeetingTimeList => businessMeetingTimeList.user)
    businessMeetingTimeLists: BusinessMeetingTimeList[];

    @OneToMany(type => BusinessVenderFavorite, businessFavorite => businessFavorite.user)
    businessFavorites: BusinessVenderFavorite[];
}
