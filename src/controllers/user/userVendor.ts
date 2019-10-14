import { BusinessCode } from '../../entity/mysql/entities/MysqlBusinessCode';
import { BusinessVendorFieldType } from './../../service/ServiceBusinessVendorField';
import { BusinessVendorFavorite } from '../../entity/mysql/entities/MysqlbusinessVendorFavorite';
import { Login } from '../../entity/mysql/entities/MysqlLogin';
import { responseJson, RequestRole, tryCatch } from '../../util/common';
import { validationResult, param, check, body } from 'express-validator';
import { Request, Response } from 'express';
import { Business } from '../../entity/mysql/entities/MysqlBusiness';
import ServiceUserVendor from '../../service/ServiceUserVendor';
import { BusinessVendor } from '../../entity/mysql/entities/MysqlbusinessVendor';
import ServiceUserPermission from '../../service/ServiceUserPermission';

const userVendorPermission = () =>
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
  [userVendorPermission.apply(this)],
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

      console.log('get query:', query);

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
          v.favorite = false;
        }
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
    userVendorPermission.apply(this),
    body('vendorCode').custom((value, { req }) => {
      const service = new ServiceUserVendor();
      const businessVendor = new BusinessVendor();
      const businessCode = new BusinessCode();
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
export default { apiGet, apiGets, apiPostVerifyVendorCode };
