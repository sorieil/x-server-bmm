import { BusinessVendorFieldValue } from './../entity/mysql/entities/MysqlBusinessVendorFieldValue';
import { BaseService } from './BaseService';
import { Code } from '../entity/mysql/entities/MysqlCode';
import { BusinessVendor } from '../entity/mysql/entities/MysqlBusinessVendor';
export default class ServiceUserManager extends BaseService {
  constructor() {
    super();
  }

  /**
   * @description
   * 유저의 이름으로 관리자 페이지에서 입력한 밴더의 담당자 조회
   * @param name 담당자명
   * @param businessVendor 벤더의 아이디
   * @returns BusinessVendorFieldValue[]
   */
  public async _getBusinessVendorFieldValueByNameWithBusinessVendor(
    name: string,
    businessVendor: BusinessVendor,
  ) {
    const query = this.mysqlManager(BusinessVendorFieldValue).find({
      where: {
        text: name,
        businessVendor: businessVendor,
      },
    });

    return query;
  }
  /**
   * 전체 정보를 가져온다.
   */
  public async _getsCode() {
    const query = this.mysqlManager(Code).find();
    return query;
  }
}
