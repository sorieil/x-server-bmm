import { BusinessVendorFavorite } from '../entity/mysql/entities/MysqlBusinessVendorFavorite';
import { BaseService } from './BaseService';
import { User } from '../entity/mysql/entities/MysqlUser';
import { Business } from '../entity/mysql/entities/MysqlBusiness';
export default class ServiceBusinessVendorFavorite extends BaseService {
    constructor() {
        super();
    }

    public async post(businessVendorFavorite: BusinessVendorFavorite) {
        const query = this.mysqlManager(BusinessVendorFavorite).save(
            businessVendorFavorite,
        );
        return query;
    }

    public async _getByWhere(businessVendorFavorite: BusinessVendorFavorite) {
        const query = this.mysqlConnection
            .getRepository(BusinessVendorFavorite)
            .createQueryBuilder('favorite')
            .innerJoin('favorite.user', 'user')
            .innerJoin('favorite.businesses', 'business')
            .innerJoin('favorite.businessVendors', 'businessVendors')
            .where('user.id = :userId', {
                userId: businessVendorFavorite.user.id,
            })
            .andWhere('business.id = :businessId', {
                businessId: businessVendorFavorite.businesses[0].id,
            })
            .andWhere('businessVendors.id = :vendorId', {
                vendorId: businessVendorFavorite.businessVendors[0].id,
            })
            .getOne();
        return query;
    }

    // 이 부분이 문제이다.
    // business vendor favorite과 business vendor 의 관계가 ManyToMany 인데 joinTable 은

    public async _getByUserWithBusinessVendor(user: User, business: Business) {
        const query = this.mysqlManager(BusinessVendorFavorite).find({
            where: {
                user: user,
                business: business,
            },
            relations: [
                'businessVendors',
                'businessVendors.businessVendorFieldValues',
                'businessVendors.businessVendorFieldValues.businessVendorField',
            ],
        });

        return query;
    }

    public async _deleteByWhere(
        businessVendorFavorite: BusinessVendorFavorite,
    ) {
        const query = this.mysqlConnection
            .getRepository(BusinessVendorFavorite)
            .createQueryBuilder('favorite')
            .innerJoin('favorite.user', 'user')
            .innerJoin('favorite.businesses', 'business')
            .innerJoin('favorite.businessVendors', 'businessVendors')
            .where('user.id = :userId', {
                userId: businessVendorFavorite.user.id,
            })
            .andWhere('business.id = :businessId', {
                businessId: businessVendorFavorite.businesses[0].id,
            })
            .andWhere('businessVendors.id = :vendorId', {
                vendorId: businessVendorFavorite.businessVendors[0].id,
            })
            .getOne();

        return query.then(row => {
            const deleteQuery = this.mysqlManager(
                BusinessVendorFavorite,
            ).delete({
                id: row.id,
            });
            return deleteQuery;
        });
    }
}
