import { Base } from './MysqlBase';
import { Entity, Column, OneToMany, ManyToMany, OneToOne, JoinColumn } from 'typeorm';
import { Business } from './MysqlBusiness';

// d이벤트 브릿지
@Entity()
export class BusinessEventBridge extends Base {
    @Column('varchar')
    eventId: string;
    @OneToOne(type => Business, business => business.businessEventBridge, { onDelete: 'CASCADE' })
    @JoinColumn()
    business: Business;
}
