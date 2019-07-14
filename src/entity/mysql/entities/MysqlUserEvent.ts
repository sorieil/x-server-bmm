import { Base, StatusTypeRole } from './MysqlBase';
import 'reflect-metadata';
import { Entity, Column, ManyToOne, UpdateDateColumn, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './MysqlUser';

@Entity()
export class UserEvent extends Base {
    @Column('varchar')
    eventId: string;
    @Column('varchar')
    name: string;
    @Column('timestamp', {
        nullable: true,
    })
    accessDt: Date;
    @Column('varchar')
    pushToken: string;

    @Column('varchar')
    mobileType: string;

    @Column({ type: 'enum', enum: ['no', 'yes'], default: 'no' })
    isPushOn: StatusTypeRole;
    @Column('smallint', { default: 0 })
    point: number;
    @ManyToOne(type => User, user => user.events, { onDelete: 'CASCADE' })
    user: User;
}
