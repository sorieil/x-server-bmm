import { BusinessVender } from './MysqlBusinessVender';
import { Business } from './MysqlBusiness';
import { AdminLogin } from './MysqlAdminLogin';
import { Base, StatusTypeRole } from './MysqlBase';
import { Entity, Column, OneToOne, JoinColumn, Unique } from 'typeorm';
import { Login } from './MysqlLogin';

@Entity()
// @Unique(['business'])
export class BusinessCode extends Base {
    @Column('varchar', { nullable: false })
    code: string;

    @Column({ type: 'enum', enum: ['no', 'yes'], default: 'no' })
    use: StatusTypeRole;

    @OneToOne(type => BusinessVender, businessVender => businessVender.businessCode, { onDelete: 'CASCADE' })
    @JoinColumn()
    businessVender: BusinessVender;
}
