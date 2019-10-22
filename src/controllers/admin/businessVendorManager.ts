import { BusinessVendorManager } from '../../entity/mysql/entities/MysqlBusinessVendorManager';
import { Request, Response } from 'express';
import { BusinessVendor } from '../../entity/mysql/entities/MysqlBusinessVendor';
import { responseJson, RequestRole, tryCatch } from '../../util/common';
import { Business } from '../../entity/mysql/entities/MysqlBusiness';
import { validationResult, param } from 'express-validator';
import { businessAdminPermission } from '../../util/permission';
import { Admin } from '../../entity/mysql/entities/MysqlAdmin';
import { ServiceBusinessPermission } from '../../service/ServiceBusinessPermission';
import { BusinessVendorField } from '../../entity/mysql/entities/MysqlBusinessVendorField';
import { Code } from '../../entity/mysql/entities/MysqlCode';
import ServiceBusinessVendor from '../../service/ServiceBusinessVendor';
import { BusinessVendorFieldManagerValue } from '../../entity/mysql/entities/MysqlBusinessVendorFieldManagerValue';
import ServiceBusinessVendorManager from '../../service/ServiceBusinessVendorManager';

// Post {{server}}/api/v1/business-vendor/{{vendorId}}/manager
// Patch {{server}}/api/v1/business-vendor/{{vendorId}}/manager/{{ManagerValueGroupIdx}}
// Delete {{server}}/api/v1/business-vendor/{{vendorId}}/manager/{{ManagerValueGroupIdx}}

const businessVendorFieldTypePermission = () =>
  param('informationType').custom(async (v, { req }) => {
    const service = new ServiceBusinessVendor();
    const code = new Code();
    code.id = v;
    const codeQuery = await service._getByCode(code);
    if (!codeQuery) {
      return Promise.reject(`Does not exist '${v}' informationType key.`);
    }
  });
const businessVendorPermission = () =>
  param('vendorId').custom((value, { req }) => {
    const businessVendor = new BusinessVendor();
    const service = new ServiceBusinessVendorManager();

    if (!value) {
      return Promise.reject('Invalid insert data.');
    }

    const admin = new Admin();
    admin.id = req.user.admins[0];

    businessVendor.id = value;
    return new Promise(async resolve => {
      // 접속관 관지자의 아이디로 비즈니스 아이디를 조회한다.
      const businessQuery = await new ServiceBusinessPermission()._ByAdmin(
        admin,
      );

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
        Object.assign(req.user, { vendor: result });
      } else {
        return Promise.reject('You are not authorized or have no data.');
      }
    });
  });

/**
 * 비즈니스의 상태 값을 가져온다. Header, status
 */
const apiGet = [
  [businessVendorPermission.apply(this)],
  async (req: Request, res: Response) => {
    try {
      const method: RequestRole = req.method.toString() as any;
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        responseJson(res, errors.array(), method, 'invalid');
        return;
      }
      const query = req.user.vendor; // 권한 체크에서 밴더의 아이디 기준으로 벤더의 정보를 모두 가져온다.

      delete query.createdAt;
      delete query.updatedAt;
      query.businessCode = query.businessCode.code;
      query.businessVendorFieldValues.map((j: any) => {
        delete j.createdAt;
        delete j.updatedAt;

        j.value = j.text || j.textarea || j.idx;

        delete j.text;
        delete j.textarea;
        delete j.idx;
        // j.businessVendorField.informationType = j.businessVendorField.informationType.id;
        // j.businessVendorField.fieldType = j.businessVendorField.fieldType.columnType;
        return j;
      });

      responseJson(res, [query], method, 'success');
    } catch (error) {
      tryCatch(res, error);
    }
  },
];

const apiGetField = [
  [
    businessAdminPermission.apply(this),
    param('informationTypeId')
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

      const service = new ServiceBusinessVendor();
      const business = new Business();
      const informationType = new Code();
      business.id = req.user.business.id;
      informationType.id = req.params.informationTypeId;
      const query = await service._getField(business, informationType);

      console.log('query:', query);

      const companyInformation = query.filter((v: any) => {
        return v.informationType.id === 4;
      });

      const vendorInformation = query.filter((v: any) => {
        return v.informationType.id === 5;
      });

      const manager = query.filter((v: any) => {
        return v.informationType.id === 6;
      });

      console.log('companyInformation:', companyInformation);
      responseJson(
        res,
        [
          {
            defaultInformation: companyInformation,
            vendorInformation: vendorInformation,
            manager: manager,
          },
        ],
        method,
        'success',
      );
    } catch (error) {
      tryCatch(res, error);
    }
  },
];

