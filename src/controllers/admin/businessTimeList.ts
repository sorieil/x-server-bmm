import { BusinessMeetingTimeList } from '../../entity/mysql/entities/MysqlBusinessMeetingTimeList';
import { Business } from '../../entity/mysql/entities/MysqlBusiness';
import { BusinessMeetingTime } from '../../entity/mysql/entities/MysqlBusinessMeetingTime';
import { Request, Response } from 'express';
import { RequestRole, responseJson, tryCatch } from '../../util/common';
import { check, validationResult, param } from 'express-validator';
import { businessAdminPermission } from '../../util/permission';
import { ServiceBusinessTimeList } from '../../service/ServiceBusinessTimeList';

const apiPost = [
    [
        businessAdminPermission.apply(this),
        check('time_lists')
            .not()
            .isEmpty()
            .isArray(),
    ],
    async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req);
            const method: RequestRole = req.method.toString() as any;

            if (!errors.isEmpty()) {
                responseJson(res, errors.array(), method, 'invalid');
                return;
            }

            const service = new ServiceBusinessTimeList();
            const business = new Business();
            business.id = req.user.business.id;
            const businessMeetingTime = new BusinessMeetingTime();
            const businessMeetingTimeQuery: BusinessMeetingTime = await service.getByBusiness(business);

            // 이벤트 기간을 새로 설정한다는 의미는 타임 테이블이 변경되는다는 의미 이기 때문에 등록되어 있는 타임테이블을 모두 삭제 한다.
            if (businessMeetingTimeQuery.businessMeetingTimeLists.length > 0) {
                businessMeetingTime.id = businessMeetingTimeQuery.id;
                await service.deleteAllMeetingTimeList(businessMeetingTime);
            }

            // setTimeout 을여기에서 해주는 이유는 setTimeout는 모든 프로세스에서 마지막으로 실행이 된다. 비동기에 대한 확실한 프로세스를 진행하기 위해서
            // 코드 삽입
            return await setTimeout(async () => {
                let timeLists: Array<BusinessMeetingTimeList>;
                timeLists = await new Promise(resolve => {
                    const timeBucket: Array<BusinessMeetingTimeList> = [];
                    const items = req.body.time_lists;
                    for (let i = items.length; 0 < i; i--) {
                        const firstNode = items[i - 1];
                        for (let j = 0; firstNode.time.length > j; j++) {
                            const timeBlock = firstNode.time[j];
                            const businessMeetingTimeList: BusinessMeetingTimeList = new BusinessMeetingTimeList();
                            businessMeetingTimeList.businessMeetingTime = businessMeetingTimeQuery;
                            businessMeetingTimeList.timeBlock = timeBlock.time;
                            businessMeetingTimeList.use = timeBlock.status;
                            businessMeetingTimeList.dateBlock = firstNode.date;
                            timeBucket.push(businessMeetingTimeList);
                        }
                    }
                    resolve(timeBucket);
                });

                const query = await service.post(timeLists);

                responseJson(res, query, method, 'success');
            }, 0);
        } catch (error) {
            tryCatch(res, error);
        }
    },
];

const apiPatch = [
    [
        businessAdminPermission.apply(this),
        param('timeListId')
            .not()
            .isEmpty()
            .isNumeric(),
        check('use')
            .not()
            .isEmpty(),
    ],
    async (req: Request, res: Response) => {
        const method: RequestRole = req.method.toString() as any;
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            responseJson(res, errors.array(), method, 'invalid');
            return;
        }
        const body = req.body;
        const businessMeetingTimeList = new BusinessMeetingTimeList();
        businessMeetingTimeList.id = req.params.timeListId;

        const service = new ServiceBusinessTimeList();
        const businessTimeListQuery = await service.get(businessMeetingTimeList);

        if (!businessTimeListQuery) {
            responseJson(res, [{ message: 'You don`t have permission or invalid data.' }], method, 'invalid');
            return;
        }

        businessTimeListQuery.use = body.use;

        const query = await service.update(businessTimeListQuery);
        responseJson(res, [query], method, 'success');
    },
];

const apiGets = [
    [businessAdminPermission.apply(this)],
    async (req: Request, res: Response) => {
        const method: RequestRole = req.method.toString() as any;
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            responseJson(res, errors.array(), method, 'invalid');
            return;
        }

        const service = new ServiceBusinessTimeList();
        const business = new Business();
        business.id = req.user.business.id;

        const query = await service.getByBusiness(business);
        Object.assign(query, { timeLists: query.businessMeetingTimeLists });
        delete query.businessMeetingTimeLists;

        responseJson(res, [query], method, 'success');
    },
];

export default {
    apiPost,
    apiGets,
    apiPatch,
};
