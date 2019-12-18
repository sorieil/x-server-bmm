import { BaseService } from './BaseService';
import UserBuyer from '../entity/mysql/entities/MysqlUserBuyer';
import { User } from '../entity/mysql/entities/MysqlUser';
import { BusinessMeetingTimeList } from '../entity/mysql/entities/MysqlBusinessMeetingTimeList';
import { UserBuyerMeetingTimeList } from '../entity/mysql/entities/MysqlUserBuyerMeetingTimeList';
import { Business } from '../entity/mysql/entities/MysqlBusiness';

export default class ServiceUserBuyer extends BaseService {
    constructor() {
        super();
    }

    public post(userBuyer: UserBuyer) {
        const query = this.mysqlManager(UserBuyer).save(userBuyer);
        return query;
    }

    public get(userBuyer: UserBuyer) {
        const query = this.mysqlManager(UserBuyer).findOne(userBuyer);
        return query;
    }

    public _getUserBuyerByUser(user: User) {
        const query = this.mysqlManager(UserBuyer).findOne({
            where: {
                user: user,
            },
        });
        return query;
    }

    public async cloneFormBusinessTimeTableListsToUserBuyer(
        userBuyer: UserBuyer,
        business: Business,
    ) {
        // 검증 요소 필요함. 중복 입력 방지 기능
        const check = await this.mysqlManager(UserBuyerMeetingTimeList).find({
            where: {
                userBuyer: userBuyer,
            },
        });

        if (check.length === 0) {
            const cloneTarget = await this.mysqlManager(
                BusinessMeetingTimeList,
            ).find({
                where: { business: business },
            });

            // for(const item )
            // todo 데이터를 불러와서 for을 돌려서 비즈니스미팅타임리스트를 복사 한다.
            // 복사를 하는데 use 의 부모 상태 값 변경에 따른 일괄 업데이트를 처리 해줘야 한다.
            // 부모에도 OneToOne을 해줘야 하나?
            const userBuyerMeetingTimeListBucket: UserBuyerMeetingTimeList[] = [];
            for (const item of cloneTarget) {
                const userBuyerMeetingTimeList = new UserBuyerMeetingTimeList();
                userBuyerMeetingTimeList.businessMeetingTimeList = item;
                // userBuyerMeetingTimeList;
                userBuyerMeetingTimeList.userBuyer = userBuyer;

                userBuyerMeetingTimeListBucket.push(userBuyerMeetingTimeList);
            }
            const query = this.mysqlManager(UserBuyerMeetingTimeList).save(
                userBuyerMeetingTimeListBucket,
            );

            return query;
        } else {
            return true;
        }
    }
}
