import { BusinessVendorManager } from './../entity/mysql/entities/MysqlBusinessVendorManager';
import { BusinessVendorField } from '../entity/mysql/entities/MysqlBusinessVendorField';
import { BusinessVendor } from '../entity/mysql/entities/MysqlBusinessVendor';
import { BaseService } from './BaseService';
import { Business } from '../entity/mysql/entities/MysqlBusiness';
import { Code } from '../entity/mysql/entities/MysqlCode';
import { BusinessVendorFieldManagerValue } from '../entity/mysql/entities/MysqlBusinessVendorFieldManagerValue';
import { User } from '../entity/mysql/entities/MysqlUser';

export default class ServiceBusinessVendorManager extends BaseService {
    constructor() {
        super();
    }

    public async checkFieldType(businessVendorField: BusinessVendorField) {
        const query = this.mysqlConnection
            .getRepository(BusinessVendorField)
            .createQueryBuilder('field')
            .leftJoinAndSelect('field.fieldType', 'code')
            .where('field.id = :id', { id: businessVendorField.id })
            .getOne();
        return query;
    }

    public async _getField(business: Business, informationType: Code) {
        const query = this.mysqlManager(BusinessVendorField).find({
            where: {
                business: business,
                informationType: informationType,
            },
            relations: ['informationType'],
        });
        return query;
    }

    /**
     * @description
     * 비즈니스와 밴더로 조회 한다.
     * @param businessVendor
     * @param business
     */
    public async _getBusinessVendorByBusinessVendorWithBusiness(
        businessVendor: BusinessVendor,
        business: Business,
    ) {
        const query = this.mysqlManager(BusinessVendor).findOne({
            relations: [
                'businessCode',
                'businessVendorFieldManagerValues',
                'businessVendorFieldManagerValues.idx',
                'businessVendorFieldManagerValues.businessVendorField',
                'businessVendorFieldManagerValues.businessVendorField.informationType',
                'businessVendorFieldManagerValues.businessVendorField.fieldType',
            ],
            where: { id: businessVendor.id, business: business },
        });
        return query;
    }

    public async post(businessVendorManager: BusinessVendorManager) {
        const query = await this.mysqlManager(BusinessVendorManager).save(
            businessVendorManager,
        );

        // 매니저는 수정 할때마다 search를 위해서 해주지만 매니저는 해줄 필요가 없다.
        // 코드의 이해를 돕기 위해서 주석 처리를 해놓은다.
        // const serviceSearchVendor = new ServiceSearchVendor();
        // await serviceSearchVendor._updateBySelectBusinessVendor(businessVendor);
        return query;
    }

    /**
     * @param businessVendorFieldManagerValue[]
     * @description
     * 매니저의 커스텀 필드 값을 배열로 받아서 저장한다.
     * @returns 배열된 결과물
     */
    public async _postVendorFieldManagerValue(
        businessVendorFieldManagerValue: BusinessVendorFieldManagerValue[],
    ) {
        const query = await this.mysqlManager(
            BusinessVendorFieldManagerValue,
        ).save(businessVendorFieldManagerValue);
        return query;
    }

    /**
     * @param businessVendor
     * @description
     * 비즈니스 밴더를 가지고 커스텀 필드의 매니저를 가져온다. 여기에서  BusinessVendorManager 의 하나의 레코드가
     * BusinessVendorFieldManagerValue 의 그룹 코드로 작동한다.
     * 고로 BusinessVendorManager 의 하나의 키 값은 매니저 한명을 의미한다.
     *
     * @returns BusinessVendorManager[]
     */
    public async _getBusinessVendorManagerByBusinessVendor(
        businessVendor: BusinessVendor,
    ) {
        const query = this.mysqlManager(BusinessVendorManager).find({
            relations: [
                'businessVendorFieldManagerValues',
                'businessVendorFieldManagerValues.idx',
                'businessVendorFieldManagerValues.businessVendorField',
                'businessVendorFieldManagerValues.businessVendorField.informationType',
                'businessVendorFieldManagerValues.businessVendorField.fieldType',
            ],
            where: {
                businessVendor: businessVendor,
            },
        });

        // query.map((v: any) => {});

        return query;
    }

    /**
     *
     * @param businessVendorManager id
     * @description
     * BusinessVendorManager 의 아이디로 매니저를 조회 한다.
     * @returns BusinessVendorManager
     */
    public async _getBusinessVendorManagerByBusinessVendorManagerId(
        businessVendorManager: BusinessVendorManager,
    ) {
        const query = this.mysqlManager(BusinessVendorManager).findOne({
            relations: [
                'businessVendorFieldManagerValues',
                'businessVendorFieldManagerValues.idx',
                'businessVendorFieldManagerValues.businessVendorField',
                'businessVendorFieldManagerValues.businessVendorField.informationType',
                'businessVendorFieldManagerValues.businessVendorField.fieldType',
            ],
            where: {
                id: businessVendorManager.id,
            },
        });

        // query.map((v: any) => {});

        return query;
    }

    /**
     * 매니저는 삭제는 밴더의 아이디와, 매니저 값 그룹 코드가 필요하다.
     * TODO: 권한 체크 부분에서는 해당 토큰의 값이 벤더를 소유하고 있어야 한다.
     * @param businessVendor 밴더 아이디
     * @param businessVendorFieldManagerValueGroup 매니저의 메인 키값을 하는 그룹 코드
     */
    public async delete(
        businessVendor: BusinessVendor,
        businessVendorFieldManagerValueGroup: BusinessVendorManager,
    ) {
        const query = this.mysqlManager(BusinessVendorManager).delete({
            businessVendor: businessVendor,
            id: businessVendorFieldManagerValueGroup.id,
        });
        return query;
    }

    public _getByCode(code: Code) {
        const query = this.mysqlManager(Code).findOne(code);
        return query;
    }

    public _getByVendorFieldManagerValue(
        businessVendorFieldManagerValue: BusinessVendorFieldManagerValue,
    ) {
        const query = this.mysqlManager(
            BusinessVendorFieldManagerValue,
        ).findOne({
            where: {
                id: businessVendorFieldManagerValue.id,
            },
            relations: [
                'businessVendorField',
                'businessVendorField.fieldType',
                'businessVendorField.informationType',
            ],
        });
        return query;
    }

    public _changeUserTypeManager(user: User) {
        user.type = 'manager';
        const query = this.mysqlManager(User).save(user);
        return query;
    }
}
