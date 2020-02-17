import { UserTypeList } from './../../../src/entity/mysql/entities/MysqlUserStatus';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('varchar', { length: 100 })
    firstName: string;

    @Column('varchar', { length: 100 })
    lastName: string;

    @Column()
    age: number;

    @OneToMany(type => UserTypeList, userTypeList => userTypeList.user)
    userTypeLists: UserTypeList[];
}
