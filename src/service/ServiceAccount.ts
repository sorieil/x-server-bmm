import { TokenLevelRole } from './ServiceAccount';
import { AdminLogin } from './../entity/mysql/entities/MysqlAdminLogin';
import { Admins } from './../entity/mongodb/entities/MongoAdmin';
import { MongoBridge } from '../entity/mysql/entities/MysqlMongoBridge';
import { connectionMysql, connectionMongoDB } from './../util/db';
import { getMongoManager, getManager } from 'typeorm';
import { Accounts } from '../entity/mongodb/entities/MongoAccounts';
import { BaseService } from './BaseService';
import * as jwt from 'jsonwebtoken';
import { secretNameType } from '../util/passport';
import { User } from '../entity/mysql/entities/MysqlUser';
import { Login } from '../entity/mysql/entities/MysqlLogin';
import { Admin } from '../entity/mysql/entities/MysqlAdmin';
import logger from '../util/logger';

/**
 * TODO 당분간은 디비 마이그레이션을 하기 위해서 매번 API 요청할때마다 몽고디비에 최신 디비를
 * TODO Mysql으로 점진적으로 이관을 및 업데이트를 실시한다.
 */

export type TokenLevelRole = 'admin' | 'user';
export default class ServiceAccount extends BaseService {
  constructor() {
    super();
  }

  public async getUserId(id: any) {
    const mongoQuery = await this.mongoManager(Accounts).findOne(id);
    const user = new User();
    const login = new Login();
    const mongoBridge = new MongoBridge();
    await this.queryRunner.connect();
    await this.queryRunner.startTransaction();
    let bridgeQuery = await this.queryRunner.manager.findOne(MongoBridge, {
      where: { mongodbID: `${mongoQuery.id.toString()}` },
      relations: ['login'],
    });

    if (bridgeQuery) {
      // console.log('User 업데이트');
      mongoBridge.id = bridgeQuery.id;
      login.id = bridgeQuery.login.id;
      const userQuery = await this.queryRunner.manager.findOne(User, {
        where: {
          login: bridgeQuery.login,
        },
        relations: ['userBuyer', 'businessVendorManager'],
      });
      Object.assign(user, userQuery);

      // const loginQuery = mysqlManager
      //     .getRepository(Login)
      //     .find({ where: { id: bridge.login.id, relations: ['user', 'user.permission', 'user.event'] } });
    } else {
      console.log('User 추가 됐습니다.', bridgeQuery);
    }

    // 퍼미션 정리
    // const permissionSave = query.permission.reduce((acc: Array<UserPermission>, cur: Permission): Array<
    //     UserPermission
    // > => {
    //     const permission = new UserPermission();
    //     permission.permissionName = cur.permissionName;
    //     permission.isChecked = cur.isChecked;
    //     acc.push(permission);
    //     return acc;
    // }, []);

    // // 이벤트 정리
    // const eventSave = query.eventList.reduce((acc: Array<UserEvent>, cur: EventList): Array<UserEvent> => {
    //     const event = new UserEvent();
    //     event.eventId = cur.eventId.toString();
    //     event.isPushOn = cur.isPushOn;
    //     event.name = cur.name;
    //     event.pushToken = cur.pushToken;
    //     event.mobileType = cur.mobileType;
    //     event.point = cur.point;
    //     event.createdAt = cur.joinDt;
    //     acc.push(event);
    //     return acc;
    // }, []);

    // 유저 정리
    try {
      user.isInactive = mongoQuery.isInactive ? 'yes' : 'no';
      user.isWithdrawal = mongoQuery.isWithdrawal ? 'yes' : 'no';
      user.createdAt = mongoQuery.createDt;
      user.profileImg = mongoQuery.profiles.profileImg;

      // TODO: 바이어인지 매니저인지 설정해준다. 하지만 추후 매니저의 인증 방법이 달라 진다면,
      // TODO: 웹에서 매니저를 인증하는 방식으로하고, 모바일에서는 모두 바이어로 설정 될 가능성도 있다.
      // TODO: 추후 변경될 수 있다. user.type은 변경될거 같지 않음. ㅎㅎ
      if (user.type === null) {
        if (user.userBuyer) {
          user.type = 'buyer';
          // console.log('buyer');
        } else if (user.businessVendorManager) {
          // console.log('manager');
          user.type = 'manager';
        }
      }
      // user.permission = permissionSave;
      // user.event = eventSave;

      await this.queryRunner.manager.save(user);

      // 로그인 정리
      login.emailVerified = mongoQuery.emailVerified ? 'yes' : 'no';
      login.email = mongoQuery.email ? mongoQuery.email : null;
      login.password = mongoQuery.password;
      login.createdAt = mongoQuery.createDt;
      login.users = [user];

      await this.queryRunner.manager.save(login);

      mongoBridge.login = login;
      mongoBridge.mongodbID = mongoQuery.id.toString();
      await this.queryRunner.manager.save(mongoBridge);

      // commit transaction now:
      await this.queryRunner.commitTransaction();
    } catch (err) {
      // since we have errors lets rollback changes we made
      logger.error('Transaction error: ', err);
      console.error('유저 회원정보 트랜젝션 에러');
      await this.queryRunner.rollbackTransaction();
      return err;
    } finally {
      // you need to release query runner which is manually created:
      await this.queryRunner.release();
      return login;
    }
  }

