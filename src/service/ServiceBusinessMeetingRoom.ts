import { BusinessMeetingRoom } from '../entity/mysql/entities/MysqlBusinessMeetingRoom';
import { AdminLogin } from '../entity/mysql/entities/MysqlAdminLogin';
import { Admin } from '../entity/mysql/entities/MysqlAdmin';
import { BusinessDetail } from '../entity/mysql/entities/MysqlBusinessDetail';
import { Business } from '../entity/mysql/entities/MysqlBusiness';
import { BaseService } from './BaseService';
import { read, write, utils } from 'xlsx';

/**
 * 비즈니스 관련 서비스 클래스이다.
 */
export class ServiceBusinessMeetingRoom extends BaseService {
    constructor() {
        super();
    }

    public async post(entity: BusinessMeetingRoom) {
        const query = await this.mysqlManager(BusinessMeetingRoom).save(entity);
        delete query.business;
        return query;
    }

    /**
     * Business.id로 미팅방을 가져온다.
     * @param id Business.id
     */
    public async gets(business: Business) {
        const query = this.mysqlManager(BusinessMeetingRoom).find({
            where: {
                business: business,
            },
        });

        return query;
    }

    public async get(businessMeetingRoom: BusinessMeetingRoom) {
        const query = this.mysqlManager(BusinessMeetingRoom).findOne({
            where: {
                id: businessMeetingRoom.id,
            },
        });

        return query;
    }

    public async getWidthBusiness(
        businessMeetingRoom: BusinessMeetingRoom,
        business: Business,
    ) {
        const query = this.mysqlManager(BusinessMeetingRoom).findOne({
            where: { id: businessMeetingRoom.id, business: business },
        });

        return query;
    }

    /**
     * 관리자의 아이디와, 삭제할 방 아이디 값을 기준으로 조인해서 삭제를 한다.
     * TODO: 아직 삭제 기능은 안들어 갔음. 먼저 admin.id -> business.id -> business_meeting_room 값을 기준으로 데이터를 확인후 삭제
     * @param id BusinessMeetingRoom.id
     * @param adminId Admin.id
     */
    public async delete(businessMeetingRoom: BusinessMeetingRoom) {
        const query = this.mysqlManager(BusinessMeetingRoom).delete(
            businessMeetingRoom,
        );
        return query;
    }
}
