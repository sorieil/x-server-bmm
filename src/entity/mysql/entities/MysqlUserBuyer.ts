import { UserBuyerMeetingTimeList } from './MysqlUserBuyerMeetingTimeList';
import { Base } from './MysqlBase';
import {
  Entity,
  Column,
  ManyToMany,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from './MysqlUser';

@Entity()
export default class UserBuyer extends Base {
  @Column('varchar')
  name: string;

  @Column('varchar')
  phone: string;

  @Column('varchar')
  email: string;

  @Column('varchar')
  profileImage: string;

  @OneToOne(type => User, user => user.userBuyer, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @OneToMany(
    type => UserBuyerMeetingTimeList,
    userBuyerMeetingTimeList => userBuyerMeetingTimeList.userBuyer,
  )
  userBuyerMeetingTimeLists: UserBuyerMeetingTimeList[];
}

// TODO 현재 미팅 리스트 가져오는걸 하고 있었다. 바이어의 정보와 미팅정보를 가져오는 방법을
// 고민중이였다.
