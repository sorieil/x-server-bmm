import { BusinessVenderFavorite } from './MysqlBusinessVenderFavorite';
import { Business } from './MysqlBusiness';
import { Base } from './MysqlBase';
import { Entity, ManyToOne, OneToOne, JoinColumn, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { BusinessCode } from './MysqlBusinessCode';
import { BusinessVenderFieldValue } from './MysqlBusinessVenderFieldValue';

@Entity()
export class BusinessVender extends Base {
    @ManyToOne(type => Business, business => business.businessVenders, { onDelete: 'CASCADE' })
    business: Business;

    @OneToOne(type => BusinessCode, businessCode => businessCode.businessVender, { onDelete: 'CASCADE' })
    @JoinColumn()
    businessCode: BusinessCode;

    @OneToMany(type => BusinessVenderFieldValue, businessVenderFieldValue => businessVenderFieldValue.businessVender)
    businessVenderFieldValues: BusinessVenderFieldValue[];

    @ManyToMany(type => BusinessVenderFavorite, businessVenderFavorite => businessVenderFavorite.businessVenders)
    businessVenderFavorities: BusinessVenderFavorite[];
}
