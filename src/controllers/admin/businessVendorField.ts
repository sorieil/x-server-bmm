import { BusinessVendorFieldChildNode } from './../../entity/mysql/entities/MysqlBusinessVendorFieldChildNode';
import { BusinessVendorFieldValue } from './../../entity/mysql/entities/MysqlBusinessVendorFieldValue';
import { Request, Response } from 'express';
import { RequestRole, responseJson, tryCatch } from '../../util/common';
import { check, validationResult, param } from 'express-validator';
import ServiceBusinessVendorField, {
  BusinessVendorFieldType,
} from '../../service/ServiceBusinessVendorField';
import { BusinessVendorField } from '../../entity/mysql/entities/MysqlBusinessVendorField';
import ServiceBusinessVendorInformationChildNode from '../../service/ServiceBusinessVendorFieldChildNode';
import { Business } from '../../entity/mysql/entities/MysqlBusiness';
import { Admin } from '../../entity/mysql/entities/MysqlAdmin';
import { ServiceBusinessPermission } from '../../service/ServiceBusinessPermission';
import ServiceBusinessVendorFieldChildNode from '../../service/ServiceBusinessVendorFieldChildNode';
import { Code } from '../../entity/mysql/entities/MysqlCode';
import { CheckPermissionBusinessAdmin } from '../../util/permission';
import ServiceBusinessVendor from '../../service/ServiceBusinessVendor';
import { BusinessVendor } from '../../entity/mysql/entities/MysqlBusinessVendor';

/**
 * @requires fieldId
 * @description
 * 필드의 아이디로 소유하고 있는 필드 인지 체크하고, 밴더의 필드의 정보를 리턴하고,
 * 비즈니스 정보도 같이 리턴한다.
 *
 * @target 관리자
 * @returns business, vendorField
 *
 */
const CheckPermissionBusinessVendor = () =>
  param('fieldId').custom(async (value, { req }) => {
    if (!value) {
      return Promise.reject('Invalid insert data.');
    }

    const service = new ServiceBusinessVendorField();
    const business = new Business();
    const admin = new Admin();
    const businessVendorField = new BusinessVendorField();
    admin.id = req.user.admins[0];

    businessVendorField.id = value;
    const r = await new Promise(async resolve => {
      const businessQuery = await new ServiceBusinessPermission()._getBusinessByAdmin(
        admin,
      );
      if (!businessQuery) {
        resolve(null);
      }

      business.id = businessQuery.id;
      const query = await service._getWithBusiness(
        businessVendorField,
        businessQuery,
      );
      resolve(query);
    });

    if (r) {
      Object.assign(req.user, { business: business, vendorField: r });
    } else {
      return Promise.reject(
        'You don`t have permission or first insert vendor fields..',
      );
    }
  });

/**
 * @requires fieldChildNodeId
 * @description
 * 커스텀 필드의 셀렉트 박스의 옵션의 아이디를 받아서 관리자가 권한이있는지 체크를 하고,
 * 데이터를 반환한다.
 *
 * @target 관리자
 * @returns business, filedChildNode
 *
 */
const CheckPermissionBusinessVendorChild = () =>
  param('fieldChildNodeId').custom(async (value, { req }) => {
    if (!value) {
      return Promise.reject('Invalid insert data.');
    }

    const service = new ServiceBusinessVendorField();
    const childService = new ServiceBusinessVendorFieldChildNode();
    const business = new Business();
    const admin = new Admin();
    const businessVendorFieldChildNode = new BusinessVendorFieldChildNode();
    const businessVendorField = new BusinessVendorField();

    admin.id = req.user.admins[0];
    businessVendorFieldChildNode.id = value;

    const r = await new Promise(async resolve => {
      const businessQuery = await new ServiceBusinessPermission()._getBusinessByAdmin(
        admin,
      );
      if (!businessQuery) {
        resolve(null);
      }

      business.id = businessQuery.id;
      const fieldQuery = await service.get(business);

      if (!fieldQuery) {
        resolve(null);
      }
      businessVendorField.id = fieldQuery[0].id;
      const vendorFieldChildNodeQuery = await childService.getByBusinessVendorField(
        businessVendorField,
        businessVendorFieldChildNode,
      );
      resolve(vendorFieldChildNodeQuery);
    });
    if (r === null) {
      return Promise.reject(
        'You don`t have permission or first insert business or vendor default data.',
      );
    }

    if (r) {
      Object.assign(req.user, { business: business, filedChildNode: r });
    } else {
      return Promise.reject(
        'You don`t have permission or first insert vendor child fields..',
      );
    }
  });
