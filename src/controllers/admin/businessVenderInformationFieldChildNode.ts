import { BusinessVenderInformationFieldChildNode } from '../../entity/mysql/entities/MysqlBusinessVenderInformationFieldChildNode';
import { Request, Response } from 'express';
import { RequestRole, responseJson, tryCatch } from '../../util/common';
import { check, validationResult, param } from 'express-validator';
import { businessPermission } from '../../util/permission';
import ServiceBusinessVenderInformationField from '../../service/ServiceBusinessVenderInformationField';
import { BusinessVenderInformationField } from '../../entity/mysql/entities/MysqlBusinessVenderInformationField';
import { Server } from 'tls';
import ServiceBusinessVenderInformationChildNode from '../../service/ServiceBusinessVenderInformationFieldChildNode';
import { Business } from '../../entity/mysql/entities/MysqlBusiness';

const apiDelete = async () => [
    [businessPermission.apply(this)],
    (req: Request, res: Response) => {
        console.log('');
    },
];

export default {
    apiDelete,
};
