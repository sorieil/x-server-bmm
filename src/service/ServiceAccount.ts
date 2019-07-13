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
export type TokenLevelRole = 'admin' | 'user';
export default class ServiceAccount extends BaseService {
    constructor() {
        super();
    }
    public async getUserId(id: any) {
        const mongoManager = await getMongoManager(connectionMongoDB);
        const mysqlManager = await getManager(connectionMysql);
        const account = new Accounts();
        const mongoQuery = mongoManager.getMongoRepository(Accounts).findOne(id);
        // 로그인을 하게 되면 무조건 Mysql 에 동기화를 시킨다.
        return mongoQuery.then(async query => {
            const user = new User();
            const login = new Login();
            let bridge: MongoBridge = await mysqlManager
                .getRepository(MongoBridge)
                .findOne({ where: { mongodbID: id } });
            if (bridge) {
                bridge = new MongoBridge();
                bridge.mongodbID = query.id.toString();
                // 여기서 user.id 값을 구해서 아이디 기준으로 업데이트를 따로 해줘야 할거 같다.
            }

            console.log('bridge:', bridge);
            /*
                이부분에서 자동 머지 가능을 사용하지 않는 이유는 sub documents
                를 업데이트를 해줄때 기존에 있는 데이터를 삭제 하고, 업데이트를 해줘야 하기 때문인데...
                유저의 로그인도 따로 빼야 하고, 유저 정보도 따로 빼야 한다..
                */

            // Todo  여기서 부터 마이그레이션 작업을 하고, 그다음에 비즈니스 들어가면되겠군..
            // 유저 로그인 처리
            // const permissionSave = query.permission.reduce((acc: Array<UserPermission>, cur: Permission): Array<
            //     UserPermission
            // > => {
            //     const permission = new UserPermission();
            //     permission.permissionName = cur.permissionName;
            //     permission.isChecked = cur.isChecked;
            //     acc.push(permission);
            //     return acc;
            // }, []);

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

            // user.permission = permissionSave;
            // user.isInactive = query.isInactive;
            // user.isWithdrawal = query.isWithdrawal;
            // user.createdAt = query.createDt;
            // user.profileImg = query.profiles.profileImg;
            // user.permission = permissionSave;
            // user.event = eventSave;

            login.emailVerified = query.emailVerified;
            login.email = query.email;
            login.password = query.password;
            login.createdAt = query.createDt;

            const userQuery = await mysqlManager.getRepository(Login).save(login);

            return { id: userQuery.id };
        });
    }

    public async getAdminId(id: any) {
        // const mongoManager = await getMongoManager(connectionMongoDB);
        const mysqlManager = await getManager(connectionMysql);
        const mongoQuery = this.mongoManager(Admins).findOne(id);
        // 로그인을 하게 되면 무조건 Mysql 에 동기화를 시킨다.
        return mongoQuery.then(async query => {
            const bridgeQuery: MongoBridge = await this.mysqlManager(MongoBridge).findOne({
                where: { mongodbID: query._id.toString() },
                relations: ['adminLogin'],
            });

            let adminLoginId = 0;
            // console.log('bridgeQuery:======= ', bridgeQuery);
            // 로그인한 이력이 없으면, 새로 저장해준다.
            if (typeof bridgeQuery === 'undefined') {
                const admin = new Admin();
                const adminLogin = new AdminLogin();
                adminLogin.emailVerified = query.verified;
                adminLogin.email = query.id;
                adminLogin.password = query.password;
                adminLogin.createdAt = query.createDt;
                const adminLoginQuery = await this.mysqlManager(AdminLogin).save(adminLogin);

                adminLoginId = adminLoginQuery.id;

                const bridge = new MongoBridge();
                bridge.mongodbID = query._id.toString();
                bridge.adminLogin = adminLoginQuery;
                await mysqlManager.getRepository(MongoBridge).save(bridge);
                // 사실 bridge 와 admin_login 은 상호 릴레이션을 할 필요는 없다. 나중에 브릿지는 삭제될 테이블 이기때문이다. 하지만
                // 현제 구조상 브릿지를 통해서 새로운 데이터 베이스를 접근하기 때문에 물리적인 릴레이션은 아니지만 논리적으로 릴레이션을 해줘야 한다.
                // 그래서 아래의 코드가 필요하다.

                admin.phone = query.phone;
                admin.name = query.name || query.id.toString(); // 아이디가 없는 경우에는 _id 값을 대신 입력해준다.
                admin.adminLogin = adminLoginQuery;
                await mysqlManager.getRepository(Admin).save(admin);
            } else {
                adminLoginId = bridgeQuery.adminLogin.id;
                const admin = new Admin();
                const adminLogin = new AdminLogin();
                const adminLoginQuery = await this.mysqlManager(AdminLogin).findOne({
                    where: {
                        id: adminLoginId,
                    },
                    relations: ['admin'],
                });
                // console.log('adminLoginId:********', adminLoginId);
                // console.log('adminLoginQuery******:', adminLoginQuery.admin[0].id);
                admin.id = adminLoginQuery.admin[0].id;
                admin.phone = query.phone;
                admin.name = query.name || query.id.toString(); // 아이디가 없는 경우에는 _id 값을 대신 입력해준다.
                await mysqlManager.getRepository(Admin).save(admin);

                adminLogin.id = adminLoginQuery.id;
                adminLogin.emailVerified = query.verified;
                adminLogin.email = query.id;
                adminLogin.password = query.password;

                await this.mysqlManager(AdminLogin).save(adminLogin);
            }

            const adminLoginInfo = await this.mysqlManager(AdminLogin).findOne({
                where: {
                    id: adminLoginId,
                },
                relations: ['admin'],
            });
            // console.log('--------- admin login info', adminLoginInfo);
            return adminLoginInfo;
        });
    }

    /**
     * generateToken
     */

    public async generateToken(secretKey: secretNameType, level: TokenLevelRole = 'admin') {
        const query = await getMongoManager(connectionMongoDB)
            .getMongoRepository(Admins)
            .findOne({
                order: {
                    id: 'DESC',
                },
            });
        const token = jwt.sign(
            {
                id: query._id,
                name: query.name,
                level: level,
            },
            secretKey,
            { expiresIn: 99999999 },
        );
        return { token: 'JWT ' + token, id: query._id, name: query.name, level: level };
    }
}
