import { header } from 'express-validator';
import { responseJson } from './util/common';
import 'reflect-metadata';
import bodyParser from 'body-parser';
import compression from 'compression'; // compresses requests
import express from 'express';
import passport from 'passport';
import errorHandler from 'errorhandler';
import dotenv from 'dotenv';
import { auth } from './util/passport';
import helmet = require('helmet');
import cors = require('cors');
import { connections } from './util/db';
import api from './controllers/api';
import business from './controllers/business';
import businessMeetingRoom from './controllers/businessMeetingRoom';
import('./util/secrets');
import Sentry = require('@sentry/node');
Sentry.init({ dsn: 'https://06f4e243004948ea805a2f3c7709e7ac@sentry.io/1503535' });
Sentry.configureScope(scope => {
    scope.setUser({ email: 'jhkim@xsync.co' });
});
// Load environment variables from .env file, where API keys and passwords are configured
// TODO: 배포 버젼을 만들때 배포 버젼 파일과 개발 버젼을 구분한다.
if (process.env.ENVIRONMENT === 'production') {
    dotenv.config({ path: '.env.production' });
} else {
    dotenv.config({ path: '.env' });
}
connections(process.env)
    .then(async connect => {
        // Create Express server
        const app = express();
        // Express configuration
        app.set('port', process.env.PORT || 3000);
        app.use(Sentry.Handlers.requestHandler());
        app.use(
            cors({
                origin: '*',
                optionsSuccessStatus: 200,
            }),
        );
        app.use(compression());
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(helmet());
        app.use(passport.initialize());

        /**
         * Primary app routes.
         */
        // == admin
        const adminCheck = auth('xsync-admin').isAuthenticate;
        // app.get('/token/verify', adminCheck, ...home.test);
        app.get('/api/v1/business', adminCheck, ...business.apiGet);

        app.post('/api/v1/business', adminCheck, ...business.apiPost);
        app.patch('/api/v1/business', adminCheck, ...business.apiPost);

        app.post('/api/v1/business/:businessId/meetingroom', adminCheck, ...businessMeetingRoom.apiPost);
        app.get('/api/v1/business/:businessId/meetingroom', adminCheck, ...businessMeetingRoom.apiGet);
        app.patch(
            '/api/v1/business/:businessId/meetingroom/:meetingRoomId',
            adminCheck,
            ...businessMeetingRoom.apiPost,
        );
        app.delete(
            '/api/v1/business/:businessId/meetingroom/:meetingRoomId',
            adminCheck,
            ...businessMeetingRoom.apiDelete,
        );

        app.get('/api/v1/token', ...api.generateToken);

        // == admin
        // const userCheck = auth('xsync-user').isAuthenticate;
        // app.get('/', userCheck, ...home.test);
        // app.get('/token', ...api.generateToken);

        /**
         * Error Handler. Provides full stack - remove for production
         */
        if (process.env.ENVIRONMENT === 'development') {
            app.use(errorHandler());
        }

        /**
         * Start Express server.
         */
        app.use(Sentry.Handlers.errorHandler());

        app.use(
            onError => (
                err: any,
                req: any,
                res: { statusCode: number; end: (arg0: string) => void; sentry: string },
                next: any,
                resA: Response,
            ) => {
                // The error id is attached to `res.sentry` to be returned
                // and optionally displayed to the user for support.
                res.statusCode = 500;
                res.end(res.sentry + '\n');
            },
        );

        app.listen(app.get('port'), () => {
            console.log('  App is running at http://localhost:%d in %s mode', app.get('port'), app.get('env'));
            console.log('  Press CTRL-C to stop\n');
        });
    })
    .catch(error => console.log('DB error:', error));
