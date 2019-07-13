import uuidV4 from 'uuidv4';
import moment from 'moment';
import path from 'path';

/*
    시간 기준으로 파일명을 생성해준다.
*/
const generateFileNameWithTime = (fileName: string): string => {
    const time = moment()
        .format('YYYYMMDDHHmmssSSSZZ')
        .replace(/(\+|-)/gi, '_');
    const uuid = uuidV4().replace(/-/gi, '');
    const extname = path.extname(fileName);
    return `${time}_${uuid}${extname}`;
};

// const;
