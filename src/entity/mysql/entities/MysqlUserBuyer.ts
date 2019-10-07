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
