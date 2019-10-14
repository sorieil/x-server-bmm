import { BaseService } from './BaseService';
import { Code } from '../entity/mysql/entities/MysqlCode';
export default class ServiceCode extends BaseService {
  constructor() {
    super();
  }

  /**
   * 카테고리 명으로 코드를 조회 한다.
   * @param code code.category
   */
  public async get(code: Code) {
    const query = this.mysqlManager(Code).find({
      where: {
        category: code.category,
      },
      relations: [
        'businessVendorFieldInformationTypes',
        'businessVendorFieldInformationTypes.businessVendorFieldChildNodes',
        'businessVendorFieldInformationTypes.fieldType',
      ],
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
