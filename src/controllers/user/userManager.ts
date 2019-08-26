import { Request, Response } from 'express';
import { responseJson, RequestRole } from '../../util/common';
import { validationResult, body } from 'express-validator';
import ServiceUserVender from '../../service/ServiceUserVender';
import { BusinessVender } from '../../entity/mysql/entities/MysqlBusinessVender';
import { BusinessCode } from '../../entity/mysql/entities/MysqlBusinessCode';
import ServiceUserManager from '../../service/ServiceUserManager';

const apiGet = [
    [
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
        const method: RequestRole = req.method.toString() as any;
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            responseJson(res, errors.array(), method, 'invalid');
            return;
        }
        const name = req.body.name;

        const service = new ServiceUserManager();
        const businessVender = new BusinessVender();
        businessVender.id = req.user.vender.id;
        const query = await service._getByNameWithVender(name, businessVender);

        // 입력으로(post) 나온 값중에서 담당자의 항목을 유지해서 데이터를 뽑아줘야 함.
        // 수정시(patch)에는 value 의 id 값 기준으로 수정을 해주면되고,
        // 읽기(get)는 userManager 의 값을 기준으로 데이터를 불러오면된다.

        //TODO: 여기에서 여러개의 담당자의 커스텀 필드가 나오는데, 이걸 각각의 담당자로 구분해줘야 한다.
        // 담당자의 필드를 조회 해서 임시 버킷을 만들고 버킷에 맞는 항목이 찰때마다 해당 raw 의 데이터를
        // 삭제 하는 방식으로 한다. 모든 항목이 다 매칭이되서 raw 가 없다면, 프로세스 종료를 하면된다.

        responseJson(res, [query], method, 'success');
    },
];

export default {
    apiGet,
};