const apiInit = [
  [CheckPermissionBusinessAdmin.apply(this)],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      const method: RequestRole = req.method.toString() as any;

      if (!errors.isEmpty()) {
        responseJson(res, errors.array(), method, 'invalid');
        return;
      }

      const service = new ServiceBusinessVendorField();
      const serviceChild = new ServiceBusinessVendorInformationChildNode();

      const business = new Business();
      business.id = req.user.business.id;
      const informationType = new Code();

      const initFields: BusinessVendorFieldType[] = [
        { name: '기업명', require: 'yes', informationType: 4, fieldType: 1 },
        { name: '노출명', require: 'yes', informationType: 4, fieldType: 1 },
        { name: '대표명', require: 'no', informationType: 4, fieldType: 1 },
        { name: '설립일', require: 'no', informationType: 4, fieldType: 1 },
        { name: '업체구분', require: 'no', informationType: 5, fieldType: 3 },
        {
          name: '제품/서비스',
          require: 'no',
          informationType: 5,
          fieldType: 3,
        },
        { name: '관심분야', require: 'no', informationType: 5, fieldType: 1 },
        { name: '제품소개', require: 'no', informationType: 5, fieldType: 1 },
        { name: '담당자명', require: 'yes', informationType: 6, fieldType: 1 },
        { name: '연락처', require: 'yes', informationType: 6, fieldType: 1 },
        { name: '이메일', require: 'yes', informationType: 6, fieldType: 1 },
      ];

      // 중복 체크
      return await new Promise(async resolve => {
        const promiseBucket: any[] = [];
        initFields.forEach(element => {
          promiseBucket.push(service.checkDuplicate(element));
        });

        resolve(promiseBucket);
      }).then(async (process: object[]) => {
        const result = await Promise.all(process);
        const exists = result.filter(v => typeof v !== 'undefined');
        if (exists.length === initFields.length) {
          responseJson(
            res,
            [
              {
                message: 'Already exists',
              },
            ],
            method,
            'success',
          );
          return;
        } else {
          const insertData = await initFields.map(v => {
            const businessVendorField = new BusinessVendorField();
            const informationType = new Code();
            informationType.id = v.informationType;
            const fieldType = new Code();
            fieldType.id = v.fieldType;
            businessVendorField.name = v.name;
            businessVendorField.business = business;
            businessVendorField.require = 'yes';
            businessVendorField.informationType = informationType;
            businessVendorField.fieldType = fieldType;
            return businessVendorField;
          });
          const query = await service.postArray(insertData);
          responseJson(res, query, method, 'success');
        }
      });
    } catch (error) {
      tryCatch(res, error);
    }
  },
];
const apiPost = [
  [
    CheckPermissionBusinessAdmin.apply(this),
    check('name')
      .not()
      .isEmpty(),
    check('require', 'The input data can be "yes or no".')
      .optional()
      .isIn(['yes', 'no']),
    check('informationType')
      .not()
      .isEmpty(),
    check('fieldType')
      .not()
      .isEmpty(),
    check('fieldChildNodes')
      .optional()
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

      // 서비스로드
      const service = new ServiceBusinessVendorField();
      const serviceChild = new ServiceBusinessVendorInformationChildNode();
      const businessVendorField = new BusinessVendorField();
      const body = req.body;

      const business = new Business();
      business.id = req.user.business.id;

      console.log('business:', req.user.business.id);

      const informationType = new Code();
      informationType.id = body.informationType.id;
      const fieldType = new Code();
      fieldType.id = body.fieldType.id;

      businessVendorField.name = body.name;
      businessVendorField.business = business;
      businessVendorField.require = body.require; // id:number
      businessVendorField.informationType = informationType; // id:number
      businessVendorField.fieldType = fieldType;

      const query = await service.post(businessVendorField);
      let savedFieldChildNodes: BusinessVendorFieldChildNode[] = null;
      // 추가된 필드가 자식이 있는 경우 실행
      if (typeof body.fieldChildNodes !== 'undefined') {
        const paramChildNode: BusinessVendorFieldChildNode[] = body.fieldChildNodes.map(
          (v: BusinessVendorFieldChildNode) => {
            const schema = new BusinessVendorFieldChildNode();
            v.businessVendorField = query;
            return Object.assign(schema, v);
          },
        );

        if (paramChildNode.length > 0) {
          savedFieldChildNodes = await serviceChild.post(paramChildNode);
        }
      }

      // console.log('check box child :', savedFieldChildNodes[0].id);

      // 밴더가 추가 된 후에 모든 밴더들에게 필드를 추가해준다.

      // 추가된 필드를 추가할 밴더 리스트 가져오기
      const serviceBusinessVendor = new ServiceBusinessVendor();
      const vendors = await serviceBusinessVendor.gets(business);
      const fieldTypeQuery = await service._getWithBusiness(query, business);
      // console.log('vendors => ', vendors.length);
      const vendorBucket: BusinessVendorFieldValue[] = [];
      for (const vendor of vendors) {
        const businessVendorFieldValue = new BusinessVendorFieldValue();
        businessVendorFieldValue.businessVendorField = fieldTypeQuery;
        // console.log(
        //   'query.fieldType.columnType:',
        //   fieldTypeQuery.fieldType.columnType,
        // );
        if (fieldTypeQuery.fieldType.columnType === 'text') {
          businessVendorFieldValue.text = 'Input value';
        } else if (fieldTypeQuery.fieldType.columnType === 'textarea') {
          businessVendorFieldValue.textarea = 'Input value';
        } else {
          if (savedFieldChildNodes.length > 0) {
            businessVendorFieldValue.idx = savedFieldChildNodes[0];
          } else {
            businessVendorFieldValue.idx = null;
          }
        }
        // console.log('vendor:', vendor);
        businessVendorFieldValue.businessVendor = vendor;
        vendorBucket.push(businessVendorFieldValue);
      }

      await serviceBusinessVendor._postVendorFieldValue(vendorBucket);

      responseJson(res, [fieldTypeQuery], method, 'success');
    } catch (error) {
      tryCatch(res, error);
    }
  },
];

