import { BusinessMeetingRoom } from './MysqlBusinessMeetingRoom';
import { BusinessDetail } from './MysqlBusinessDetail';
import { BusinessVender } from './MysqlBusinessVender';
import { Base } from './MysqlBase';
import { Entity, Column, OneToMany, JoinColumn, OneToOne, ManyToOne } from 'typeorm';
import { Admin } from './MysqlAdmin';

@Entity()
export class Business extends Base {
    @Column('varchar', { nullable: false })
    title: string;

    @Column('varchar', { nullable: false })
    subTitle: string;

    @Column('boolean', { default: false })
    status: boolean;

    @OneToMany(type => BusinessDetail, businessDetail => businessDetail.business, {
        cascade: true,
    })
    @JoinColumn()
    detail: BusinessDetail[];
    @OneToMany(type => BusinessVender, businessVender => businessVender.business, {
        cascade: true,
    })
    @JoinColumn()
    businessVender: BusinessVender[];
    @OneToMany(type => BusinessMeetingRoom, businessMeetingRoom => businessMeetingRoom.business, {
        cascade: true,
    })
    @JoinColumn()
    businessMeetingRoom: BusinessMeetingRoom[];

    @ManyToOne(type => Admin, admin => admin.business)
    admin: Admin;
}
