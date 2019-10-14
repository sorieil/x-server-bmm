import { BusinessVendorFavorite } from './MysqlBusinessVendorFavorite';
import { BusinessCode } from './MysqlBusinessCode';
import { BusinessMeetingTime } from './MysqlBusinessMeetingTime';
import { BusinessMeetingRoom } from './MysqlBusinessMeetingRoom';
import { BusinessDetail } from './MysqlBusinessDetail';
import { BusinessVendor } from './MysqlBusinessVendor';
import { Base, StatusTypeRole } from './MysqlBase';
import {
  Entity,
  Column,
  OneToMany,
  JoinColumn,
  OneToOne,
  ManyToOne,
  ManyToMany,
} from 'typeorm';
import { Admin } from './MysqlAdmin';
import { BusinessVendorField } from './MysqlBusinessVendorField';
import { BusinessEventBridge } from './MysqlBusinessEventBridge';

@Entity()
export class Business extends Base {
  @Column('varchar', { nullable: false })
  title: string;

  @Column('varchar', { nullable: false })
  subTitle: string;

  @Column({ type: 'enum', enum: ['yes', 'no'] })
  status: StatusTypeRole;

  @OneToMany(
    type => BusinessDetail,
    businessDetail => businessDetail.business,
    {
      cascade: true,
    },
  )
  details: BusinessDetail[];
  @OneToMany(
    type => BusinessVendor,
    businessVendor => businessVendor.business,
    {
      cascade: true,
    },
  )
  businessVendors: BusinessVendor[];
  @OneToMany(
    type => BusinessMeetingRoom,
    businessMeetingRoom => businessMeetingRoom.business,
    {
      cascade: true,
    },
  )
  businessMeetingRooms: BusinessMeetingRoom[];

  @ManyToOne(type => Admin, admin => admin.businesses, { onDelete: 'CASCADE' })
  admin: Admin;

  @OneToMany(
    type => BusinessMeetingTime,
    businessMeetingTime => businessMeetingTime.business,
  )
  businessMeetingTimes: BusinessMeetingTime[];

  @OneToMany(
    type => BusinessVendorField,
    businessVendorField => businessVendorField.business,
  )
  businessVendorFields: BusinessVendorField[];

  @OneToOne(type => BusinessEventBridge, eventBridge => eventBridge.business)
  businessEventBridge: BusinessEventBridge;

  @ManyToMany(
    type => BusinessVendorFavorite,
    businessVendorFavorite => businessVendorFavorite.businessVendors,
  )
  businessVendorFavorities: BusinessVendorFavorite[];
}
