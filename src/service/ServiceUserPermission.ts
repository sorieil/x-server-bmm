import { BaseService } from './BaseService';
import { Login } from '../entity/mysql/entities/MysqlLogin';
import { User } from '../entity/mysql/entities/MysqlUser';
import { BusinessVendor } from '../entity/mysql/entities/MysqlBusinessVendor';
import { Business } from '../entity/mysql/entities/MysqlBusiness';
export default class ServiceUserPermission extends BaseService {
    constructor() {
        super();
    }

    /**
     * @description
     * Login 아이디로 user 의 데이터와 BusinessVendorManager
     * 조인 데이터도 가져온다.
     * 그리고
     * @param login login
     *
     * @returns User
     */
    public async _getUserByLogin(login: Login) {
        const query = this.mysqlManager(User).findOne({
            where: {
                login: login,
            },
            relations: ['businessVendorManager'],
        });
        return query;
    }

    /**
     * @description
     * BusinessVendor와 Business로 BusinessVendor 의 값을 가져온다.
     * @param businessVendor
     * @param business
     * @returns BusinessVendor
     */
    public async _getBusinessVendorByBusinessVendorWithBusinessId(
        businessVendor: BusinessVendor,
        business: Business,
    ) {
        const query = this.mysqlManager(BusinessVendor).findOne({
            where: { id: businessVendor.id, business: business },
        });
        return query;
    }
}
