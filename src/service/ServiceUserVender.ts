import { BusinessVenderFavorite } from './../entity/mysql/entities/MysqlBusinessVenderFavorite';
import { BaseService } from './BaseService';
import { BusinessVender } from '../entity/mysql/entities/MysqlBusinessVender';
import { Business } from '../entity/mysql/entities/MysqlBusiness';
import { In, Like } from 'typeorm';
import SearchVender from '../entity/mysql/entities/MysqlSearchVender';
export default class ServiceUserVender extends BaseService {
    constructor() {
        super();
    }

    public async _getByBusiness(business: Business, keyword?: string, filter?: string) {
        const queryBuilder = this.mysqlConnection
            .getRepository(SearchVender)
            .createQueryBuilder('search')
            .leftJoinAndSelect('search.businessVender', 'vender')
            .leftJoinAndSelect('vender.businessVenderFieldValues', 'value')
            .leftJoinAndSelect('value.idx', 'idx')
            .leftJoinAndSelect('value.businessVenderField', 'field')
            .leftJoinAndSelect('field.fieldType', 'fieldType')
            .leftJoinAndSelect('field.informationType', 'type')
            .leftJoinAndSelect('vender.businessVenderFavorities', 'favorite')
            .leftJoinAndSelect('favorite.user', 'user')
            .leftJoinAndSelect('vender.business', 'business')
            .where('business.id = :id', { id: business.id });

        if (filter) {
            queryBuilder.andWhere('search.filter = ":filter"', { filter });
        }

        if (keyword) {
            queryBuilder.andWhere('search.keyword like "%:keyword%"', { keyword });
        }
        const query = queryBuilder.getMany();
        console.log('before query: \n', await query);
        return query;
    }
}
