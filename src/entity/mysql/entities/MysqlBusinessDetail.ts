import { Business } from './MysqlBusiness';
import { Base } from './MysqlBase';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity()
export class BusinessDetail extends Base {
  @Column('varchar', { nullable: true })
  title: string;

  @Column('varchar', { nullable: true })
  subTitle: string;

  @Column('boolean', { default: false })
  status: boolean;

  @Column('tinyint')
  sort: number;

  @ManyToOne(type => Business, business => business.details, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  business: Business;
}
