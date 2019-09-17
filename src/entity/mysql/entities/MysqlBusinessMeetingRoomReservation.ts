import { BusinessMeetingRoom } from './MysqlBusinessMeetingRoom';
import { BusinessMeetingTimeList } from './MysqlBusinessMeetingTimeList';

import { Base } from './MysqlBase';
import { Entity, Column, ManyToOne, JoinTable, JoinColumn, RelationId, OneToMany, OneToOne, ManyToMany } from 'typeorm';
import UserBuyer from './MysqlUserBuyer';
import { UserBuyerMeetingTimeList } from './MysqlUserBuyerMeetingTimeList';

@Entity()
export class BusinessMeetingRoomReservation extends Base {
    @ManyToMany(
        type => BusinessMeetingTimeList,
        businessMeetingTimeList => businessMeetingTimeList.businessMeetingRoomReservations,
    )
    businessMeetingTimeLists: BusinessMeetingTimeList[];

    @ManyToOne(type => BusinessMeetingRoom, businessMeetingRoom => businessMeetingRoom.businessMeetingRoomReservations)
    businessMeetingRoom: BusinessMeetingRoom;

    @OneToOne(
        type => UserBuyerMeetingTimeList,
        userBuyerMeetingTimeList => userBuyerMeetingTimeList.businessMeetingRoomReservation,
        {
            onDelete: 'CASCADE',
        },
    )
    @JoinColumn()
    userBuyerMeetingTimeList: UserBuyerMeetingTimeList;
}
