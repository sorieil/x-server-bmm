import { BusinessVenderFavorite } from '../entity/mysql/entities/MysqlBusinessVenderFavorite';
import { BaseService } from './BaseService';
import { User } from '../entity/mysql/entities/MysqlUser';
import { Business } from '../entity/mysql/entities/MysqlBusiness';
export default class ServiceBusinessVenderFavorite extends BaseService {
  constructor() {
    super();
  }

  public async post(businessVenderFavorite: BusinessVenderFavorite) {
    const query = this.mysqlManager(BusinessVenderFavorite).save(
      businessVenderFavorite,
    );
    return query;
  }

  public async _getByWhere(businessVenderFavorite: BusinessVenderFavorite) {
    const query = this.mysqlConnection
      .getRepository(BusinessVenderFavorite)
      .createQueryBuilder('favorite')
      .innerJoin('favorite.user', 'user')
      .innerJoin('favorite.businesses', 'business')
      .innerJoin('favorite.businessVenders', 'businessVenders')
      .where('user.id = :userId', { userId: businessVenderFavorite.user.id })
      .andWhere('business.id = :businessId', {
        businessId: businessVenderFavorite.businesses[0].id,
      })
      .andWhere('businessVenders.id = :venderId', {
        venderId: businessVenderFavorite.businessVenders[0].id,
      })
      .getOne();
    return query;
  }

  // 이 부분이 문제이다.
  // business vender favorite과 business vender 의 관계가 ManyToMany 인데 joinTable 은

  public async _getByUserWithBusinessVender(user: User, business: Business) {
    const query = this.mysqlManager(BusinessVenderFavorite).find({
      where: {
        user: user,
        business: business,
      },
      relations: [
        'businessVenders',
        'businessVenders.businessVenderFieldValues',
        'businessVenders.businessVenderFieldValues.businessVenderField',
      ],
    });

    return query;
  }

  public async _deleteByWhere(businessVenderFavorite: BusinessVenderFavorite) {
    const query = this.mysqlConnection
      .getRepository(BusinessVenderFavorite)
      .createQueryBuilder('favorite')
      .innerJoin('favorite.user', 'user')
      .innerJoin('favorite.businesses', 'business')
      .innerJoin('favorite.businessVenders', 'businessVenders')
      .where('user.id = :userId', { userId: businessVenderFavorite.user.id })
      .andWhere('business.id = :businessId', {
        businessId: businessVenderFavorite.businesses[0].id,
      })
      .andWhere('businessVenders.id = :venderId', {
        venderId: businessVenderFavorite.businessVenders[0].id,
      })
      .getOne();

    return query.then(row => {
      const deleteQuery = this.mysqlManager(BusinessVenderFavorite).delete({
        id: row.id,
      });
      return deleteQuery;
    });
  }
}
