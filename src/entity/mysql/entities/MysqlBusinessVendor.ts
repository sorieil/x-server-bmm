import { BusinessVenderManager } from './MysqlBusinessVendorManager';
import { BusinessVendorFavorite } from './MysqlBusinessVendorFavorite';
import { Business } from './MysqlBusiness';
import { Base } from './MysqlBase';
import {
  Entity,
  ManyToOne,
  OneToOne,
  JoinColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { BusinessCode } from './MysqlBusinessCode';
import { BusinessVendorFieldValue } from './MysqlBusinessVendorFieldValue';
import SearchVendor from './MysqlSearchVendor';

@Entity()
export class BusinessVendor extends Base {
  @ManyToOne(type => Business, business => business.businessVendors, {
    onDelete: 'CASCADE',
  })
  business: Business;

  @OneToOne(type => BusinessCode, businessCode => businessCode.businessVendor, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  businessCode: BusinessCode;

  @OneToMany(
    type => BusinessVendorFieldValue,
    businessVendorFieldValue => businessVendorFieldValue.businessVendor,
  )
  businessVendorFieldValues: BusinessVendorFieldValue[];

  @ManyToMany(
    type => BusinessVendorFavorite,
    businessVendorFavorite => businessVendorFavorite.businessVendors,
  )
  businessVendorFavorities: BusinessVendorFavorite[];

  @OneToOne(type => SearchVendor, searchVendor => searchVendor.businessVendor)
  searchVendor: SearchVendor;

  @OneToOne(
    type => BusinessVenderManager,
    businessVendorFieldManagerValueGroup =>
      businessVendorFieldManagerValueGroup.businessVendor,
  )
  businessVenderManager: BusinessVenderManager;
}