const apiPatch = [
  [
    CheckPermissionBusinessVendor.apply(this),
    // fieldId 는 퍼미션에서 체크 한다.
    check('fieldChildNodes')
      .optional()
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

      const service = new ServiceBusinessVendorField();
      const serviceChild = new ServiceBusinessVendorInformationChildNode();
      const businessVendorField = new BusinessVendorField();
      const body = req.body;
      const business = req.user.business;
      let savedFieldChildNodes: BusinessVendorFieldChildNode[] = null;

      // console.log('body:', body);

      businessVendorField.id = req.user.vendorField.id;
      businessVendorField.name = body.name;
      businessVendorField.require = body.require;
      businessVendorField.informationType = body.informationType;
      businessVendorField.fieldType = body.fieldType;
      const fieldTypeQuery = await service._getWithBusiness(
        businessVendorField,
        business,
      );

      console.log(
        `${req.user.vendorField.fieldType.id} === ${body.fieldType.id}`,
      );

      // console.log('fieldTypeQuery:', fieldTypeQuery, body);

      // select box를 선택한 경우
      if (typeof body.fieldChildNodes !== 'undefined') {
        if (body.fieldChildNodes.length > 0) {
          // 만약 자식이 줄어 들었다면, 업데이트에 포함이 되지 않은 자식 같은 경우는 삭제 해줘야 한다.
          // const deleteTargetQuery = await serviceChild.get(businessVendorField);
          // console.log('deleteTargetQuery:', deleteTargetQuery);
          // 아이디가 없는 경우는 새로운 입력이기 대문에 아이디를 넣어준다.
          const paramChildNode: BusinessVendorFieldChildNode[] = await body.fieldChildNodes.map(
            (v: BusinessVendorFieldChildNode) => {
              const schema = new BusinessVendorFieldChildNode();
              if (!v.hasOwnProperty('id')) {
                v.businessVendorField = businessVendorField;
              }
              delete v.createdAt;
              delete v.updatedAt;
              return Object.assign(schema, v);
            },
          );
          // console.log('paramChildNode:', paramChildNode);
          savedFieldChildNodes = await serviceChild.post(paramChildNode);
        }
      }

      // 새로 입력 하는 타입에서 business_vendor_field_id 값을 빼줘야 한다.
      const query = await service.post(businessVendorField);

      // 자식 노드들이 업데이트가 됐다면, 주입해준다.
      if (body.fieldChildNodes.length > 0) {
        Object.assign(query, {
          fieldChildNodes: await serviceChild.gets(businessVendorField),
        });
      }

      // 추가된 필드를 추가할 밴더 리스트 가져오기
      const serviceBusinessVendor = new ServiceBusinessVendor();
      const vendors = await serviceBusinessVendor.gets(business);
      // 일반에서 체크 박스로 변경된 경우 값을 초기화 해준다.

      if (fieldTypeQuery.fieldType.id !== 3 && body.fieldType.id === 3) {
        console.log('텍스트에서 변경 체크 박스로 변경');
        const vendorBucket: BusinessVendorFieldValue[] = [];

        // 생성된 밴더 별로 모두 추가 해준다.
        for (const vendor of vendors) {
          const businessVendorFieldValue = new BusinessVendorFieldValue();
          businessVendorFieldValue.businessVendorField = query;
          businessVendorFieldValue.idx = savedFieldChildNodes[0];
          businessVendorFieldValue.text = null;
          businessVendorFieldValue.textarea = null;
          businessVendorFieldValue.businessVendor = vendor;
          vendorBucket.push(businessVendorFieldValue);
        }

        await serviceBusinessVendor._postVendorFieldValue(vendorBucket);
      } else if (
        (body.fieldType.id === 1 || body.fieldType.id === 2) &&
        fieldTypeQuery.fieldType.id === 3
      ) {
        console.log('체크 박스에서 일반 텍스트로 변경');
        const vendorBucket: BusinessVendorFieldValue[] = [];
        for (const vendor of vendors) {
          const businessVendorFieldValue = new BusinessVendorFieldValue();
          businessVendorFieldValue.businessVendorField = query;
          businessVendorFieldValue.idx = null;
          businessVendorFieldValue.businessVendor = vendor;

          if (body.fieldType.columnType === 'text') {
            businessVendorFieldValue.text = 'Input value';
          } else if (body.fieldType.columnType === 'textarea') {
            businessVendorFieldValue.textarea = 'Input value';
          }
          vendorBucket.push(businessVendorFieldValue);
        }
        await serviceBusinessVendor._postVendorFieldValue(vendorBucket);
      }

      responseJson(res, [query], method, 'success');
    } catch (error) {
      tryCatch(res, error);
    }
  },
];

