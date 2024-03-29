import { Admin } from '../entity/mysql/entities/MysqlAdmin';
import { Business } from './../entity/mysql/entities/MysqlBusiness';
import { BaseService } from './BaseService';

/**
 * 비즈니스 관련 서비스 클래스이다.
 */
export class ServiceBusiness extends BaseService {
    constructor() {
        super();
    }
    /**
     * 비즈니스의 기본 정보를 가져온다.
     * @param entity AdminLogin
     */
    public async get(admin: Admin) {
        const query = this.mysqlManager(Business).findOne({
            where: { admin: admin },
        });
        return query;
    }
    /**
     * 비즈니스 정보를 입력/수정 한다. ID 값이 있으면 수정 없으면 입력이다.
     * @param entity Business
     */
    public async post(business: Business) {
        const query = await this.mysqlManager(Business).save(business);
        delete query.admin;
        return query;
    }

    /**
     * Business.id 값으로 비즈니스 정보를 불러온다.
     * @param id Business.id
     */
    public async _getById(id: number) {
        const query = await this.mysqlManager(Business).find({
            where: {
                id: id,
            },
        });

        return query[0];
    }

    /**
     * Business.id 값으로 Admin 과 조인해서 소유권이 있는지 체크 한다.
     * @param id Business.id
     */
    public async _permissionBusiness(id: number) {
        const query = this.mysqlManager(Business).find({
            where: {
                id: id,
            },
            relations: ['admin'],
        });
        return query;
    }

    public async delete(business: Business) {
        const query = this.mysqlManager(Business).delete(business);
        return query;
    }
}
