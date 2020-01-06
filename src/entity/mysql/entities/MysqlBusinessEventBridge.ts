import { Base } from './MysqlBase';
import { Business } from './MysqlBusiness';
import {
  Entity,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';

@Entity()
export class BusinessEventBridge extends Base {
  @Column('varchar')
  eventId: string;
  @OneToOne(type => Business, business => business.businessEventBridge, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  business: Business;
}
