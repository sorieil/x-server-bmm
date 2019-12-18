import { BaseService } from './BaseService';
import { BusinessVendor } from '../entity/mysql/entities/MysqlBusinessVendor';
import { Business } from '../entity/mysql/entities/MysqlBusiness';
import SearchVendor from '../entity/mysql/entities/MysqlSearchVendor';
export default class ServiceUserVendor extends BaseService {
    constructor() {
        super();
    }

    /**
     * @description
     * 비즈니스 아이디로 등록되어 있는 밴더목록을 가져오고,
     * 키워드 검색 기능
     * 필더 기능을
     * 제공한다.
     *
     * @param {Business} business
     * @param {string} [keyword]
     * @param {string} [filter]
     * @returns []
     * @memberof ServiceUserVendor
     * @target 유저
     */
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
            .leftJoinAndSelect(
                'vendor.businessMeetingRoomReservations',
                'reservation',
            )
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

        return query;
    }

    /**
     * @description
     * 밴더의 디테일한 값을 조회한다.
     *
     * @param {BusinessVendor} businessVendor
     * @returns []
     * @memberof ServiceUserVendor
     * @target 유저
     */
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
                'businessVendorManagers',
                'businessVendorManagers.businessVendorFieldManagerValues',
                'businessVendorManagers.businessVendorFieldManagerValues.businessVendorField',
                'businessVendorManagers.businessVendorFieldManagerValues.businessVendorField.informationType',
                'businessVendorManagers.businessVendorFieldManagerValues.businessVendorField.fieldType',
                'businessVendorManagers.businessVendorFieldManagerValues.idx',
            ],
        });
        return query;
    }

    /**
     * @description
     * 밴더의 아이디로 배더를 조회 한다.
     * 밴더 코드가 인증된 밴더를 조회한다.
     *
     * @param {BusinessVendor} businessVendor
     * @returns
     * @memberof ServiceUserVendor
     * @target 유저
     */
    public verityVendorCode(businessVendor: BusinessVendor) {
        const query = this.mysqlConnection
            .getRepository(BusinessVendor)
            .createQueryBuilder('vendor')
            .leftJoinAndSelect('vendor.businessCode', 'code')
            .leftJoinAndSelect('vendor.businessVendorFieldValues', 'value')
            .leftJoinAndSelect('value.businessVendorField', 'field')
            .leftJoinAndSelect('field.informationType', 'informationType')
            .leftJoinAndSelect('field.fieldType', 'fieldType')
            .where('vendor.id = :vendorId', { vendorId: businessVendor.id })
            // .andWhere('code.code = :vendorCode', {
            //   vendorCode: businessVendor.businessCode.code,
            // })
            .andWhere('code.use = "yes"')
            .getOne();
        return query;
    }
}
