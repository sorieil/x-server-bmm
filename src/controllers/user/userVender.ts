import { Login } from '../../entity/mysql/entities/MysqlLogin';
import { responseJson, RequestRole, tryCatch } from '../../util/common';
import { validationResult, param } from 'express-validator';
import { Request, Response } from 'express';
import { Business } from '../../entity/mysql/entities/MysqlBusiness';
import ServiceUserVender from '../../service/ServiceUserVender';
import { BusinessVender } from '../../entity/mysql/entities/MysqlBusinessVender';
import ServiceUserPermission from '../../service/ServiceUserPermission';

const businessVenderPermission = () =>
    param('venderId').custom((value, { req }) => {
        const businessVender = new BusinessVender();
        const service = new ServiceUserPermission();
        const business = new Business();

        if (!value) {
            return Promise.reject('Invalid insert data.');
        }

        businessVender.id = value;
        return new Promise(async resolve => {
            // 비즈니스 퍼미션과 다르게 유저는 비즈니스 아이디가 특정되어 있기 때문에,
            // 관리자 처럼 비즈니스 보유 여부를 체크 할 필요가 없다.
            // 로그인할때 이벤트 아이디로 req.user 에 담겨져 있다. (req.user.business)

            business.id = req.user.business.id;
            const query = await service._getWithBusiness(businessVender, business);
            resolve(query);
        }).then(r => {
            if (r) {
                Object.assign(req.user, { vender: r });
            } else {
                return Promise.reject('This is no vender id.');
            }
        });
    });

/**
 *
 * 벤더의 아이디로 정보를 가져온다.
 * @method Get
 * @param businessId business.id
 *
 */
const apiGet = [
    [businessVenderPermission.apply(this)],
    async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req);
            const method: RequestRole = req.method.toString() as any;

            if (!errors.isEmpty()) {
                responseJson(res, errors.array(), method, 'invalid');
                return;
            }
            const query = req.user.vender;

            delete query.createdAt;
            delete query.updatedAt;
            query.businessCode = query.businessCode.code;
            query.businessVenderFieldValues.map((j: any) => {
                delete j.createdAt;
                delete j.updatedAt;
                j.value = j.text || j.textarea || j.idx;
                delete j.text;
                delete j.textarea;
                delete j.idx;
                // j.businessVenderField = j.businessVenderField.id;
                return j;
            });

            responseJson(res, [query], method, 'success');
        } catch (error) {
            tryCatch(res, error);
        }
    },
];

const apiGets = [
    async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req);
            const method: RequestRole = req.method.toString() as any;

            if (!errors.isEmpty()) {
                responseJson(res, errors.array(), method, 'invalid');
                return;
            }

            const service = new ServiceUserVender();
            const business = new Business();
            business.id = req.user.business.id;
            const query = await service._getByBusiness(business);
            // query.map((v: any) => {
            //     v.businessVenderFieldValues.map((j: any) => {
            //         j.value = j.text || j.textarea || j.idx;
            //         delete j.text;
            //         delete j.textarea;
            //         delete j.idx;
            //         return j;
            //     });
            //     return v;
            // });

            responseJson(res, query, method, 'success');
        } catch (error) {
            tryCatch(res, error);
        }
    },
];

export default { apiGet, apiGets };
