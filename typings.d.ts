declare global {
    namespace Express {
        interface Request {
            files?: fileUpload.FileArray;
            files:
                | {
                      [fieldname: string]: Multer.File[];
                  }
                | Multer.File[];
        }
    }
}
