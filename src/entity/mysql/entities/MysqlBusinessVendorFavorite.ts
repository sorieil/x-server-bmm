import { BusinessVendor } from './MysqlBusinessVendor';
import { Base } from './MysqlBase';
import { Entity, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { User } from './MysqlUser';
import { Business } from './MysqlBusiness';

@Entity()
export class BusinessVendorFavorite extends Base {
  @ManyToMany(
    type => BusinessVendor,
    businessVendor => businessVendor.businessVendorFavorities,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinTable()
  businessVendors: BusinessVendor[];

  @ManyToOne(type => User, user => user.businessFavorites, {
    onDelete: 'CASCADE',
  })
  user: User;

  @ManyToMany(type => Business, business => business.businessVendorFavorities, {
    onDelete: 'CASCADE',
  })
  @JoinTable()
  businesses: Business[];
}
