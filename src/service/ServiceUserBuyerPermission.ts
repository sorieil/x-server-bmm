import { BusinessCode } from '../entity/mysql/entities/MysqlBusinessCode';
import { BaseService } from './BaseService';
import { User } from '../entity/mysql/entities/MysqlUser';
import UserBuyer from '../entity/mysql/entities/MysqlUserBuyer';

export default class ServiceUserBuyerPermission extends BaseService {
    constructor() {
        super();
    }

    /**
     * 유저기준으로 바이어에 등록이 되어 있는지 체크 한다.
     * @param user user.id 값을 입력한다.
     */
    public _getUserBuyerByUser(user: User) {
        const query = this.mysqlManager(UserBuyer).findOne({
            where: {
                user: user,
            },
        });
        return query;
    }
}
