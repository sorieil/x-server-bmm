import { BusinessVender } from './MysqlBusinessVender';
import { Base, StatusTypeRole } from './MysqlBase';
import { Entity, Column, OneToOne, JoinColumn, Unique, OneToMany } from 'typeorm';
import { User } from './MysqlUser';

@Entity()
// @Unique(['business'])
export class BusinessCode extends Base {
    @Column('varchar', { nullable: false })
    code: string;

    @Column({ type: 'enum', enum: ['no', 'yes'], default: 'no' })
    use: StatusTypeRole;

    @OneToOne(type => BusinessVender, businessVender => businessVender.businessCode)
    businessVender: BusinessVender;
}
