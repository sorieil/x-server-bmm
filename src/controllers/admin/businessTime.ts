import { Business } from '../../entity/mysql/entities/MysqlBusiness';
import { BusinessMeetingTime } from '../../entity/mysql/entities/MysqlBusinessMeetingTime';
import { Request, Response } from 'express';
import { RequestRole, responseJson, tryCatch } from '../../util/common';
import { check, validationResult } from 'express-validator';
import { businessAdminPermission } from '../../util/permission';
import { ServiceBusinessTime } from '../../service/ServiceBusinessTime';
import moment from 'moment';
/**
 * @description
 * 실행할 날짜와 시작 시간과 끝나는 시간, 미팅 타임등을 넣으면, 타임 테이블이 생선된다,
 * 생성과 수정이 같은 API 에서 일뤄진다.
 */
const apiPost = [
    [
        businessAdminPermission.apply(this),
        check('interval_time')
            .not()
            .isEmpty()
            .isNumeric(),
        check('start_date').custom((value, { req }) => {
            const date = moment(value, 'YYYY-MM-DD', true).isValid();
            console.log('date:', date);
            if (!date) {
                return Promise.reject('start_date Invalid date');
            }
            return true;
        }),
        check('end_date').custom((value, { req }) => {
            const date = moment(value, 'YYYY-MM-DD', true).isValid();
            console.log('date:', date);
            if (!date) {
                return Promise.reject('start_date Invalid date');
            }
            return true;
        }),
        check('start_time').custom((value, { req }) => {
            const date = moment(value, 'HH:mm', true).isValid();
            console.log('date:', date);
            if (!date) {
                return Promise.reject('start_time Invalid date');
            }
            return true;
        }),
        check('end_time').custom((value, { req }) => {
            const date = moment(value, 'HH:mm', true).isValid();
            console.log('date:', date);
            if (!date) {
                return Promise.reject('end_time Invalid date');
            }
            return true;
        }),
    ],
    async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req);
            const method: RequestRole = req.method.toString() as any;

            if (!errors.isEmpty()) {
                console.log('Finish:', errors.array());
                responseJson(res, errors.array(), method, 'invalid');
                return;
            }
            const businessMeetingTime: BusinessMeetingTime = new BusinessMeetingTime();
            const service: ServiceBusinessTime = new ServiceBusinessTime();
            const business: Business = new Business();
            const body = req.body;
            business.id = req.user.business.id;
            const queryBusinessMeetingTime = await service.get(business);
            if (queryBusinessMeetingTime) {
                businessMeetingTime.id = queryBusinessMeetingTime.id;

                // 생성과 수정이 같은 소스이긴 하지만, 메소드 구별은 해준다. 혼란을 막기 위해서
                if (method === 'POST') {
                    responseJson(res, [], method, 'success');
                    return;
                }
            }
            const startDt = body.start_date;
            const endDt = body.end_date;
            const intervalTime = body.interval_time;
            const startTime = moment(body.start_time, 'HH:mm');
            const endTime = moment(body.end_time, 'HH:mm');

            businessMeetingTime.business = business;
            businessMeetingTime.startDt = startDt;
            businessMeetingTime.endDt = endDt;
            businessMeetingTime.intervalTime = intervalTime;

            const query = await service.post(businessMeetingTime);

            const generateTimeList: Array<any> = await new Promise(resolve => {
                const end = moment(endDt)
                    .hour(Number(endTime.format('HH')))
                    .minute(Number(endTime.format('mm')));
                let start = moment(startDt)
                    .hour(Number(startTime.format('HH')))
                    .minute(Number(startTime.format('mm')));
                let interval = Number(intervalTime);

                const diffDays = moment.duration(end.diff(start));
                // console.log('diff days:', diffDays.days());
                const daysBucket: Array<any> = [];
                const startDividedTime = Number(startTime.format('HH')) * 60 + Number(startTime.format('mm'));
                const endDividedTime = Number(endTime.format('HH')) * 60 + Number(endTime.format('mm'));
                const timeRange = endDividedTime - startDividedTime;
                console.log(Number(startTime.format('HH')), Number(startTime.format('mm')));
                console.log('timeRange:', timeRange);

                const timeIntervalRange = Math.floor(timeRange / interval);
                for (let i = 0; diffDays.days() >= i; i++) {
                    console.log(start.format('YYYY-MM-DD HH:mm'));
                    const childBucket = [];
                    for (let j = timeIntervalRange; j > 0; j--) {
                        console.log('j:', j);
                        // TODO 여기에서 스타트 타임과 엔딩 타임도 넣어줘야 한다.
                        if (j === timeIntervalRange) {
                            const dividedTime = start.format('HH:mm').toString();
                            childBucket.push({
                                time: dividedTime,
                                status: 'no',
                            });
                        } else {
                            const dividedTime = start
                                .add(interval, 'm')
                                .format('HH:mm')
                                .toString();
                            childBucket.push({
                                time: dividedTime,
                                status: 'no',
                            });
                        }
                    }
                    daysBucket.push({ date: start.format('YYYY[-]MM[-]DD'), time: childBucket });
                    start
                        .add(1, 'days')
                        .hour(Number(startTime.format('HH')))
                        .minute(Number(startTime.format('mm')));
                }
                resolve(daysBucket);
            });
            // console.log('time lists:', generateTimeList);

            responseJson(res, generateTimeList, method, 'success');
        } catch (error) {
            tryCatch(res, error);
        }
    },
];

const apiGet = [
    [businessAdminPermission.apply(this)],
    async (req: Request, res: Response) => {
        const method: RequestRole = req.method.toString() as any;
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            responseJson(res, errors.array(), method, 'invalid');
            return;
        }

        const service = new ServiceBusinessTime();
        const business = new Business();
        business.id = req.user.business.id;
        console.log('business:', business);
        const query = await service.get(business);

        responseJson(res, [query], method, 'success');
    },
];

export default {
    apiPost,
    apiGet,
};
