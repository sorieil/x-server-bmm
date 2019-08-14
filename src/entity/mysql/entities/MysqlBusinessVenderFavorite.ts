import { BusinessVender } from './MysqlBusinessVender';
import { Base } from './MysqlBase';
import { Entity, Column, OneToMany, JoinColumn, OneToOne, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { Code } from './MysqlCode';
import { User } from './MysqlUser';
import { Business } from './MysqlBusiness';

@Entity()
export class BusinessVenderFavorite extends Base {
    @ManyToMany(type => BusinessVender, businessVender => businessVender.businessVenderFavorities, {
        onDelete: 'CASCADE',
    })
    @JoinTable()
    businessVenders: BusinessVender[];

    @ManyToOne(type => User, user => user.businessFavorites, { onDelete: 'CASCADE' })
    user: User;

    @ManyToMany(type => Business, business => business.businessVenderFavorities, { onDelete: 'CASCADE' })
    @JoinTable()
    businesses: Business[];
}
