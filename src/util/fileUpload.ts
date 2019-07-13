import { NextFunction } from 'express';
import aws from 'aws-sdk';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { ParsingOptions, WorkBook, read, WorkSheet, utils } from 'xlsx/types';
import { any } from 'bluebird';

aws.config.update({
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    region: process.env.region,
});

const s3 = new aws.S3();
const fileFilter: any = (req: Request, file: any, cb: any): void => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type, only JPEG and PNG is allowed!'), false);
    }
};

// 필터가 왜 에러가 날까????
const upload = multer({
    fileFilter,
    storage: multerS3({
        acl: 'public-read',
        s3,
        bucket: 'bmm',
        metadata: function(req, file, cb) {
            // cb(null, { fieldName: 'TESTING_METADATA' });
            cb(null, { fieldName: file.fieldname });
        },
        key: function(req, file, cb) {
            cb(null, Date.now().toString());
        },
    }),
}).array('upload', 1);

export const fileUpload = (file: any) => {
    // upload(req: Request, res: Response, next: NextFunction)
    return file;
};

export const readFirstSheet = (data: any, options: ParsingOptions): any[][] => {
    const wb: WorkBook = read(data, options);
    const ws: WorkSheet = wb.Sheets[wb.SheetNames[0]];
    return utils.sheet_to_json(ws, { header: 1, raw: true });
};
