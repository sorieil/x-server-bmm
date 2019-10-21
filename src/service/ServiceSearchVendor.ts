import { BusinessCode } from '../entity/mysql/entities/MysqlBusinessCode';
import { BaseService } from './BaseService';
import { BusinessVendor } from '../entity/mysql/entities/MysqlBusinessVendor';
import SearchVendor from '../entity/mysql/entities/MysqlSearchVendor';
import business from '../controllers/admin/business';

export default class ServiceSearchVendor extends BaseService {
  constructor() {
    super();
  }

  /**
   * 비즈니스 밴더 관련 업데이트나 입력이 있을때마다 갱신을 해준다.
   * 원래는 End point에서 try catch 를 해야 하는데 여기서 해주는 이유는 이 함수는 서비스에서만 사용하기 때문이다.
   * @param businessVendor businessVendor entity
   */
  public async _updateBySelectBusinessVendor(businessVendor: BusinessVendor) {
    try {
      // console.log('businessVendor: \n', businessVendor);

      // 저장된 벤더의 정보를 가져온다.
      const businessVendorQuery = await this.mysqlManager(
        BusinessVendor,
      ).findOne({
        where: { id: businessVendor.id },
        relations: [
          'businessVendorFieldValues',
          'businessVendorFieldValues.businessVendorField',
          'businessVendorFieldValues.idx',
        ],
      });

      if (!businessVendorQuery)
        throw new Error('_updateBySelectBusinessVendor; Vendor data not found');
      // 그전에 데이터가 있는지 검색한다.
      let searchVendor = await this.mysqlManager(SearchVendor).findOne({
        where: {
          businessVendor: businessVendor,
        },
      });

      if (!searchVendor) searchVendor = new SearchVendor();
      // 키워드를 스트링으로 직열화 해준다.
      const keyword = businessVendorQuery.businessVendorFieldValues.reduce(
        (a: string, c: any) => {
          let tempValue = c.text || c.textarea;
          // console.log('Type of a keyword: ', typeof a, a);
          if (!tempValue) return a;
          if (a) tempValue = ',' + tempValue;
          return a + tempValue;
        },
        '',
      );

      // 필터의 값을 숫자 크기대로 정렬 해준다. 그리고 스트링으로 직열화 한다.
      const filter = businessVendorQuery.businessVendorFieldValues.reduce(
        (a: Array<any>, c: any) => {
          const tempValue = c.idx ? c.idx.id : null;
          // console.log('Type of a filter: ', typeof a, a);
          if (!tempValue) return a;
          a.push(tempValue);
          return a;
        },
        [],
      );
      const vm = this;

      //setTimeout 은 맨 나중에 실행되는 블록이다.
      const query = setTimeout(async () => {
        // console.log('filter:', filter);
        searchVendor.keyword = keyword;
        searchVendor.filter = filter
          .sort((a: number, b: number) => a - b)
          .join();
        searchVendor.businessVendor = businessVendor;
        // console.log('Final process');
        return await vm.mysqlManager(SearchVendor).save(searchVendor);
      }, 0);

      return query;
    } catch (error) {
      throw new Error('_updateBySelectBusinessVendor error' + error);
    }
  }
}
