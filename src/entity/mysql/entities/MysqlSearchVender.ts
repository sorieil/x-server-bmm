import { BusinessVender } from './MysqlBusinessVender';
import { Base } from './MysqlBase';
import { Column, OneToOne, JoinColumn, Entity } from 'typeorm';

@Entity()
export default class SearchVender extends Base {
  @Column('varchar', { nullable: true })
  filter: string;

  @Column('varchar', { nullable: true })
  keyword: string;

  @OneToOne(
    type => BusinessVender,
    businessVender => businessVender.searchVender,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn()
  businessVender: BusinessVender;
}
