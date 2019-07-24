import { BaseService } from './BaseService';
import { Login } from '../entity/mysql/entities/MysqlLogin';
import { User } from '../entity/mysql/entities/MysqlUser';
import { userInfo } from 'os';
export default class ServiceUserPermission extends BaseService {
    constructor() {
        super();
    }

    public async _byLogin(login: Login) {
        const query = this.mysqlManager(User).findOne({
            where: {
                login: login,
            },
        });
        return query;
    }
}
