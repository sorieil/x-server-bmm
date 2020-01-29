import { BusinessVendorMeetingTimeList } from './../entity/mysql/entities/MysqlBusinessVendorMeetingTimeList';
import { User } from './../entity/mysql/entities/MysqlUser';
import { BusinessMeetingTimeList } from './../entity/mysql/entities/MysqlBusinessMeetingTimeList';
import { BaseService } from './BaseService';
import UserBuyer from '../entity/mysql/entities/MysqlUserBuyer';
import { UserBuyerMeetingTimeList } from '../entity/mysql/entities/MysqlUserBuyerMeetingTimeList';
import { BusinessVendor } from '../entity/mysql/entities/MysqlBusinessVendor';

export default class ServiceUserBusinessTime extends BaseService {
    constructor() {
        super();
    }

    /**
     * 타임블럭의 날짜를 기준으로 데이터를 가져온다.
     * @param businessMeetingTimeList.dateBlock dateBlock 의 값 2019-01-01
     * @param businessMeetingTimeList.businessMeetingTimeId 타임테이블의 부모 테이블의 아이디 값
     */
    public _getTimeListByDateBlockForBuyer(
        userBuyer: UserBuyer,
        businessMeetingTimeList: BusinessMeetingTimeList,
    ) {
        const queryBuilder = this.mysqlConnection
            .getRepository(UserBuyerMeetingTimeList)
            .createQueryBuilder('buyerTime')
            .leftJoinAndSelect(
                'buyerTime.businessMeetingTimeList',
                'businessTimeList',
            )
            .leftJoinAndSelect(
                'buyerTime.businessMeetingRoomReservation',
                'reservation',
            )
            .leftJoinAndSelect('reservation.businessMeetingRoom', 'room')
            .leftJoinAndSelect('reservation.businessVendor', 'vendor')
            .leftJoinAndSelect('vendor.businessVendorFieldValues', 'fieldValue')
            .leftJoinAndSelect('fieldValue.businessVendorField', 'field')
            .leftJoinAndSelect('field.informationType', 'informationType')
            .leftJoinAndSelect('field.fieldType', 'fieldType')
            .andWhere('businessTimeList.dateBlock = :dateBlock', {
                dateBlock: businessMeetingTimeList.dateBlock,
            })
            .andWhere('buyerTime.userBuyerId = :userBuyerId', {
                userBuyerId: userBuyer.id,
            })
            .orderBy('businessTimeList.id');
        const query = queryBuilder.getMany();
        return query;
    }

    public _getTimeListByDateBlockForManger(
        businessVendor: BusinessVendor,
        businessMeetingTimeList?: BusinessMeetingTimeList,
    ) {
        const queryBuilder = this.mysqlConnection
            .getRepository(BusinessVendorMeetingTimeList)
            .createQueryBuilder('vendorTime')
            .leftJoinAndSelect(
                'vendorTime.userBuyerMeetingTimeLists',
                'vendorTime',
            )
            .leftJoinAndSelect(
                'vendorTime.businessMeetingRoomReservation',
                'reservation',
            )
            .leftJoinAndSelect('reservation.businessMeetingRoom', 'room')
            .leftJoinAndSelect('reservation.userBuyer', 'user')
            .leftJoinAndSelect('user.businessVendorFieldValues', 'fieldValue')
            .leftJoinAndSelect('fieldValue.businessVendorField', 'field')
            .leftJoinAndSelect('field.informationType', 'informationType')
            .leftJoinAndSelect('field.fieldType', 'fieldType');

        queryBuilder.andWhere('vendorTime.dateBlock = :dateBlock', {
            dateBlock: businessMeetingTimeList.dateBlock,
        });

        queryBuilder.andWhere(
            'vendorTime.businessVendorId = :businessVendorId',
            {
                businessVendorId: businessVendor.id,
            },
        );

        queryBuilder.orderBy('vendorTime.id');

        const query = queryBuilder.getMany();
        return query;
    }

    /**
     * 벤더의 스케쥴도 가져오고, 유저의 스케쥴도 조인해서 가져와야 한다.
     *
     * @param {BusinessVendor} businessVendor
     * @param {BusinessMeetingTimeList} [businessMeetingTimeList]
     * @returns
     * @memberof ServiceUserBusinessTime
     */
    public _getTimeListByDateBlockForAllBuyer(
        businessVendor: BusinessVendor,
        businessMeetingTimeList?: BusinessMeetingTimeList,
    ) {
        const queryBuilder = this.mysqlConnection
            .getRepository(BusinessVendorMeetingTimeList)
            .createQueryBuilder('vendorTime')
            // 비즈니스의 타임블럭 활성화와. 밴더의 활성화가 다를 경우를 대비해서..
            .leftJoinAndSelect(
                'vendorTime.businessMeetingTimeList',
                'businessTime',
            )
            .leftJoinAndSelect('vendorTime.businessVendor', 'vendor')
            .leftJoinAndSelect(
                'vendorTime.businessMeetingRoomReservations',
                'reservations',
            );
        // 예약자의 정보를 가져온다. 아마도 매니저가 조회 할때 사용해야 겠지?
        // .leftJoinAndSelect(
        //     'reservation.userBuyerMeetingTimeList',
        //     'userTimeList',
        // )
        // .leftJoinAndSelect('userTimeList.userBuyer', 'userBuyer');

        if (businessMeetingTimeList.dateBlock) {
            queryBuilder.andWhere('businessTime.dateBlock = :dateBlock', {
                dateBlock: businessMeetingTimeList.dateBlock,
            });
        }

        if (businessVendor.id) {
            queryBuilder.andWhere(
                'vendorTime.businessVendorId = :businessVendorId',
                {
                    businessVendorId: businessVendor.id,
                },
            );
        }

        queryBuilder.orderBy('businessTime.dateBlock', 'DESC');

        const query = queryBuilder.getMany();
        return query;
    }

    public _getByUser(user: User) {
        const query = this.mysqlManager(UserBuyer).findOne({
            where: {
                user: user,
            },
            relations: ['user'],
        });

        return query;
    }
}
