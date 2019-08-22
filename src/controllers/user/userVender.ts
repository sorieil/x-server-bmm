import { BusinessCode } from './../../entity/mysql/entities/MysqlBusinessCode';
import { BusinessVenderFieldType } from './../../service/ServiceBusinessVenderField';
import { BusinessVenderFavorite } from './../../entity/mysql/entities/MysqlBusinessVenderFavorite';
import { Login } from '../../entity/mysql/entities/MysqlLogin';
import { responseJson, RequestRole, tryCatch } from '../../util/common';
import { validationResult, param, check, body } from 'express-validator';
import { Request, Response } from 'express';
import { Business } from '../../entity/mysql/entities/MysqlBusiness';
import ServiceUserVender from '../../service/ServiceUserVender';
import { BusinessVender } from '../../entity/mysql/entities/MysqlBusinessVender';
import ServiceUserPermission from '../../service/ServiceUserPermission';

const userVenderPermission = () =>
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
            const query = await service._getWithBusinessVender(businessVender, business);
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
    [userVenderPermission.apply(this)],
    async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req);
            const method: RequestRole = req.method.toString() as any;

            if (!errors.isEmpty()) {
                responseJson(res, errors.array(), method, 'invalid');
                return;
            }

            const service = new ServiceUserVender();
            const businessVender = req.user.vender;
            const query = await service.get(businessVender);

            console.log('get query:', query);

            delete query.createdAt;
            delete query.updatedAt;
            query.businessVenderFieldValues.map((j: any) => {
                delete j.createdAt;
                delete j.updatedAt;
                j.value = j.text || j.textarea || j.idx;
                delete j.text;
                delete j.textarea;
                delete j.idx;

                return j;
            });

            responseJson(res, [query], method, 'success');
        } catch (error) {
            tryCatch(res, error);
        }
    },
];

const apiGets = [
    [
        check('filter')
            .optional()
            .isString(),
        check('keyword')
            .optional()
            .isString(),
    ],
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
            let filter: string = '';
            let keyword: string = '';
            if (req.query.filter) {
                filter = req.query.filter
                    .split(',')
                    .map((v: any) => Number(v))
                    .sort((a: number, b: number) => a - b)
                    .join();
            }

            if (req.query.keyword) keyword = req.query.keyword;
            business.id = req.user.business.id;
            const query = await service._getByBusiness(business, keyword, filter);
            query.map((v: any) => {
                delete v.createdAt;
                delete v.updatedAt;
                delete v.filter;
                v.keyword = '#' + v.keyword.replace(/,/gi, ' #');
                v.businessVender.businessVenderFieldValues.map((j: any) => {
                    if (j.businessVenderField.name === '기업명') {
                        v.companyName = j.text;
                    }

                    j.value = j.text || j.textarea || j.idx;

                    delete j.text;
                    delete j.textarea;
                    delete j.idx;
                    delete j.id;
                    delete j.createdAt;
                    delete j.updatedAt;
                    return j;
                });

                delete v.businessVender.business;

                // Favorite check
                const userCheck = v.businessVender.businessVenderFavorities.filter((u: any) => {
                    return u.user.id === req.user.id;
                });

                if (userCheck.length > 0 && userCheck) {
                    v.businessVenderFavorite = true;
                } else {
                    v.favorite = false;
                }
                delete v.businessVender.businessVenderFavorities;
                return v;
            });

            responseJson(res, query, method, 'success');
        } catch (error) {
            tryCatch(res, error);
        }
    },
];

const apiPostVerifyVenderCode = [
    [
        userVenderPermission.apply(this),
        body('venderCode').custom((value, { req }) => {
            const service = new ServiceUserVender();
            const businessVender = new BusinessVender();
            const businessCode = new BusinessCode();
            if (!value) return Promise.reject('Invalid insert data.');

            return new Promise(async resolve => {
                businessVender.id = req.params.venderId;
                businessCode.code = value;
                businessVender.businessCode = businessCode;
                const query = service.verityVenderCode(businessVender);
                resolve(query);
            }).then(r => {
                if (r) {
                    Object.assign(req.user, { vender: r });
                } else {
                    return Promise.reject('This is no venderId or invalid vender code.');
                }
            });
        }),
    ],
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
            query.businessVenderFieldValues.map((j: any) => {
                delete j.createdAt;
                delete j.updatedAt;
                j.value = j.text || j.textarea || j.idx;
                delete j.text;
                delete j.textarea;
                delete j.idx;

                return j;
            });

            responseJson(res, [query], method, 'success');
        } catch (error) {
            tryCatch(res, error);
        }
    },
];
export default { apiGet, apiGets, apiPostVerifyVenderCode };
