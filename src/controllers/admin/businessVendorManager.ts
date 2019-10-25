import { BusinessVendorFieldManagerValue } from './../../entity/mysql/entities/MysqlBusinessVendorFieldManagerValue';
import { BusinessVendor } from './../../entity/mysql/entities/MysqlBusinessVendor';
import { BusinessVendorManager } from '../../entity/mysql/entities/MysqlBusinessVendorManager';
import { Request, Response } from 'express';
import { responseJson, RequestRole, tryCatch } from '../../util/common';
import { Business } from '../../entity/mysql/entities/MysqlBusiness';
import { validationResult, param } from 'express-validator';
import { CheckPermissionBusinessAdmin } from '../../util/permission';
import { Admin } from '../../entity/mysql/entities/MysqlAdmin';
import { ServiceBusinessPermission } from '../../service/ServiceBusinessPermission';
import { BusinessVendorField } from '../../entity/mysql/entities/MysqlBusinessVendorField';
import { Code } from '../../entity/mysql/entities/MysqlCode';
import ServiceBusinessVendor from '../../service/ServiceBusinessVendor';
import ServiceBusinessVendorManager from '../../service/ServiceBusinessVendorManager';

// Post {{server}}/api/v1/business-vendor/{{vendorId}}/manager
// Patch {{server}}/api/v1/business-vendor/{{vendorId}}/manager/{{ManagerValueGroupIdx}}
// Delete {{server}}/api/v1/business-vendor/{{vendorId}}/manager/{{ManagerValueGroupIdx}}

/**
 * @requires informationType
 * @description
 * 필드의 키 값이 디비에 있는지 체크
 * @target 관리자
 * @returns Promise.reject
 */
const CheckPermissionBusinessVendorFieldType = () =>
  param('informationType').custom(async (v, { req }) => {
    const service = new ServiceBusinessVendor();
    const code = new Code();
    code.id = v;
    const codeQuery = await service._getByCode(code);
    if (!codeQuery) {
      return Promise.reject(`Does not exist '${v}' informationType key.`);
    }
  });
/**
 * @requires vendorId
 * @description
 * 관리자 기준으로
 * BMM 관리자가 벤더를 소유 하고 있는지 체크를 한다.
 * @target 관리자
 * @returns vendor
 */
const CheckPermissionBusinessVendor = () =>
  param('vendorId').custom(async (value, { req }) => {
    const businessVendor = new BusinessVendor();
    const service = new ServiceBusinessVendor();

    if (!value) {
      return Promise.reject('Invalid insert data.');
    }

    const admin = new Admin();
    admin.id = req.user.admins[0];
    const businessQuery = await new ServiceBusinessPermission()._getBusinessByAdmin(
      admin,
    );
    businessVendor.id = value;
    return new Promise(async resolve => {
      // 접속관 관지자의 아이디로 비즈니스 아이디를 조회한다.

      // 소유한 비즈니스가 없다면, null
      if (!businessQuery) {
        resolve(null);
      }

      // 비즈니스 아이디와 입력한 밴더의 아이디를 가지고 조회
      const query = await service._getWithBusiness(
        businessVendor,
        businessQuery,
      );

      resolve(query);
    }).then(result => {
      if (result) {
        Object.assign(req.user, { vendor: result, business: businessQuery });
      } else {
        return Promise.reject('You are not authorized or have no data.');
      }
    });
  });

/**
 * 비즈니스의 상태 값을 가져온다. Header, status
 */
