import { BaseService } from './BaseService';
import { BusinessVenderInformationField } from '../entity/mysql/entities/MysqlBusinessVenderInformationField';
import { ServiceBusiness } from './ServiceBusiness';
import { CodeTable } from '../entity/mysql/entities/MysqlCodeTable';
export default class ServiceCodeTable extends BaseService {
    constructor() {
        super();
    }

    /**
     * 카테고리 명으로 코드를 조회 한다.
     * @param codeTable codeTable.category
     */
    public async get(codeTable: CodeTable) {
        const query = this.mysqlManager(CodeTable).find({
            where: {
                category: codeTable.category,
            },
        });
        return query;
    }
    /**
     * 전체 정보를 가져온다.
     */
    public async gets() {
        const query = this.mysqlManager(CodeTable).find();
        return query;
    }
}
