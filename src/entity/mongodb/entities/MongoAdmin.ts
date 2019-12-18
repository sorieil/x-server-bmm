import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { EventList } from './MongoAccounts';

export class ContainerList {
    @Column('string')
    packageName: string;

    @Column('string')
    level: string;

    @Column('date')
    joinDt: Date;
}
@Entity()
export class Admins {
    @ObjectIdColumn()
    _id: Record<string, any>;
    @Column('string')
    id: string;
    @Column('string')
    password: string;
    @Column('string')
    name: string;

    @Column('string')
    phone: string;

    @Column('date')
    createDt: Date;

    @Column('boolean')
    verified: boolean;

    @Column(type => ContainerList)
    containerList: ContainerList[];
    @Column(type => EventList)
    event: EventList[];
}
