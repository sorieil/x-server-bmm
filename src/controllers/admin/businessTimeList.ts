import { BusinessMeetingTimeList } from '../../entity/mysql/entities/MysqlBusinessMeetingTimeList';
import { Business } from '../../entity/mysql/entities/MysqlBusiness';
import { BusinessMeetingTime } from '../../entity/mysql/entities/MysqlBusinessMeetingTime';
import { Request, Response } from 'express';
import { RequestRole, responseJson, tryCatch } from '../../util/common';
import { check, validationResult } from 'express-validator';
import { businessPermission } from '../../util/permission';
import { ServiceBusinessTimeList } from '../../service/ServiceBusinessTimeList';

const apiPost = [
    [
        businessPermission.apply(this),
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
            // 업데이트가 아니라면, 기존에 있는 데이터는 삭제 한다.
            const service = await new ServiceBusinessTimeList();
            const business = (new Business().id = req.user.business.id);
            const businessMeetingTime = new BusinessMeetingTime();
            const businessMeetingTimeQuery: BusinessMeetingTime = await service.get(business);

            if (method === 'POST') {
                // 있는 데이터 삭제
                if (businessMeetingTimeQuery.businessMeetingTimeList.length > 0) {
                    businessMeetingTime.id = businessMeetingTimeQuery.id;
                    await service.deleteAll(businessMeetingTimeQuery);
                }
            }

            let timeLists: Array<BusinessMeetingTimeList>;
            console.log(
                'businessMeetingTimeQuery.businessMeetingTimeList.length:',
                businessMeetingTimeQuery.businessMeetingTimeList.length,
            );
            if (businessMeetingTimeQuery.businessMeetingTimeList.length > 0) {
                // Patch
                console.log('여기야?');
                timeLists = await new Promise(resolve => {
                    const timeBucket: Array<BusinessMeetingTimeList> = [];
                    const items = req.body.time_lists;

                    for (let i = 0; items.length > i; i++) {
                        const businessMeetingTimeList: BusinessMeetingTimeList = new BusinessMeetingTimeList();
                        // Patch 일경우 아이디 값을 넣어준다.
                        Object.assign(businessMeetingTimeList, items[i], {
                            businessMeetingTime: businessMeetingTimeQuery,
                        });
                        timeBucket.push(businessMeetingTimeList);
                    }

                    resolve(timeBucket);
                });
            } else {
                // Post
                console.log('아님 여기야?');
                timeLists = await new Promise(resolve => {
                    const timeBucket: Array<BusinessMeetingTimeList> = [];
                    const items = req.body.time_lists;
                    // console.log(req.body.time_lists);
                    for (let i = items.length; 0 < i; i--) {
                        const firstNode = items[i - 1];
                        console.log('first node:', firstNode);
                        for (let j = 0; firstNode.time.length > j; j++) {
                            const timeBlock = firstNode.time[j];
                            const businessMeetingTimeList: BusinessMeetingTimeList = new BusinessMeetingTimeList();
                            // Patch 일경우 아이디 값을 넣어준다.
                            businessMeetingTimeList.businessMeetingTime = businessMeetingTimeQuery;
                            businessMeetingTimeList.timeBlock = timeBlock.time;
                            businessMeetingTimeList.use = timeBlock.status;
                            businessMeetingTimeList.dateBlock = firstNode.date;
                            timeBucket.push(businessMeetingTimeList);
                        }
                    }
                    resolve(timeBucket);
                });
            }

            const query = await service.post(timeLists);

            responseJson(res, query, method, 'success');
        } catch (error) {
            tryCatch(res, error);
        }
    },
];

export default {
    apiPost,
};
