import { BusinessCode } from './MysqlBusinessCode';
import { BusinessMeetingTime } from './MysqlBusinessMeetingTime';
import { BusinessMeetingRoom } from './MysqlBusinessMeetingRoom';
import { BusinessDetail } from './MysqlBusinessDetail';
import { BusinessVender } from './MysqlBusinessVender';
import { Base, StatusTypeRole } from './MysqlBase';
import { Entity, Column, OneToMany, JoinColumn, OneToOne, ManyToOne } from 'typeorm';
import { Admin } from './MysqlAdmin';
import { BusinessVenderInformationField } from './MysqlBusinessVenderInformationField';

@Entity()
export class Business extends Base {
    @Column('varchar', { nullable: false })
    title: string;

    @Column('varchar', { nullable: false })
    subTitle: string;

    @Column({ type: 'enum', enum: ['yes', 'no'] })
    status: StatusTypeRole;

    @OneToMany(type => BusinessDetail, businessDetail => businessDetail.business, {
        cascade: true,
    })
    details: BusinessDetail[];
    @OneToMany(type => BusinessVender, businessVender => businessVender.business, {
        cascade: true,
    })
    businessVenders: BusinessVender[];
    @OneToMany(type => BusinessMeetingRoom, businessMeetingRoom => businessMeetingRoom.business, {
        cascade: true,
    })
    businessMeetingRooms: BusinessMeetingRoom[];

    @ManyToOne(type => Admin, admin => admin.businesses, { onDelete: 'CASCADE' })
    admin: Admin;

    @OneToOne(type => BusinessMeetingTime, businessMeetingTime => businessMeetingTime.business)
    businessMeetingTime: BusinessMeetingTime;

    @OneToMany(
        type => BusinessVenderInformationField,
        businessVenderInformationField => businessVenderInformationField.business,
    )
    businessVenderInformationFields: BusinessVenderInformationField[];
}
