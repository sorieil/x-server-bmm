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
    public async get(business: Business) {
        const query = await this.mysqlManager(BusinessMeetingRoom).find({
            where: {
                business: business,
            },
        });

        return query;
    }

    /**
     * Admin 으로 비즈니스와 비즈니스 미팅룸이 존재 하는지 체크를 한다.
     * @param admin Admin 아이디를 받는다.
     * this.getRepository(Booking).createQueryBuilder("booking")
            .innerJoinAndSelect("booking.user", "user")
            // .innerJoinAndSelect("booking.photographerService", "service")
            .innerJoinAndSelect("booking.photographer", "photographer")
            .innerJoinAndSelect("photographer.user", "p_user")
            .where("booking.user = :userID").setParameter("userID", userID);
     */
    public async permissionBusinessMeetingRoom(admin: Admin, businessMeetingRoom: BusinessMeetingRoom) {
        const query1 = this.mysqlConnection.createQueryBuilder();
        const query = this.mysqlManager(Admin)
            .createQueryBuilder('admin')
            .leftJoin('admin.business', 'business')
            .leftJoin('business.businessMeetingRoom', 'businessMeetingRoom')
            .where('admin.id = :adminId', { adminId: admin.id })
            .andWhere('businessMeetingRoom.id = :businessMeetingRoomId', {
                businessMeetingRoomId: businessMeetingRoom.id,
            });
        return query.getMany();
    }

    /**
     * 관리자의 아이디와, 삭제할 방 아이디 값을 기준으로 조인해서 삭제를 한다.
     * TODO: 아직 삭제 기능은 안들어 갔음. 먼저 admin.id -> business.id -> business_meeting_room 값을 기준으로 데이터를 확인후 삭제
     * @param id BusinessMeetingRoom.id
     * @param adminId Admin.id
     */
    public async delete(businessMeetingRoom: BusinessMeetingRoom) {
        const query = await this.mysqlManager(BusinessMeetingRoom).remove(businessMeetingRoom);
        return query;
    }
}
