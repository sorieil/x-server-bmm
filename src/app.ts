import { responseJson, RequestRole } from './util/common';
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
import businessTime from './controllers/admin/businessTime';
import businessTimeList from './controllers/admin/businessTimeList';
import businessVenderField from './controllers/admin/businessVenderField';
import userVender from './controllers/user/userVender';
import code from './controllers/code';
import businessCode from './controllers/admin/businessCode';
import businessVender from './controllers/admin/businessVender';
import businessVenderFieldChildNode from './controllers/admin/businessVenderFieldChildNode';
import userFavorite from './controllers/user/userFavorite';

// Load NODE_ENV variables from .env file, where API keys and passwords are configured
// TODO: 배포 버젼을 만들때 배포 버젼 파일과 개발 버젼을 구분한다.

if (process.env.NODE_ENV === 'production') {
    Sentry.init({ dsn: 'https://06f4e243004948ea805a2f3c7709e7ac@sentry.io/1503535' });
    Sentry.configureScope(scope => {
        scope.setUser({ email: 'jhkim@xsync.co' });
    });
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
        if (process.env.NODE_ENV === 'production') {
            app.use(Sentry.Handlers.requestHandler());
            app.use(
                cors({
                    origin: '*',
                    optionsSuccessStatus: 200,
                }),
            );
        }

        app.use(compression());
        app.use(bodyParser.json({ limit: '50mb' }));
        app.use(
            bodyParser.urlencoded({
                limit: '50mb',
                extended: true,
            }),
        );
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

        // meeting room
        app.post('/api/v1/business-meeting-room', adminCheck, ...businessMeetingRoom.apiPost);
        app.get('/api/v1/business-meeting-room', adminCheck, ...businessMeetingRoom.apiGets);
        app.get('/api/v1/business-meeting-room/meetingRoomId', adminCheck, ...businessMeetingRoom.apiGet);
        app.patch('/api/v1/business-meeting-room/:meetingRoomId', adminCheck, ...businessMeetingRoom.apiPost);
        app.delete('/api/v1/business-meeting-room/:meetingRoomId', adminCheck, ...businessMeetingRoom.apiDelete);

        // meeting time
        app.get('/api/v1/business-time', adminCheck, ...businessTime.apiGet);
        app.post('/api/v1/business-time', adminCheck, ...businessTime.apiPost);
        app.patch('/api/v1/business-time', adminCheck, ...businessTime.apiPost);

        // Meeting time list
        app.get('/api/v1/business-time-list', adminCheck, ...businessTimeList.apiGets);
        app.post('/api/v1/business-time-list', adminCheck, ...businessTimeList.apiPost);
        app.patch('/api/v1/business-time-list/:timeListId', adminCheck, ...businessTimeList.apiPatch);

        // vender field init
        app.post('/api/v1/business-vender-field-init', adminCheck, ...businessVenderField.apiInit);

        // vender field
        app.post('/api/v1/business-vender-field', adminCheck, ...businessVenderField.apiPost);
        app.get('/api/v1/business-vender-field/:fieldId', adminCheck, ...businessVenderField.apiGet);
        app.get('/api/v1/business-vender-field', adminCheck, ...businessVenderField.apiGets);
        app.patch('/api/v1/business-vender-field/:fieldId', adminCheck, ...businessVenderField.apiPatch);
        app.delete('/api/v1/business-vender-field/:fieldId', adminCheck, ...businessVenderField.apiDelete);
        app.delete(
            '/api/v1/business-vender-field/:fieldId/child/:fieldChildNodeId',
            adminCheck,
            ...businessVenderField.apiDeleteChildNode,
        );
        app.delete('/api/v1/business-vender-field-all', adminCheck, ...businessVenderField.apiDeleteAll);

        // vender field child node
        app.delete(
            '/api/v1/business-vender-field-child/:fieldChildNodeId',
            adminCheck,
            ...businessVenderFieldChildNode.apiDelete,
        );

        // Business vender
        app.post('/api/v1/business-vender', adminCheck, ...businessVender.apiPost);
        app.patch('/api/v1/business-vender/:venderId', adminCheck, ...businessVender.apiPatch);
        app.delete('/api/v1/business-vender/:venderId', adminCheck, ...businessVender.apiDelete);
        app.get('/api/v1/business-vender/:venderId', adminCheck, ...businessVender.apiGet);
        app.get(
            '/api/v1/business-vender/:venderId/information-type/:informationType',
            adminCheck,
            ...businessVender.apiGetInformationType,
        );
        app.get('/api/v1/business-vender', adminCheck, ...businessVender.apiGets);
        app.get('/api/v1/business-vender-field-list/:informationTypeId', adminCheck, ...businessVender.apiGetField);

        // Business code get
        app.get('/api/v1/business-code', adminCheck, ...businessCode.apiGet);

        // code table
        app.get('/api/v1/code/:category', ...code.apiGet);
        app.get('/api/v1/code', ...code.apiGet);

        // Temperature token
        app.post('/api/v1/token', ...api.generateToken);

        // == user ================================================================================
        const clientCheck = auth('xsync-user').isAuthenticate;

        // Vender
        app.get('/api/v1/user/vender', clientCheck, ...userVender.apiGets);
        app.get('/api/v1/user/vender/:venderId', clientCheck, ...userVender.apiGet);
        app.post(
            '/api/v1/user/vender/:venderId/verify-vender-code',
            clientCheck,
            ...userVender.apiPostVerifyVenderCode,
        );

        // Favorite
        app.get('/api/v1/user/favorite', clientCheck, ...userFavorite.apiGets);
        app.post('/api/v1/user/favorite/:venderId', clientCheck, ...userFavorite.apiPost);
        app.delete('/api/v1/user/favorite/:venderId', clientCheck, ...userFavorite.apiDelete);

        // Meeting reservation
        app.get('/api/v1/user/meeting-reservation/blockId', clientCheck, ...userFavorite.apiGets);
        app.patch('/api/v1/user/meeting-reservation/blockId', clientCheck, ...userFavorite.apiGets);
        app.delete('/api/v1/user/meeting-reservation/blockId', clientCheck, ...userFavorite.apiGets);

        // Meeting Lists
        app.get('/api/v1/user/meeting-reservation/blockId', clientCheck, ...userFavorite.apiGets);

        /**
         * Error Handler. Provides full stack - remove for production
         */
        if (process.env.NODE_ENV === 'development') {
            app.use(errorHandler());
        } else {
            app.use(Sentry.Handlers.errorHandler());
        }

        /**
         * Start Express server.
         */

        app.use((err: any, req: Request, res: Response | any, next: NextFunction) => {
            // The error id is attached to `res.sentry` to be returned
            // and optionally displayed to the user for support.
            const method: RequestRole = req.method.toString() as any;
            responseJson(res, [res.sentry], method, 'invalid');
        });

        // process.on('SIGINT', (e: any) => {
        //    console.error(e)
        // });

        app.listen(app.get('port'), () => {
            console.clear();
            console.log('  App is running at http://localhost:%d in %s mode', app.get('port'), process.env.NODE_ENV);
            console.log('  Press CTRL-C to stop\n');
        });
    })
    .catch(error => {
        console.log('DB error:', error);
    });
