import dotenv from 'dotenv';
import fs from 'fs';
import logger from './logger';

if (fs.existsSync('.env')) {
    logger.debug('Using .env file to supply config environment variables');
    dotenv.config({ path: '.env' });
} else if (Object.entries(process.env).length > 1) {
    logger.debug('Using environment variable.!!!');
} else {
    logger.debug('You do not have anything!! What are you doing?? Ah~~~~~');
    process.exit(1);
}

export const SESSION_SECRET = process.env.SESSION_SECRET;

const MYSQL_DATABASE = process.env.MYSQL_DATABASE;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MYSQL_DATABASE || !MONGODB_URI) {
    logger.error('No client mysql or mongodb connection information. Set MYSQL environment variable.');
    process.exit(1);
}

if (!MYSQL_DATABASE) {
    logger.error('No client mysql connection information. Set MYSQL environment variable.');
    process.exit(1);
}

if (!SESSION_SECRET) {
    logger.error('No client secret. Set SESSION_SECRET environment variable.');
    process.exit(1);
}

logger.debug('No problem');
