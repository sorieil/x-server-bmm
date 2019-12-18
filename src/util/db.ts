import { createConnections } from 'typeorm';

interface Idb {
    MYSQL_DATABASE: string;
    MYSQL_USER: string;
    MYSQL_PASSWORD: string;
    MYSQL_HOST: string;
    MYSQL_PORT: number;
    MONGO_INITDB_ROOT_USERNAME: string;
    MONGO_INITDB_ROOT_PASSWORD: string;
    MONGO_HOST: string;
    MONGO_INITDB_DATABASE: string;
    MONGO_PORT: number;
}
export type connectionType = 'mongoDB' | 'mysqlDB';
export const connectionMongoDB: connectionType = 'mongoDB';
export const connectionMysql: connectionType = 'mysqlDB';
export const connections = (env: any) => {
    const mongoDBConn = `mongodb://${env.MONGO_INITDB_ROOT_USERNAME}:${env.MONGO_INITDB_ROOT_PASSWORD}@${env.MONGO_HOST}:${env.MONGO_PORT}/${env.MONGO_INITDB_DATABASE}?retryWrites=true&w=majority`;
    return createConnections([
        {
            name: 'mysqlDB',
            type: 'mysql',
            host: env.MYSQL_HOST,
            port: Number(env.MYSQL_PORT),
            username: env.MYSQL_USER,
            password: env.MYSQL_PASSWORD,
            database: env.MYSQL_DATABASE,
            entities: ['./src/entity/mysql/entities/*{.js,.ts}'],
            synchronize: true,
            debug: false,
            insecureAuth: true,
            logging: ['error'],
            // logger: 'file',
            extra: {
                connectionLimit: 1,
            },
        },
        {
            name: 'mongoDB',
            type: 'mongodb',
            url: mongoDBConn,
            entities: ['./src/entity/mongodb/entities/*{.js,.ts}'],
            useNewUrlParser: true,
            synchronize: false,
            authSource: 'admin',
            logging: ['error'],
            monitorCommands: true,
            logger: 'file',
        },
    ]);
};

/** 
 * 메뉴얼에는 아래와 같이 접속을 해야 하지만 위 방식으로 현재 가능함. 위 방식은 deprecated 될 예정임
 {
  name: 'mongoDB',
  type: 'mongodb',
  host: env.MONGO_HOST,
  port: env.MONGO_PORT,
  username: env.MONGO_INITDB_ROOT_USERNAME,
  password: env.MONGO_INITDB_ROOT_PASSWORD,
  database: env.MONGO_INITDB_DATABASE,
  entities: ['./src/entity/mongodb/entities/*{.js,.ts}'],
  synchronize: true,
  useNewUrlParser: true,
  logging: ['query', 'error'],
  monitorCommands: true,
  }, 
*/
