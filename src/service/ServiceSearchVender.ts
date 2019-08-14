import { BusinessCode } from '../entity/mysql/entities/MysqlBusinessCode';
import { BaseService } from './BaseService';
import { BusinessVender } from '../entity/mysql/entities/MysqlBusinessVender';
import SearchVender from '../entity/mysql/entities/MysqlSearchVender';
import business from '../controllers/admin/business';

export default class ServiceSearchVender extends BaseService {
    constructor() {
        super();
    }

    /**
     * 비즈니스 밴더 관련 업데이트나 입력이 있을때마다 갱신을 해준다.
     * 원래는 End point에서 try catch 를 해야 하는데 여기서 해주는 이유는 이 함수는 서비스에서도 사용하기 때문이다.
     * @param businessVender BusinessVender entity
     */
    public async _updateBySelectBusinessVender(businessVender: BusinessVender) {
        try {
            // console.log('businessVender: \n', businessVender);

            // 저장된 벤더의 정보를 가져온다.
            const businessVenderQuery = await this.mysqlManager(BusinessVender).findOne({
                where: { businessVender },
                relations: [
                    'businessVenderFieldValues',
                    'businessVenderFieldValues.businessVenderField',
                    'businessVenderFieldValues.idx',
                ],
            });

            console.log(
                '_update by select business vender >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>\n',
                businessVenderQuery,
            );

            // 그전에 데이터가 있는지 검색한다.
            const searchVender = await this.mysqlManager(SearchVender).findOne({
                where: {
                    businessVender: businessVender,
                },
            });

            // 키워드를 스트링으로 직열화 해준다.
            const keyword = businessVenderQuery.businessVenderFieldValues.reduce((a, c) => {
                let tempValue = c.text || c.textarea;
                if (!tempValue) return a;
                if (a) tempValue = ',' + tempValue;
                return a + tempValue;
            }, '');

            // 필터의 값을 숫자 크기대로 정렬 해준다. 그리고 스트링으로 직열화 한다.
            const filter = businessVenderQuery.businessVenderFieldValues.reduce((a, c) => {
                const tempValue = c.idx ? c.idx.id : null;
                console.log('Type of a', typeof a);
                if (!a) a = [];
                if (!tempValue) return a;
                return a.push(tempValue);
            }, []) as [];

            console.log('filter:', filter);

            searchVender.keyword = keyword;
            searchVender.businessVender = businessVender;
            searchVender.filter = filter.sort((a: number, b: number) => a - b).join();

            const query = await this.mysqlManager(SearchVender).save(searchVender);
            return query;
        } catch (error) {
            throw new Error('_updateBySelectBusinessVender error' + error);
            return ['Error occurred'];
        }
    }
}
