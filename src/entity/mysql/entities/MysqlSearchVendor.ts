import { BusinessVendor } from './MysqlBusinessVendor';
import { Base } from './MysqlBase';
import { Column, OneToOne, JoinColumn, Entity } from 'typeorm';

@Entity()
export default class SearchVendor extends Base {
  @Column('varchar', { nullable: true })
  filter: string;

  @Column('varchar', { nullable: true })
  keyword: string;

  @OneToOne(
    type => BusinessVendor,
    businessVendor => businessVendor.searchVendor,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn()
  businessVendor: BusinessVendor;
}
