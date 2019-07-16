import 'reflect-metadata';
import bodyParser from 'body-parser';
import compression from 'compression'; // compresses requests
import express, { NextFunction, Request, Response } from 'express';
import passport from 'passport';
import errorHandler from 'errorhandler';
import { auth } from './util/passport';
import helmet = require('helmet');
import cors = require('cors');
import dotenv from 'dotenv';
import { connections } from './util/db';
import api from './controllers/api';
import business from './controllers/admin/business';
import businessMeetingRoom from './controllers/admin/businessMeetingRoom';
import('./util/secrets');
import Sentry = require('@sentry/node');
import { API_VERSION } from '@sentry/hub/dist/hub';
import businessTime from './controllers/admin/businessTime';
import businessTimeList from './controllers/admin/businessTimeList';
import businessVenderInformationField from './controllers/admin/businessVenderInformationField';
import clientVender from './controllers/client/clientVender';
import codeTable from './controllers/codeTable';
import businessCode from './controllers/admin/businessCode';
import businessVender from './controllers/admin/businessVender';
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
        app.set('port', process.env.PORT || 3003);
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
        app.get('/api/v1/business', adminCheck, ...business.apiGet);
        app.post('/api/v1/business', adminCheck, ...business.apiPost);
        app.patch('/api/v1/business', adminCheck, ...business.apiPost);
        app.delete('/api/v1/business', adminCheck, ...business.apiDelete);

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

        app.post('/api/v1/token', ...api.generateToken);
        app.post('/api/v1/business_time', adminCheck, ...businessTime.apiPost);
        app.patch('/api/v1/business_time', adminCheck, ...businessTime.apiPost);
        app.post('/api/v1/business_time_list', adminCheck, ...businessTimeList.apiPost);
        app.post('/api/v1/business_time_list', adminCheck, ...businessTimeList.apiPost);

        // information
        app.post('/api/v1/business_vender_information_field', adminCheck, ...businessVenderInformationField.apiPost);
        app.get(
            '/api/v1/business_vender_information_field/:informationId',
            adminCheck,
            ...businessVenderInformationField.apiGet,
        );
        app.get('/api/v1/business_vender_information_field', adminCheck, ...businessVenderInformationField.apiGets);
        app.patch(
            '/api/v1/business_vender_information_field/:informationId',
            adminCheck,
            ...businessVenderInformationField.apiPatch,
        );
        app.delete(
            '/api/v1/business_vender_information_field/:informationId',
            adminCheck,
            ...businessVenderInformationField.apiDelete,
        );

        // Business vender
        app.post('/api/v1/business_vender', adminCheck, ...businessVender.apiPost);
        app.patch('/api/v1/business_vender/:venderId', adminCheck, ...businessVender.apiPatch);
        app.delete('/api/v1/business_vender/:venderId', adminCheck, ...businessVender.apiDelete);
        app.get('/api/v1/business_vender/:venderId', adminCheck, ...businessVender.apiGet);
        app.get('/api/v1/business_vender', adminCheck, ...businessVender.apiGets);

        // Business code generate
        app.get('/api/v1/business_code', adminCheck, ...businessCode.apiGet);

        // code table
        app.get('/api/v1/code_table/:category', ...codeTable.apiGet);
        app.get('/api/v1/code_table', ...codeTable.apiGet);

        // == user
        const clientCheck = auth('xsync-user').isAuthenticate;
        app.get('/api/v1/vender/:businessId', clientCheck, ...clientVender.apiGet);
        app.get('/api/v1/vender/:businessId/favorite', clientCheck, ...clientVender.apiGet);

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

        app.use((err: any, req: Request, res: Response | any, next: NextFunction) => {
            // The error id is attached to `res.sentry` to be returned
            // and optionally displayed to the user for support.
            res.statusCode = 500;
            res.end(res.sentry + '\n');
        });

        app.listen(app.get('port'), () => {
            console.log('  App is running at http://localhost:%d in %s mode', app.get('port'), process.env.ENVIRONMENT);
            console.log('  Press CTRL-C to stop\n');
        });
    })
    .catch(error => {
        console.log('DB error:', error);
    });
