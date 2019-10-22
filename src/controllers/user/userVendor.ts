import { BusinessCode } from '../../entity/mysql/entities/MysqlBusinessCode';
import { BusinessVendorFieldType } from './../../service/ServiceBusinessVendorField';
import { BusinessVendorFavorite } from '../../entity/mysql/entities/MysqlBusinessVendorFavorite';
import { Login } from '../../entity/mysql/entities/MysqlLogin';
import { responseJson, RequestRole, tryCatch } from '../../util/common';
import { validationResult, param, check, body } from 'express-validator';
import { Request, Response } from 'express';
import { Business } from '../../entity/mysql/entities/MysqlBusiness';
import ServiceUserVendor from '../../service/ServiceUserVendor';
import { BusinessVendor } from '../../entity/mysql/entities/MysqlBusinessVendor';
import ServiceUserPermission from '../../service/ServiceUserPermission';

import ServiceBusinessVendor from '../../service/ServiceBusinessVendor';
import ServiceBusinessCode from '../../service/ServiceBusinessCode';
import { BusinessVendorFieldValue } from '../../entity/mysql/entities/MysqlBusinessVendorFieldValue';
import { BusinessVendorField } from '../../entity/mysql/entities/MysqlBusinessVendorField';
import { BusinessVendorFieldChildNode } from '../../entity/mysql/entities/MysqlBusinessVendorFieldChildNode';

/**
 * @requires vendorId
 * @description
 * 벤더의 아이디로 유저가 밴더를 소유 했는지
 */
