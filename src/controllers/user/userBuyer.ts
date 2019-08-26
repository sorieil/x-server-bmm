import { Request, Response } from 'express';
import { responseJson, RequestRole } from '../../util/common';
import { validationResult, body, param } from 'express-validator';
import ServiceUserBuyer from '../../service/ServiceUserBuyer';
import UserBuyer from '../../entity/mysql/entities/MysqlUserBuyer';
import ServiceUserBuyerPermission from '../../service/ServiceUserBuyerPermission';
// 여기서부터는 예약인데 buyer의 상세 정보가 있어야지만, 진행이 가능하기 때문에 체크 해야 한다.
const checkBuyerInformation = () =>
    param('userId').custom((value, { req }) => {
        const service = new ServiceUserBuyerPermission();
        const user = req.user;

        return new Promise(async resolve => {
            const query = await service._getByUser(user);
            resolve(query);
        }).then(r => {
            if (r) {
                Object.assign(req.user, { buyer: r });
            } else {
                return Promise.reject('Please enter buyer information first.');
            }
        });
    });
const apiGet = [
    [checkBuyerInformation.apply(this)],
    async (req: Request, res: Response) => {
        const method: RequestRole = req.method.toString() as any;
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            responseJson(res, errors.array(), method, 'invalid');
            return;
        }

        const query = req.user.buyer;

        responseJson(res, [query], method, 'success');
    },
];

const apiPost = [
    [
        body('name')
            .not()
            .isEmpty(),
        body('phone')
            .not()
            .isEmpty(),
        body('email')
            .not()
            .isEmpty()
            .isEmail(),
    ],
    async (req: Request, res: Response) => {
        const method: RequestRole = req.method.toString() as any;
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            responseJson(res, errors.array(), method, 'invalid');
            return;
        }

        const service = new ServiceUserBuyer();
        const servicePermission = new ServiceUserBuyerPermission();
        const userBuyer = new UserBuyer();
        const user = req.user;
        // 유저 아이디로 유저의 바이어 정보가 있다면, 불러와서 저장해준다.

        const userQuery = await servicePermission._getByUser(user);

        userBuyer.user = user;

        const query = await service.post(userBuyer);

        responseJson(res, [query], method, 'success');
    },
];

export default {
    apiGet,
    apiPost,
};
