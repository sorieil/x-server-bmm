import { BusinessCode } from '../entity/mysql/entities/MysqlBusinessCode';
import { BusinessVendorFavorite } from '../entity/mysql/entities/MysqlBusinessVendorFavorite';
import { BaseService } from './BaseService';
import { BusinessVendor } from '../entity/mysql/entities/MysqlBusinessVendor';
import { Business } from '../entity/mysql/entities/MysqlBusiness';
import { In, Like } from 'typeorm';
import SearchVendor from '../entity/mysql/entities/MysqlSearchVendor';
export default class ServiceUserVendor extends BaseService {
  constructor() {
    super();
  }

  public async _getByBusiness(
    business: Business,
    keyword?: string,
    filter?: string,
  ) {
    const queryBuilder = this.mysqlConnection
      .getRepository(SearchVendor)
      .createQueryBuilder('search')
      .leftJoinAndSelect('search.businessVendor', 'vendor')
      .leftJoinAndSelect('vendor.businessVendorFieldValues', 'value')
      .leftJoinAndSelect('value.idx', 'idx')
      .leftJoinAndSelect('value.businessVendorField', 'field')
      .leftJoinAndSelect('field.fieldType', 'fieldType')
      .leftJoinAndSelect('field.informationType', 'type')
      .leftJoinAndSelect('vendor.businessVendorFavorities', 'favorite')
      .leftJoinAndSelect('favorite.user', 'user')
      .leftJoinAndSelect('vendor.business', 'business')
      .where('business.id = :id', { id: business.id });

    if (filter) {
      queryBuilder.andWhere('search.filter like :filter', {
        filter: `%${filter}%`,
      });
    }

    if (keyword) {
      queryBuilder.andWhere('search.keyword like :keyword', {
        keyword: `%${keyword}%`,
      });
    }
    const query = queryBuilder.getMany();
    console.log('before query: \n', await query);
    return query;
  }

  public get(businessVendor: BusinessVendor) {
    const query = this.mysqlManager(BusinessVendor).findOne({
      where: {
        id: businessVendor.id,
      },
      relations: [
        'businessVendorFieldValues',
        'businessVendorFieldValues.businessVendorField',
        'businessVendorFieldValues.businessVendorField.informationType',
        'businessVendorFieldValues.businessVendorField.fieldType',
        'businessVendorFieldValues.idx',
      ],
    });
    return query;
  }

  public verityVendorCode(businessVendor: BusinessVendor) {
    console.log('verify vendor code:', businessVendor);
    const query = this.mysqlConnection
      .getRepository(BusinessVendor)
      .createQueryBuilder('vendor')
      .leftJoinAndSelect('vendor.businessCode', 'code')
      .leftJoinAndSelect('vendor.businessVendorFieldValues', 'value')
      .leftJoinAndSelect('value.businessVendorField', 'field')
      .leftJoinAndSelect('field.informationType', 'informationType')
      .leftJoinAndSelect('field.fieldType', 'fieldType')
      .where('vendor.id = :vendorId', { vendorId: businessVendor.id })
      .andWhere('code.code = :vendorCode', {
        vendorCode: businessVendor.businessCode.code,
      })
      .andWhere('code.use = "yes"')
      .getOne();
    return query;
  }
}