const CheckPermissionUserVendor = () =>
  param('vendorId').custom((value, { req }) => {
    const businessVendor = new BusinessVendor();
    const service = new ServiceUserPermission();
    const business = new Business();

    if (!value) {
      return Promise.reject('Invalid insert data.');
    }

    businessVendor.id = value;
    return new Promise(async resolve => {
      // 비즈니스 퍼미션과 다르게 유저는 비즈니스 아이디가 특정되어 있기 때문에,
      // 관리자 처럼 비즈니스 보유 여부를 체크 할 필요가 없다.
      // 로그인할때 이벤트 아이디로 req.user 에 담겨져 있다. (req.user.business)

      business.id = req.user.business.id;
      const query = await service._getWithBusinessVendor(
        businessVendor,
        business,
      );
      resolve(query);
    }).then(r => {
      if (r) {
        Object.assign(req.user, { vendor: r });
      } else {
        return Promise.reject('This is no vendor id.');
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
  [CheckPermissionUserVendor.apply(this)],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      const method: RequestRole = req.method.toString() as any;

      if (!errors.isEmpty()) {
        responseJson(res, errors.array(), method, 'invalid');
        return;
      }

      const service = new ServiceUserVendor();
      const businessVendor = req.user.vendor;
      const query = await service.get(businessVendor);

      // console.log('get query:', query);

      delete query.createdAt;
      delete query.updatedAt;
      query.businessVendorFieldValues.map((j: any) => {
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

      const service = new ServiceUserVendor();
      const business = new Business();
      let filter = '';
      let keyword = '';
      if (req.query.filter) {
        filter = req.query.filter
          .split(',')
          .map((v: any) => Number(v))
          .sort((a: number, b: number) => a - b)
          .join();
      }
      // 키워드가 있다면, keyword 변수에 선언해준다.
      if (req.query.keyword) keyword = req.query.keyword;
      business.id = req.user.business.id;
      const query = await service._getByBusiness(business, keyword, filter);
      query.map((v: any) => {
        delete v.createdAt;
        delete v.updatedAt;
        delete v.filter;
        v.keyword = '#' + v.keyword.replace(/,/gi, ' #');
        v.businessVendor.businessVendorFieldValues.map((j: any) => {
          if (j.businessVendorField.name === '기업명') {
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

        delete v.businessVendor.business;

        // Favorite check
        const userCheck = v.businessVendor.businessVendorFavorities.filter(
          (u: any) => {
            return u.user.id === req.user.id;
          },
        );

        if (userCheck.length > 0 && userCheck) {
          v.businessVendorFavorite = true;
        } else {
          v.businessVendorFavorite = false;
        }

        v.businessVendorMeeting = false;

        // 여기에 예약 관련 필드도 삽입
        delete v.businessVendor.businessVendorFavorities;
        return v;
      });

      responseJson(res, query, method, 'success');
    } catch (error) {
      tryCatch(res, error);
    }
  },
];

const apiPostVerifyVendorCode = [
  [
    CheckPermissionUserVendor.apply(this),
    body('vendorCode').custom((value, { req }) => {
      const service = new ServiceUserVendor();
      const businessVendor = new BusinessVendor();
      const businessCode = new BusinessCode();
      // console.log('vendor code: ', value);
      if (!value) return Promise.reject('Invalid insert data.');

      return new Promise(async resolve => {
        businessVendor.id = req.params.vendorId;
        businessCode.code = value;
        businessVendor.businessCode = businessCode;
        const query = service.verityVendorCode(businessVendor);
        resolve(query);
      }).then(r => {
        if (r) {
          Object.assign(req.user, { vendor: r });
        } else {
          return Promise.reject('This is no vendorId or invalid vendor code.');
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

      const query = req.user.vendor;

      delete query.createdAt;
      delete query.updatedAt;
      query.businessVendorFieldValues.map((j: any) => {
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

const apiPost = [
  [
    body('data')
      .not()
      .isEmpty()
      .isArray(),
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
      const service = new ServiceBusinessVendor();
      const serviceBusinessCode = new ServiceBusinessCode();
      const business = new Business();
      const body = req.body.data;

      console.log('===========================');
      console.log(body);

      // 사용하지 않는 코드를 가져온다.
      const businessCodeQuery = await new ServiceBusinessCode().getNotUseOneCode();
      if (!businessCodeQuery) {
        responseJson(
          res,
          [{ message: '사용가능한 코드가 없습니다.' }],
          method,
          'invalid',
        );
        return;
      }

      // 비즈니스 설정
      business.id = req.user.business.id;
      businessVendor.business = business;

      // 비즈니스 코드 저장
      businessVendor.businessCode = businessCodeQuery;

      // 밴더 기본정보 저장
      await service.post(businessVendor);

      // 비즈니스 코드 상태 변경
      businessCodeQuery.use = 'yes';
      businessCodeQuery.businessVendor = businessVendor;
      await serviceBusinessCode.post(businessCodeQuery);

      const query: BusinessVendorFieldValue[] = [];

      for (let field in body) {
        const businessVendorFieldValue = new BusinessVendorFieldValue();
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

        if (fieldTypeQuery.fieldType.columnType === 'text') {
          businessVendorFieldValue.text = body[field].value;
        } else if (fieldTypeQuery.fieldType.columnType === 'textarea') {
          businessVendorFieldValue.textarea = body[field].value;
        } else {
          businessVendorFieldValue.idx = Number(body[field].value) as any;
        }
        businessVendorFieldValue.businessVendorField = businessVendorField; // 필드의 아아디 값 지정
        businessVendorFieldValue.businessVendor = businessVendor;
        query.push(businessVendorFieldValue);
      }

      // 매니저는 별도로 저장한다.

      await service._postVendorFieldValue(query);
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

      responseJson(res, [businessVendorQuery], method, 'success');
    } catch (error) {
      tryCatch(res, error);
    }
  },
];

const apiPatch = [
  [
    CheckPermissionUserVendor.apply(this),
    body('data')
      .not()
      .isEmpty()
      .isArray(),
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
      // const businessVendor = new BusinessVendor();
      const body: {
        id: number;
        value: string;
      }[] = req.body.data;

      // console.log('body => \n', body);

      // 밴더 인증후 밴더 아이디 지정
      const vendor = req.user.vendor;
      // businessVendor.id = vendor.id;
      // console.log('vender id:', vendor.id);
      console.log('========= BODY ========== \n', body);

      const businessVendorValueBucket: BusinessVendorFieldValue[] = [];
      for (const item of body) {
        if (!item.value) {
          console.log('계속 value:', item.value);
          continue;
        }

        console.log('item id : ', item);

        const businessVendorValue = new BusinessVendorFieldValue();

        // 저장할 데이터 테이블과 맵핑
        businessVendorValue.id = item.id;
        businessVendorValue.businessVendor = vendor.id; // 미들웨어에서 가져옴

        // 기존 데이터 가져옴
        const businessVendorFieldValueQuery = await service._getByVendorFieldValue(
          businessVendorValue,
        );

        // 기존 데이터에서 필드 타입 가져옴
        const fieldType =
          businessVendorFieldValueQuery.businessVendorField.fieldType;

        // 옵데이트를 해야 하는데 만약 데이터가 없다면,, 추가 해줘야 한다.
        console.log(
          `================= FIELD TYPE: ${fieldType.columnType} => ${item.value} field id: ${businessVendorFieldValueQuery.businessVendorField.id} ================ \n `,
        );
        // 타입체크를 해서 타입에 따른 필드에 데이터를 세팅해준다.
        if (fieldType) {
          if (fieldType.columnType === 'text') {
            businessVendorFieldValueQuery.text = item.value;
          } else if (fieldType.columnType === 'textarea') {
            businessVendorFieldValueQuery.textarea = item.value;
          } else {
            // 값이 셀렉트 값인경우
            const businessVendorFieldChildNode = new BusinessVendorFieldChildNode();
            businessVendorFieldChildNode.id = Number(item.value);
            businessVendorFieldValueQuery.idx = businessVendorFieldChildNode;
          }
        } else {
          // 조회를 했는데 데이터가 없는 경우 오류 출력
          responseJson(
            res,
            [{ message: `${item.id} dose not exist.` }],
            method,
            'invalid',
          );
          return;
        }
        //
        businessVendorValueBucket.push(businessVendorFieldValueQuery);
      }

      // setTimeout에 0 초로 두면, setTimeout이 프로세스상 제일 마지막에 파싱되기 때문에 모든 스크립트가 파싱되고나서 실행된다.
      setTimeout(async () => {
        // 배열로 저장한다.
        const query = await service._postVendorFieldValue(
          businessVendorValueBucket,
        );
        query.map((v: any) => {
          delete v.businessVendor;
          v.value = v.text || v.textarea || v.idx;
          delete v.text;
          delete v.textarea;
          delete v.idx;
          return v;
        });
        responseJson(res, query, method, 'success');
      }, 0);
    } catch (error) {
      tryCatch(res, error);
    }
  },
];
export default { apiGet, apiGets, apiPostVerifyVendorCode, apiPost, apiPatch };