  public async getAdminId(id: any) {
    const mongoQuery = await this.mongoManager(Admins).findOne(id);
    const admin = new Admin();
    const adminLogin = new AdminLogin();
    const mongoBridge = new MongoBridge();
    await this.queryRunner.connect();
    await this.queryRunner.startTransaction();
    const bridgeQuery = await this.queryRunner.manager.findOne(MongoBridge, {
      where: { mongodbID: `${mongoQuery._id.toString()}` },
      relations: ['adminLogin'],
    });

    if (bridgeQuery) {
      // console.log('업데이트');
      mongoBridge.id = bridgeQuery.id;
      adminLogin.id = bridgeQuery.adminLogin.id;
      const adminQuery = await this.queryRunner.manager.findOne(Admin, {
        where: {
          adminLogin: bridgeQuery.adminLogin,
        },
      });
      Object.assign(admin, adminQuery);
    } else {
      // console.log('추가', bridgeQuery);
    }

    try {
      // execute some operations on this transaction:

      admin.name = mongoQuery.name || 'anonymous';
      admin.phone = mongoQuery.phone;

      await this.queryRunner.manager.save(admin);

      adminLogin.email = mongoQuery.id;
      adminLogin.emailVerified = mongoQuery.verified ? 'yes' : 'no';
      adminLogin.password = mongoQuery.password;
      adminLogin.admins = [admin];

      await this.queryRunner.manager.save(adminLogin);

      mongoBridge.adminLogin = adminLogin;
      mongoBridge.mongodbID = mongoQuery._id.toString();
      await this.queryRunner.manager.save(mongoBridge);

      // commit transaction now:
      await this.queryRunner.commitTransaction();
    } catch (err) {
      // since we have errors lets rollback changes we made
      logger.error('Transaction error: ', err);
      console.error('관리자 회원정보 트랜젝션 에러');
      await this.queryRunner.rollbackTransaction();
      return err;
    } finally {
      // you need to release query runner which is manually created:
      await this.queryRunner.release();
      return adminLogin;
    }

    // 로그인을 하게 되면 무조건 Mysql 에 동기화를 시킨다.
    // return await this.mysqlConnection
    //   .transaction(async transactionalEntityManager => {
    //     return mongoQuery.then(async query => {

    //     });
    //   })
    //   .catch(e => {
    //     logger.error('passport token verity error:', e);
    //     return e;
    //   });
  }

  /**
   * generateToken
   */

  public async generateToken(secretKey: secretNameType) {
    const query = await getMongoManager(connectionMongoDB)
      .getMongoRepository(Admins)
      .findOne({
        order: {
          _id: 'DESC',
        },
      });
    const token = jwt.sign(
      {
        _id: query._id,
        id: query.id,
        name: query.name,
        level: 'admin',
      },
      secretKey,
      { algorithm: 'HS256', expiresIn: 99999999 },
    );
    return {
      token: 'JWT ' + token,
      id: query._id,
      name: query.name,
      level: 'admin',
    };
  }

  public async generateUserToken(secretKey: secretNameType) {
    const query: any = await getMongoManager(connectionMongoDB)
      .getMongoRepository(Accounts)
      .findOne({
        order: {
          id: 'DESC',
        },
      });
    const token = jwt.sign(
      {
        id: query.id,
        name: query.name,
        level: 'user',
        eventId: query.eventList[0],
      },
      secretKey,
      { expiresIn: 99999999 },
    );
    return {
      token: 'JWT ' + token,
      id: query._id,
      name: query.name,
      level: 'eUser',
    };
  }
}
