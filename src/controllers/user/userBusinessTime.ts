import { User } from './../../entity/mysql/entities/MysqlUser';
import { Business } from '../../entity/mysql/entities/MysqlBusiness';
import { Request, Response } from 'express';
import { RequestRole, responseJson, tryCatch } from '../../util/common';
import { validationResult, param } from 'express-validator';
import { userGetLoginData } from '../../util/permission';
import { ServiceBusinessTime } from '../../service/ServiceBusinessTime';
import moment = require('moment');
import ServiceUserBusinessTime from '../../service/ServiceUserBusinessTime';

const apiPost = [
    async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req);
            const method: RequestRole = req.method.toString() as any;

            if (!errors.isEmpty()) {
                responseJson(res, errors.array(), method, 'invalid');
                return;
            }

            responseJson(res, [], method, 'success');
        } catch (error) {
            tryCatch(res, error);
        }
    },
];

/**
 * 행사기간 동안 미팅이 가능한 시간과 인터벌 시간을 가져온다.
 */
const apiGets = [
    [userGetLoginData.apply(this)],
    async (req: Request, res: Response) => {
        const method: RequestRole = req.method.toString() as any;
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            responseJson(res, errors.array(), method, 'invalid');
            return;
        }

        const service = new ServiceBusinessTime();
        const business = new Business();
        business.id = req.user.business.id; // passport 에서 주입한다.
        const query = await service.get(business);
        console.log('Why did you print null?');
        responseJson(res, [query], method, 'success');
    },
];

/**
 * @description
 * 날짜 별로 타임 리스트를 가져온다.
 * @data 2019-01-02 식으로 데이터를 넣는다.
 */
const apiGet = [
    [
        userGetLoginData.apply(this),
        param('date').custom((value, { req }) => {
            const test = moment(value).format('YYYY/MM/DD');
            console.log('test result:', test);
            if (test === 'Invalid date') {
                return Promise.reject('Please input date format.');
            } else {
            }
        }),
    ],
    async (req: Request, res: Response) => {
        const method: RequestRole = req.method.toString() as any;
        const errors = validationResult(req);
        console.log('errors.isEmpty():', errors.isEmpty());
        if (!errors.isEmpty()) {
            responseJson(res, errors.array(), method, 'invalid');
            return;
        }
        const service = new ServiceUserBusinessTime();
        const user = new User();
        user.id = req.user.id;
        const userType = await service._getByUser(user);
        if (userType) {
            // 있으면, 바이어
        } else {
            // 만약 없다면, UserManager 에서 데이터를 가져와야 한다.
            // 등록이 안되어 있다면, 볼수가 없고, 바로 바이어인지/벤더 매니저인지 등록하는
            // 화면으로 이동해야 한다.
            // 그럼 이 화면은 passport 에서 결정되어야 할거 같은데...
        }

        //

        // 날짜와 타임 테이블의 아이디 값을 기준으로 타임 테이블의 상태를 보여준다.
        // 여기에서 중요한것은 타임테이블에는 미팅룸의 갯수만큼 예약을 할 수 있다.
        // 또한 여기에서 중요한것은 벤더 일경우 벤더의 타엠테이블이 보여야 하고,
        // 바이어인 경우 바이어의 개인의 스케쥴이 보여야 한다.

        const business = new Business();
        business.id = req.user.business.id;
        console.log('business:', business);
        // const query = await service.get(business);

        responseJson(res, [], method, 'success');
    },
];

export default {
    apiPost,
    apiGets,
    apiGet,
};
