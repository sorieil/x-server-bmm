import { getManager } from 'typeorm';
import { BusinessMeetingTimeList } from './../entity/mysql/entities/MysqlBusinessMeetingTimeList';
import { BusinessCode } from '../entity/mysql/entities/MysqlBusinessCode';
import { BaseService } from './BaseService';

export default class ServiceUserMeetingRoomReservation extends BaseService {
    constructor() {
        super();
    }

    public async update(businessMeetingTimeList: BusinessMeetingTimeList) {
        const queryRunner = this.mysqlConnection.queryRunner;
        await queryRunner.connect();

        await queryRunner.startTransaction();
        const checkQuery = await queryRunner.manager.find(BusinessMeetingTimeList, {
            where: {
                id: businessMeetingTimeList.id,
                user: '!=NULL',
            },
        });

        try {
            if (checkQuery) {
                return false;
            } else {
                await queryRunner.manager.save(businessMeetingTimeList);
            }

            // commit transaction now:
            await queryRunner.commitTransaction();
        } catch (err) {
            // since we have errors lets rollback changes we made
            await queryRunner.rollbackTransaction();
            return false;
        } finally {
            // you need to release query runner which is manually created:
            await queryRunner.release();
            return true;
        }
    }
}
