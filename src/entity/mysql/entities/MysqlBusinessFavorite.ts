import { BusinessVender } from './MysqlBusinessVender';
import { Base } from './MysqlBase';
import { Entity, Column, OneToMany, JoinColumn, OneToOne, ManyToOne, ManyToMany } from 'typeorm';
import { Code } from './MysqlCode';
import { User } from './MysqlUser';

@Entity()
export class BusinessFavorite extends Base {
    @ManyToMany(type => BusinessVender, businessVender => businessVender.businessFavorite)
    @JoinColumn()
    businessVender: BusinessVender;

    @ManyToOne(type => User, user => user.businessFavorites, { onDelete: 'CASCADE' })
    user: User;
}