const apiGet = [
  [
    CheckPermissionBusinessVendor.apply(this),
    param('managerId')
      .not()
      .isEmpty(),
  ],
  async (req: Request, res: Response) => {
    try {
      const method: RequestRole = req.method.toString() as any;
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        responseJson(res, errors.array(), method, 'invalid');
        return;
      }
      const vendorId = req.params.managerId;
      const serviceBusinessVendorManager = new ServiceBusinessVendorManager();

      const businessVendorManager = new BusinessVendorManager();
      businessVendorManager.id = vendorId;

      const query = await serviceBusinessVendorManager._getBusinessVendorManagerByBusinessVendorManager(
        businessVendorManager,
      );

      query.businessVendorFieldManagerValues.map((j: any) => {
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
    CheckPermissionBusinessAdmin.apply(this),
    CheckPermissionBusinessVendor.apply(this),
  ],
  async (req: Request, res: Response) => {
    try {
      const method: RequestRole = req.method.toString() as any;
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        responseJson(res, errors.array(), method, 'invalid');
        return;
      }

      const service = new ServiceBusinessVendorManager();
      const businessVendor = new BusinessVendor();
      businessVendor.id = req.user.vendor.id;

      const query = await service._getBusinessVendorManagerByBusinessVendor(
        businessVendor,
      );

      // 매니저는 별도로 불러줘야 한다.
      query.map((v: any) => {
        delete v.createdAt;
        delete v.updatedAt;
        v.businessVendorFieldManagerValues.map((j: any) => {
          j.value = j.text || j.textarea || j.idx;
          delete j.text;
          delete j.textarea;
          delete j.idx;
          return j;
        });
        return v;
      });
      console.log('Business Vendor Manager Lists:', query);

      responseJson(res, query, method, 'success');
    } catch (error) {
      tryCatch(res, error);
    }
  },
];

/**
 * 밴더 값 입력 / 수정
 */
const apiPost = [
  [
    CheckPermissionBusinessAdmin.apply(this),
    param('vendorId')
      .not()
      .isEmpty(),
  ],
  async (req: Request, res: Response) => {
    try {
      const method: RequestRole = req.method.toString() as any;
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        responseJson(res, errors.array(), method, 'invalid');
        return;
      }

      const businessVendor = new BusinessVendor();
      const service = new ServiceBusinessVendorManager();
      const businessVendorManager = new BusinessVendorManager();
      const body = req.body.data;
      const vendorId = req.params.vendorId;

      businessVendor.id = vendorId;

      // 없다면 그룹을 등록 시켜주고, 있다면, 그룹을 조회 해서 그룹의 idx 를 가져온다.
      businessVendorManager.businessVendor = businessVendor;
      await service.post(businessVendorManager);

      const query: BusinessVendorFieldManagerValue[] = [];

      for (let field of body) {
        const businessVendorFieldManagerValue = new BusinessVendorFieldManagerValue();
        const businessVendorField = new BusinessVendorField();
        businessVendorField.id = field.id; // field 아이
        const fieldTypeQuery = await service.checkFieldType(
          businessVendorField,
        ); // 필드가 어떤 타입인지 체크

        // text textarea idx 로 조회 해서 구분해줘야 한다.
        // 필드 정보가 없으면, 잘못된 field id 값을 입력한 것이다.
        if (!fieldTypeQuery) {
          responseJson(
            res,
            [
              {
                message: `The parameter field id ${parseInt(
                  field,
                  10,
                )} of  does not exist.`,
              },
            ],
            method,
            'invalid',
          );
          return;
        }

        // 필드의 타입에 따라서 필드를 명시해준다.
        if (fieldTypeQuery.fieldType.columnType === 'text') {
          businessVendorFieldManagerValue.text = field.value;
        } else if (fieldTypeQuery.fieldType.columnType === 'textarea') {
          businessVendorFieldManagerValue.textarea = field.value;
        } else {
          businessVendorFieldManagerValue.idx = Number(field.value) as any;
        }

        // 벤더의 아이디와, 필드의 아이디를 저장해준다.
        businessVendorFieldManagerValue.businessVendorField = businessVendorField; // 필드의 아아디 값 지정
        businessVendorFieldManagerValue.businessVendorManager = businessVendorManager;
        query.push(businessVendorFieldManagerValue);
      }

      await service._postVendorFieldManagerValue(query);
      const businessVendorQuery = await service._getBusinessVendorManagerByBusinessVendor(
        businessVendor,
      );

      console.log('Post result: ', businessVendorQuery);

      businessVendorQuery.map((v: any) => {
        v.businessVendorFieldManagerValues.map(
          (j: BusinessVendorFieldManagerValue) => {
            v.value = j.text || j.textarea || j.idx;
            delete j.text;
            delete j.textarea;
            delete j.idx;
          },
        );

        delete v.createdAt;
        delete v.updatedAt;

        return v;
      });

      // 결과물이 group 아래 트리로 떨어져야 한다.

      responseJson(res, businessVendorQuery, method, 'success');
    } catch (error) {
      tryCatch(res, error);
    }
  },
];

const apiPatch = [
  [
    CheckPermissionBusinessVendor.apply(this),
    param('managerId')
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

    const serviceBusinessVendorManager = new ServiceBusinessVendorManager();
    const businessVendor = new BusinessVendor();
    const body: {
      id: number;
      businessVendorField: number;
      value: string;
    }[] = req.body.data;

    // 밴더 인증후 밴더 아이디 지정
    const vendor = req.user.vendor;
    businessVendor.id = vendor.id;

    const businessVendorManagerValueQuery: BusinessVendorFieldManagerValue[] = [];
    for (const item of body) {
      const businessVendorManagerValue = new BusinessVendorFieldManagerValue();
      console.log('field value id :', item.id);
      businessVendorManagerValue.id = item.id;
      const businessVendorFieldManagerValueQuery = await serviceBusinessVendorManager._getByVendorFieldManagerValue(
        businessVendorManagerValue,
      );
      const fieldType =
        businessVendorFieldManagerValueQuery.businessVendorField.fieldType;

      // TODO: 데이터가 비어 있는 경우 처리해줘야 한다.

      // 타입체크를 해서 타입에 따른 필드에 입력해준다.
      if (fieldType) {
        if (fieldType.columnType === 'text') {
          businessVendorFieldManagerValueQuery.text = item.value;
        } else if (fieldType.columnType === 'textarea') {
          businessVendorFieldManagerValueQuery.textarea = item.value;
        } else {
          businessVendorFieldManagerValueQuery.idx = Number(item.value) as any;
        }
      } else {
        responseJson(
          res,
          [{ message: `${item.businessVendorField} dose net exist.` }],
          method,
          'invalid',
        );
        return;
      }

      businessVendorManagerValueQuery.push(
        businessVendorFieldManagerValueQuery,
      );
    }

    // setTimeout에 0 초로 두면, setTimeout이 프로세스상 제일 마지막에 파싱되기 때문에 모든 스크립트가 파싱되고나서 실행된다.
    await setTimeout(async () => {
      const query = await serviceBusinessVendorManager._postVendorFieldManagerValue(
        businessVendorManagerValueQuery,
      );
      query.map((v: any) => {
        v.value = v.text || v.textarea || v.idx;
        delete v.text;
        delete v.textarea;
        delete v.idx;
        return v;
      });
      responseJson(res, query, method, 'success');
    }, 0);
  },
];

/**
 * 매니저 삭제
 */
const apiDelete = [
  [
    CheckPermissionBusinessVendor.apply(this),
    param('managerId')
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

    const service = new ServiceBusinessVendorManager();
    const businessVendor = new BusinessVendor();
    const businessVendorManager = new BusinessVendorManager();
    businessVendor.id = req.user.vendor.id;
    businessVendorManager.id = req.params.managerId;
    const query = await service.delete(businessVendor, businessVendorManager);

    responseJson(res, [query], method, 'delete');
  },
];

export default {
  apiGet,
  apiGets,
  apiPost,
  apiPatch,
  apiDelete,
};
