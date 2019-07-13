import { Logger, createLogger, LoggerOptions, transports } from 'winston';

const options: LoggerOptions = {
    transports: [
        new transports.Console({
            level: process.env.ENVIRONMENT === 'production' ? 'error' : 'debug',
        }),
        new transports.File({ filename: 'debug.log', level: 'debug' }),
    ],
};

const logger: Logger = createLogger(options);

if (process.env.ENVIRONMENT !== 'production') {
    logger.debug('Logging initialized at debug level');
}

export default logger;
