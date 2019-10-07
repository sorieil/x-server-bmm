import { query } from 'express-validator';
import { BusinessVenderField } from './../entity/mysql/entities/MysqlBusinessVenderField';
import { BaseService } from './BaseService';
import { BusinessVenderFieldChildNode } from '../entity/mysql/entities/MysqlBusinessVenderFieldChildNode';
export default class ServiceBusinessVenderFieldChildNode extends BaseService {
  constructor() {
    super();
  }

  public async post(childNode: BusinessVenderFieldChildNode) {
    const query = this.mysqlManager(BusinessVenderFieldChildNode).save(
      childNode,
    );
    return query;
  }

  public async delete(
    businessVenderFieldChildNode: BusinessVenderFieldChildNode,
  ) {
    const query = this.mysqlManager(BusinessVenderFieldChildNode).delete(
      businessVenderFieldChildNode,
    );

    return query;
  }

  public async get(businessVenderField: BusinessVenderField) {
    const query = this.mysqlManager(BusinessVenderFieldChildNode).findOne({
      where: {
        businessVenderField: businessVenderField,
      },
    });
    return query;
  }

  public async gets(businessVenderField: BusinessVenderField) {
    const query = this.mysqlManager(BusinessVenderFieldChildNode).find({
      where: {
        businessVenderField: businessVenderField,
      },
    });
    return query;
  }

  public async getByBusinessVenderField(
    businessVenderField: BusinessVenderField,
    businessVenderFieldChildNode: BusinessVenderFieldChildNode,
  ) {
    const query = this.mysqlManager(BusinessVenderFieldChildNode).findOne({
      where: {
        // businessVenderField: businessVenderField,
        id: businessVenderFieldChildNode.id,
      },
    });
    return query;
  }
}
