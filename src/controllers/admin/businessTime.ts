import { Business } from '../../entity/mysql/entities/MysqlBusiness';
import { BusinessMeetingTime } from '../../entity/mysql/entities/MysqlBusinessMeetingTime';
import { Request, Response } from 'express';
import { RequestRole, responseJson, tryCatch } from '../../util/common';
import { check, validationResult } from 'express-validator';
import { businessPermission } from '../../util/permission';
import { ServiceBusinessTime } from '../../service/ServiceBusinessTime';
import { resolve } from 'bluebird';
import moment from 'moment';

const apiPost = [
    [
        businessPermission.apply(this),
        check('interval_time')
            .not()
            .isEmpty()
            .isNumeric(),
        // check('start_date').custom((value, { req }) => {
        //     const date = moment(value, 'YYYY-MM-DD').isValid();
        //     if (!date) {
        //         return Promise.reject('Invalid date');
        //     }
        // }),
        // check('end_date').custom((value, { req }) => {
        //     const date = moment(value, 'YYYY-MM-DD').isValid();
        //     if (!date) {
        //         return Promise.reject('Invalid date');
        //     }
        // }),
        check('start_date')
            .not()
            .isEmpty(),
        check('end_date')
            .not()
            .isEmpty(),
    ],
    async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req);
            const method: RequestRole = req.method.toString() as any;

            if (!errors.isEmpty()) {
                responseJson(res, errors.array(), method, 'invalid');
                return;
            }
            const businessMeetingTime: BusinessMeetingTime = new BusinessMeetingTime();
            const service: ServiceBusinessTime = new ServiceBusinessTime();
            const business: Business = new Business();
            const body = req.body;
            business.id = req.user.business.id;
            const queryBusinessMeetingTime = await service.getByBusiness(business);
            if (queryBusinessMeetingTime) {
                businessMeetingTime.id = queryBusinessMeetingTime.id;
                if (method === 'POST') {
                    responseJson(res, [], method, 'success');
                    return;
                }
            }
            const startDt = body.start_date;
            const endDt = body.end_date;
            const intervalTime = body.interval_time;

            businessMeetingTime.business = business;
            businessMeetingTime.startDt = startDt;
            businessMeetingTime.endDt = endDt;
            businessMeetingTime.intervalTime = intervalTime;

            const query = await service.post(businessMeetingTime);

            const generateTimeList: Array<any> = await new Promise(resolve => {
                const end = moment(endDt)
                    .hour(0)
                    .hour(0)
                    .minute(0);
                const start = moment(startDt)
                    .hour(0)
                    .hour(0)
                    .minute(0);
                let interval = Number(intervalTime);
                const diffDays = moment.duration(end.diff(start));
                console.log('diff days:', diffDays.days());
                const daysBucket: Array<any> = [];

                const timeIntervalRange = Math.floor(1440 / intervalTime);
                for (let i = 0; diffDays.days() + 1 > i; i++) {
                    const childBucket = [];
                    for (let j = timeIntervalRange; j > 0; j--) {
                        const dividedTime = start
                            .add(intervalTime, 'm')
                            .format('HH:mm')
                            .toString();
                        childBucket.push({
                            time: dividedTime,
                            status: 'no',
                        });
                    }
                    if (i === 0) {
                        start.add(-1, 'days');
                    }
                    daysBucket.push({ date: start.format('YYYY[-]MM[-]DD'), time: childBucket });
                }
                resolve(daysBucket);
            });
            console.log('time lists:', generateTimeList);

            responseJson(res, generateTimeList, method, 'success');
        } catch (error) {
            tryCatch(res, error);
        }
    },
];

export default {
    apiPost,
};
