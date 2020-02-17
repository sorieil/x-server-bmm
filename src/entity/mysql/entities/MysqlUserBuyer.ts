import { UserBuyerMeetingTimeList } from './MysqlUserBuyerMeetingTimeList';
import { Base } from './MysqlBase';
import { Entity, Column, OneToMany, ManyToOne } from 'typeorm';
import { User } from './MysqlUser';

@Entity()
export default class UserBuyer extends Base {
    @Column('varchar')
    name: string;

    @Column('varchar')
    phone: string;

    @Column('varchar')
    email: string;

    @Column('varchar', { nullable: true, default: null })
    profileImage: string;

    @ManyToOne(type => User, user => user.userBuyers, { onDelete: 'CASCADE' })
    user: User;

    @OneToMany(
        type => UserBuyerMeetingTimeList,
        userBuyerMeetingTimeList => userBuyerMeetingTimeList.userBuyer,
    )
    userBuyerMeetingTimeLists: UserBuyerMeetingTimeList[];
}

// TODO 현재 미팅 리스트 가져오는걸 하고 있었다. 바이어의 정보와 미팅정보를 가져오는 방법을
// 고민중이였다.
