import { Base } from './MysqlBase';
import { User } from './MysqlUser';
import { Entity, Column, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UserPermission extends Base {
    @PrimaryGeneratedColumn()
    id: number;
    @Column('varchar')
    permissionName: string;

    @Column('boolean')
    isChecked: boolean;
    @Column('int', { default: 0 })
    point: number;
    @ManyToOne(type => User, user => user.permission)
    user: User;
}