const apiGets = [
  [businessAdminPermission.apply(this)],
  async (req: Request, res: Response) => {
    try {
      const method: RequestRole = req.method.toString() as any;
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        responseJson(res, errors.array(), method, 'invalid');
        return;
      }

      const service = new ServiceBusinessVendor();
      const business = new Business();
      business.id = req.user.business.id;
      const query = await service._getByBusiness(business);

      // 매니저는 별도로 불러줘야 한다.
      query.map(async (v: any) => {
        delete v.createdAt;
        delete v.updatedAt;
        v.businessCode = v.businessCode.code;
        let duplicateFinderValue: any = null;
        let duplicateFinderIndex: number = null;
        await v.businessVendorFieldValues.map((j: any, index: number) => {
          // // 여기에서 만약에 fieldId의 값이 중복이 되면, 제일 처음 값에게 배열로 푸쉬를 해준다.
          // if (duplicateFinderValue === j.businessVendorField.id) {
          //     console.log('중복되는 값이다 ==== ', duplicateFinderValue, duplicateFinderIndex);
          //     v.businessVendorFieldValues[duplicateFinderIndex].value = [
          //         ...v.businessVendorFieldValues[duplicateFinderIndex].value,
          //     ].push(j.idx);
          //     j = null;
          //     return j;
          // }
          delete j.createdAt;
          delete j.updatedAt;

          j.value = j.text || j.textarea || j.idx;

          delete j.text;
          delete j.textarea;
          delete j.idx;

          // j.businessVendorField.informationType = j.businessVendorField.informationType.id;
          // j.businessVendorField.fieldType = j.businessVendorField.fieldType.columnType;

          // Run at the end process.
          duplicateFinderValue = j.businessVendorField.id;
          duplicateFinderIndex = index;
          // delete j.businessVendorField;
          return j;
        });
        return v;
      });

      responseJson(res, query, method, 'success');
    } catch (error) {
      tryCatch(res, error);
    }
  },
];

const apiGetInformationType = [
  [
    businessVendorPermission.apply(this),
    businessVendorFieldTypePermission.apply(this),
  ],
  async (req: Request, res: Response) => {
    try {
      const method: RequestRole = req.method.toString() as any;
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        responseJson(res, errors.array(), method, 'invalid');
        return;
      }

      const service = new ServiceBusinessVendor();
      const businessVendor = new BusinessVendor();
      const informationType = req.params.informationType;
      businessVendor.id = req.user.vendor.id;
      const query = await service._getByVendor(businessVendor);

      query.businessCode = query.businessCode.code as any;
      query.businessVendorFieldValues.filter((j: any) => {
        console.log('id:', j['Code']);
        return j.informationType.id === informationType;
      });

      responseJson(res, [query], method, 'success');
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
    businessAdminPermission.apply(this),
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

      for (let field in body) {
        const businessVendorFieldManagerValue = new BusinessVendorFieldManagerValue();
        const businessVendorField = new BusinessVendorField();
        businessVendorField.id = body[field].id; // field 아이

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
          businessVendorFieldManagerValue.text = body[field].value;
        } else if (fieldTypeQuery.fieldType.columnType === 'textarea') {
          businessVendorFieldManagerValue.textarea = body[field].value;
        } else {
          businessVendorFieldManagerValue.idx = Number(
            body[field].value,
          ) as any;
        }

        // 벤더의 아이디와, 필드의 아이디를 저장해준다.
        businessVendorFieldManagerValue.businessVendorField = businessVendorField; // 필드의 아아디 값 지정
        businessVendorFieldManagerValue.businessVendorManager = businessVendorManager;
        query.push(businessVendorFieldManagerValue);
      }

      await service._postVendorFieldManagerValue(query);
      const businessVendorQuery = await service.get(businessVendor);
      businessVendorQuery.businessCode = businessVendorQuery.businessCode
        .code as any;
      businessVendorQuery.businessVendorFieldValues.map((v: any) => {
        delete v.createdAt;
        delete v.updatedAt;
        v.value = v.text || v.textarea || v.idx;
        delete v.text;
        delete v.textarea;
        delete v.idx;
        v.businessVendorField.informationType =
          v.businessVendorField.informationType.id;
        v.businessVendorField.fieldType =
          v.businessVendorField.fieldType.columnType;
        // j.businessVendorField = j.businessVendorField.id;
        return v;
      });

      // 결과물이 group 아래 트리로 떨어져야 한다.

      responseJson(res, [businessVendorQuery], method, 'success');
    } catch (error) {
      tryCatch(res, error);
    }
  },
];

const apiPatch = [
  [
    businessVendorPermission.apply(this),
    param('groupId')
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
    const body: {
      id: number;
      businessVendorField: number;
      value: string;
    }[] = req.body.data;

    // 밴더 인증후 밴더 아이디 지정
    const vendor = req.user.vendor;
    businessVendor.id = vendor.id;

    const businessVendorManagerValueQuery: BusinessVendorFieldManagerValue[] = [];
    for (let i = 0; body.length > i; i++) {
      const businessVendorManagerValue = new BusinessVendorFieldManagerValue();
      businessVendorManagerValue.id = body[i].id;
      const businessVendorFieldManagerValueQuery = await service._getByVendorFieldManagerValue(
        businessVendorManagerValue,
      );
      const fieldType =
        businessVendorFieldManagerValueQuery.businessVendorField.fieldType;

      // 타입체크를 해서 타입에 따른 필드에 입력해준다.
      if (fieldType) {
        if (fieldType.columnType === 'text') {
          businessVendorFieldManagerValueQuery.text = body[i].value;
        } else if (fieldType.columnType === 'textarea') {
          businessVendorFieldManagerValueQuery.textarea = body[i].value;
        } else {
          businessVendorFieldManagerValueQuery.idx = Number(
            body[i].value,
          ) as any;
        }
      } else {
        responseJson(
          res,
          [{ message: `${body[i].businessVendorField} dose net exist.` }],
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
      const query = await service._postVendorFieldManagerValue(
        businessVendorManagerValueQuery,
      );
      query.map((v: any) => {
        delete v.businessVendor;
        v.value = v.text || v.textarea || v.idx;
        delete v.text;
        delete v.textarea;
        delete v.idx;
        v.businessVendorField.informationType =
          v.businessVendorField.informationType.id;
        v.businessVendorField.fieldType =
          v.businessVendorField.fieldType.columnType;
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
    businessVendorPermission.apply(this),
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
  apiGetField,
  apiGetInformationType,
};
