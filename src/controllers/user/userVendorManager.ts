import { User } from '../../entity/mysql/entities/MysqlUser';
import {
  CheckPermissionBusienssVendorManagerForUser,
  CheckPermissionBusinessVendorForUser,
} from './../../util/permission';
import { BusinessVendorManager } from './../../entity/mysql/entities/MysqlBusinessVendorManager';
import { Request, Response } from 'express';
import { responseJson, RequestRole, tryCatch } from '../../util/common';
import { validationResult, param } from 'express-validator';
import { BusinessVendor } from '../../entity/mysql/entities/MysqlBusinessVendor';
import ServiceBusinessVendorManager from '../../service/ServiceBusinessVendorManager';
import { BusinessVendorFieldManagerValue } from '../../entity/mysql/entities/MysqlBusinessVendorFieldManagerValue';
import { BusinessVendorField } from '../../entity/mysql/entities/MysqlBusinessVendorField';
import ServiceUser from '../../service/ServiceUser';

const apiGet = [
  [CheckPermissionBusienssVendorManagerForUser.apply(this)],
  async (req: Request, res: Response) => {
    try {
      const method: RequestRole = req.method.toString() as any;
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        responseJson(res, errors.array(), method, 'invalid');
        return;
      }

      const businessVendorManager = new BusinessVendorManager();
      businessVendorManager.id = req.user.users[0].businessVendorManager.id;

      const serviceUser = new ServiceUser();
      const query = await serviceUser._getBusinessVendorManager(
        businessVendorManager,
      );

      query.businessVendorFieldManagerValues.map((v: any) => {
        const fieldType = v.businessVendorField.fieldType.columnType;
        if (fieldType === 'idx') {
          v.value = v[fieldType].id || null;
        } else {
          v.value = v[fieldType] || null;
        }
        delete v.text;
        delete v.textarea;
        delete v.idx;
        return v;
      });

      query.businessVendor.businessVendorFieldValues.map((v: any) => {
        console.log(v);
        const fieldType = v.businessVendorField.fieldType.columnType;
        if (fieldType === 'idx') {
          v.value = v[fieldType] || null;
        } else {
          v.value = v[fieldType] || null;
        }

        delete v.text;
        delete v.textarea;
        delete v.idx;
        return v;
      });

      responseJson(res, [query], method, 'success');
    } catch (error) {
      tryCatch(res, error);
    }
  },
];

const apiPost = [
  [CheckPermissionBusinessVendorForUser.apply(this)],
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
        businessVendorField.id = field.id; // field 아이디
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

      businessVendorQuery.map((v: any) => {
        v.businessVendorFieldManagerValues.map((j: any) => {
          const fieldType = j.businessVendorField.fieldType.columnType;
          if (fieldType === 'idx') {
            v.value = j[fieldType].id || null;
          } else {
            v.value = j[fieldType] || null;
          }
          delete j.text;
          delete j.textarea;
          delete j.idx;
        });

        delete v.createdAt;
        delete v.updatedAt;

        return v;
      });

      // 유저의 타입을 변경해준다.
      // BusinessVendorManager 도 입력해준다.
      const user = new User();
      user.id = req.user.users[0].id;
      user.businessVendorManager = businessVendorQuery[0];
      await service._changeUserTypeManager(user);

      responseJson(res, businessVendorQuery, method, 'success');
    } catch (error) {
      tryCatch(res, error);
    }
  },
];

// TODO: 변경하려고 하는 밴더 매니저의 정보에 권한이 있는지 체크 해야 한다.
// 밑에 vendorManagerId는 그때 사용하면된다. 지우지마세용~
const apiPatch = [
  [
    param('vendorManagerId')
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
    // const businessVendor = new BusinessVendor();
    const body: {
      id: number;
      value: string;
    }[] = req.body.data;

    // 밴더 인증후 밴더 아이디 지정
    // const vendor = req.user.vendor;
    // console.log('vendor::', vendor);
    // businessVendor.id = vendor.id;

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
          [{ message: `${item.id} dose net exist.` }],
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
        const fieldType = v.businessVendorField.fieldType.columnType;
        if (fieldType === 'idx') {
          v.value = v[fieldType].id || null;
        } else {
          v.value = v[fieldType] || null;
        }
        delete v.text;
        delete v.textarea;
        delete v.idx;
        return v;
      });
      responseJson(res, query, method, 'success');
    }, 0);
  },
];

export default {
  apiGet,
  apiPost,
  apiPatch,
};
