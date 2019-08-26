import { BusinessVenderFieldValue } from './../entity/mysql/entities/MysqlBusinessVenderFieldValue';
import { BaseService } from './BaseService';
import { Code } from '../entity/mysql/entities/MysqlCode';
import { BusinessVender } from '../entity/mysql/entities/MysqlBusinessVender';
export default class ServiceUserManager extends BaseService {
    constructor() {
        super();
    }

    /**
     * 유저의 이름으로 관리자 페이지에서 입력한 밴더의 담당자 조회
     * @param name 담당자명
     * @param businessVender 벤더의 아이디
     */
    public async _getByNameWithVender(name: string, businessVender: BusinessVender) {
        const query = this.mysqlManager(BusinessVenderFieldValue).find({
            where: {
                text: name,
                businessVender: BusinessVender,
            },
        });

        return query;
    }
    /**
     * 전체 정보를 가져온다.
     */
    public async gets() {
        const query = this.mysqlManager(Code).find();
        return query;
    }
}
