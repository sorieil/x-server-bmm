import { connectionType, connectionMysql, connectionMongoDB } from '../util/db';
import { Repository, getManager, ObjectType, getMongoManager } from 'typeorm';
import logger from '../util/logger';

export class BaseService {
    public connectionName: connectionType = 'mysqlDB';

    public queryRunner = getManager('mysqlDB').connection.createQueryRunner();

    public mysqlManager = <Entity>(entity: ObjectType<Entity>) => {
        try {
            return getManager(connectionMysql).getRepository(entity);
        } catch (error) {
            getManager('mysqlDB').connection.close();
            logger.error('Base service error:', error);
            return;
        }
    };
    public mongoManager = <Entity>(entity: ObjectType<Entity>) => {
        try {
            return getMongoManager(connectionMongoDB).getMongoRepository(
                entity,
            );
        } catch (error) {
            logger.error('Base service error:', error);
            getManager('mysqlDB').connection.close();
            return;
        }
    };

    public mysqlConnection = getManager(connectionMysql);

    constructor() {
        // new Promise(async resolve => {
        // await this.queryRunner.connect();
        //   resolve(true);
        // }).then(r => {
        //   return r;
        // });
    }

    /**
     * 트렌젝션이 필요한 엔티티인경우 실행
     * TODO: 개선 필요
     * @param entity 엔티티 모델
     */
    // public async transEntity(entity: Entity): Promise<string | boolean> {
    //   const queryRunner = getManager(this.connectionName).connection.createQueryRunner();
    //   let error: string | boolean = true;
    //   await queryRunner.connect();
    //   await queryRunner.startTransaction();
    //   try {
    //     // execute some operations on this transaction:
    //     await queryRunner.manager.save(entity);
    //     // commit transaction now:
    //     await queryRunner.commitTransaction();
    //   } catch (err) {
    //     error = err;
    //     // since we have errors lets rollback changes we made
    //     await queryRunner.rollbackTransaction();
    //   } finally {
    //     // you need to release query runner which is manually created:
    //     const result = await queryRunner.release();
    //     return error;
    //   }
    // }

    /**
     * TODO: 개선 필요 버젼업이 되면서 제대로 작동 안함.
     * @param object User data
     * @param type Entity
     */
    protected async assignObjectToModel<Entity>(
        object: any,
        type: ObjectType<Entity>,
    ): Promise<Entity> {
        let repository: Repository<Entity> = getManager(
            this.connectionName,
        ).getRepository(type);
        let newEntity: Entity = repository.create();
        const modelName =
            newEntity.constructor.name[0].toLowerCase() +
            newEntity.constructor.name.substring(
                1,
                newEntity.constructor.name.length,
            ) +
            '.';
        await repository.metadata.columns
            .filter(column => {
                // console.log(`${column.propertyName} == ${modelName + column.propertyName}`);
                if (
                    object.hasOwnProperty(column.propertyName) ||
                    object.hasOwnProperty(modelName + column.propertyName)
                ) {
                    return true;
                } else {
                    return false;
                }
            })
            .forEach(column => {
                if (object.hasOwnProperty(column.propertyName)) {
                    Object.assign(newEntity, {
                        [column.propertyName]: object[column.propertyName],
                    });
                } else if (
                    object.hasOwnProperty(modelName + column.propertyName)
                ) {
                    Object.assign(newEntity, {
                        [column.propertyName]:
                            object[modelName + column.propertyName],
                    });
                }
            });
        return newEntity;
    }
}
