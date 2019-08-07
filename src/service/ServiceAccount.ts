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
        const mongoManager = await getMongoManager(connectionMongoDB);
        const mysqlManager = await getManager(connectionMysql);
        const mongoQuery = mongoManager.getMongoRepository(Accounts).findOne(id);
        // 로그인을 하게 되면 무조건 Mysql 에 동기화를 시킨다.

        return mongoQuery
            .then(async query => {
                const user = new User();
                const login = new Login();
                const mongoBridge = new MongoBridge();

                // 몽고 디비
                let bridge: MongoBridge = await mysqlManager
                    .getRepository(MongoBridge)
                    .findOne({ where: { mongodbID: `${query.id.toString()}` }, relations: ['login'] });
                if (bridge) {
                    mongoBridge.id = bridge.id;
                    if (bridge.login) {
                        login.id = bridge.login.id;
                        const userQuery = await this.mysqlManager(User).findOne({
                            where: {
                                login: bridge.login,
                            },
                        });
                        user.id = userQuery.id;
                    }

                    // const loginQuery = mysqlManager
                    //     .getRepository(Login)
                    //     .find({ where: { id: bridge.login.id, relations: ['user', 'user.permission', 'user.event'] } });
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

                user.isInactive = query.isInactive ? 'yes' : 'no';
                user.isWithdrawal = query.isWithdrawal ? 'yes' : 'no';
                user.createdAt = query.createDt;
                user.profileImg = query.profiles.profileImg;
                // user.permission = permissionSave;
                // user.event = eventSave;
                return await this.mysqlConnection.transaction(async transactionalEntityManager => {
                    await transactionalEntityManager.save(user);

                    // 로그인 정리
                    login.emailVerified = query.emailVerified ? 'yes' : 'no';
                    login.email = query.email ? query.email : null;
                    login.password = query.password;
                    login.createdAt = query.createDt;
                    login.users = [user];
                    login.mongoBridge = bridge;

                    await transactionalEntityManager.save(login);

                    mongoBridge.mongodbID = query.id.toString();
                    mongoBridge.login = login;

                    transactionalEntityManager.save(mongoBridge);
                    // console.log('login --------- \n', login);
                    return login;
                });
            })
            .catch(e => {
                logger.error('passport token verity error:', e);
                return e;
            });
    }

    public async getAdminId(id: any) {
        // const mongoManager = await getMongoManager(connectionMongoDB);
        const mysqlManager = await getManager(connectionMysql);
        const mongoQuery = this.mongoManager(Admins).findOne(id);
        // 로그인을 하게 되면 무조건 Mysql 에 동기화를 시킨다.
        return mongoQuery
            .then(async query => {
                const admin = new Admin();
                const adminLogin = new AdminLogin();
                const mongoBridge = new MongoBridge();
                const bridgeQuery = await this.mysqlManager(MongoBridge).findOne({
                    where: { mongodbID: `${query._id.toString()}` },
                    relations: ['adminLogin'],
                });

                if (bridgeQuery) {
                    mongoBridge.id = bridgeQuery.id;
                    if (bridgeQuery.adminLogin) {
                        adminLogin.id = bridgeQuery.adminLogin.id;

                        const adminQuery = await this.mysqlManager(Admin).findOne({
                            where: {
                                adminLogin: bridgeQuery.adminLogin,
                            },
                        });
                        admin.id = adminQuery.id;
                    }
                }

                admin.name = query.name || 'anonymous';
                admin.phone = query.phone;

                return await this.mysqlConnection.transaction(async transactionalEntityManager => {
                    await transactionalEntityManager.save(admin);

                    adminLogin.email = query.id;
                    adminLogin.emailVerified = query.verified ? 'yes' : 'no';
                    adminLogin.password = query.password;
                    adminLogin.admins = [admin];

                    await transactionalEntityManager.save(adminLogin);

                    mongoBridge.adminLogin = adminLogin;
                    mongoBridge.mongodbID = query._id.toString();
                    await transactionalEntityManager.save(mongoBridge);
                    // console.log('login --------- \n', adminLogin);
                    return adminLogin;
                });
            })
            .catch(e => {
                logger.error('passport token verity error:', e);
                return e;
            });
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
        return { token: 'JWT ' + token, id: query._id, name: query.name, level: 'admin' };
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
        return { token: 'JWT ' + token, id: query._id, name: query.name, level: 'eUser' };
    }
}