const apiGets = [
  [CheckPermissionBusinessAdmin.apply(this)],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      const method: RequestRole = req.method.toString() as any;

      if (!errors.isEmpty()) {
        responseJson(res, errors.array(), method, 'invalid');
        return;
      }

      const service = new ServiceBusinessVendorField();
      const business = new Business();
      business.id = req.user.business.id;

      const query = await service.get(business);

      await query.map((v: any) => {
        // console.log('-----------');
        // console.log(v);
        // console.log('-----------');
        delete v.createdAt;
        delete v.updatedAt;
        // v.informationType = v.informationType.id;
        // v.fieldType = v.fieldType.id;
        v.fieldChildNodes = v.businessVendorFieldChildNodes;
        delete v.businessVendorFieldChildNodes;
        return v;
      });

      if (query.length > 0) {
        const companyInformation = query.filter((v: any) => {
          return v.informationType.id === 4;
        });

        const informationType = query.filter((v: any) => {
          return v.informationType.id === 5;
        });

        const manager = query.filter((v: any) => {
          return v.informationType.id === 6;
        });

        responseJson(
          res,
          [
            {
              companyInformation: companyInformation,
              informationType: informationType,
              manager: manager,
            },
          ],
          method,
          'success',
        );
      } else {
        responseJson(res, [], method, 'success');
      }
    } catch (error) {
      tryCatch(res, error);
    }
  },
];

const apiGet = [
  [CheckPermissionBusinessVendor.apply(this)],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      const method: RequestRole = req.method.toString() as any;

      if (!errors.isEmpty()) {
        responseJson(res, errors.array(), method, 'invalid');
        return;
      }

      const query = req.user.vendorField;
      delete query.createdAt;
      delete query.updatedAt;

      query.fieldChildNodes = query.businessVendorFieldChildNode.map(
        (v: BusinessVendorFieldChildNode) => {
          delete v.createdAt;
          delete v.updatedAt;
          return v;
        },
      );

      // query.informationType = query.informationType.id;
      // query.fieldType = query.fieldType.id;

      responseJson(res, [query], method, 'success');
    } catch (error) {
      tryCatch(res, error);
    }
  },
];

const apiDeleteAll = [
  [CheckPermissionBusinessAdmin.apply(this)],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      const method: RequestRole = req.method.toString() as any;

      if (!errors.isEmpty()) {
        responseJson(res, errors.array(), method, 'invalid');
        return;
      }
      const service = new ServiceBusinessVendorField();
      const business = new Business();
      business.id = req.user.business.id;

      const informationQuery = await service.get(business);
      if (informationQuery) {
        const query = await service.deleteAll(business);
        // console.log('query:', query);
        responseJson(res, [query], method, 'delete');
      } else {
        responseJson(res, [], method, 'invalid');
      }
    } catch (error) {
      tryCatch(res, error);
    }
  },
];

const apiDelete = [
  [CheckPermissionBusinessVendor.apply(this)],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      const method: RequestRole = req.method.toString() as any;

      if (!errors.isEmpty()) {
        responseJson(res, errors.array(), method, 'invalid');
        return;
      }

      const service = new ServiceBusinessVendorField();
      const vendorInformation = new BusinessVendorField();
      vendorInformation.id = req.user.vendorField.id;
      const query = await service.delete(vendorInformation);
      responseJson(res, [query], method, 'delete');
    } catch (error) {
      tryCatch(res, error);
    }
  },
];

const apiDeleteChildNode = [
  [
    CheckPermissionBusinessVendor.apply(this),
    param('fieldChildNodeId')
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

    const service = new ServiceBusinessVendorFieldChildNode();
    const businessVendorFieldChildNode = new BusinessVendorFieldChildNode();
    const businessVendorField = new BusinessVendorField();
    const fieldChildNodeId = req.params.fieldChildNodeId;
    businessVendorField.id = req.user.vendorField.id;
    businessVendorFieldChildNode.id = fieldChildNodeId;
    const vendorFieldChildNodeQuery = await service.getByBusinessVendorField(
      businessVendorField,
      businessVendorFieldChildNode,
    );

    // console.log('vendorFieldChildNodeQuery:', vendorFieldChildNodeQuery);

    if (!vendorFieldChildNodeQuery) {
      responseJson(
        res,
        [
          {
            value: fieldChildNodeId,
            msg: 'You are not authorized or have no data..',
            param: 'fieldChildNodeId',
            location: 'params',
          },
        ],
        method,
        'success',
      );
      return;
    }

    businessVendorFieldChildNode.id = vendorFieldChildNodeQuery.id;
    const query = await service.delete(businessVendorFieldChildNode);

    responseJson(res, [query], method, 'delete');
  },
];

export default {
  apiPost,
  apiDelete,
  apiGet,
  apiGets,
  apiDeleteAll,
  apiPatch,
  apiDeleteChildNode,
  apiInit,
};
