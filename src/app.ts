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
import businessVendorField from './controllers/admin/businessVendorField';
import userVendor from './controllers/user/userVendor';
import code from './controllers/code';
import businessCode from './controllers/admin/businessCode';
import businessVendor from './controllers/admin/businessVendor';
import businessVendorFieldChildNode from './controllers/admin/businessVendorFieldChildNode';
import userFavorite from './controllers/user/userFavorite';
import userBusinessTime from './controllers/user/userBusinessTime';
import userVendorFilter from './controllers/user/userVendorFilter';
import businessVendorManager from './controllers/admin/businessVendorManager';
import userVendorField from './controllers/user/userVendorField';
import userBusiness from './controllers/user/userBusiness';

// Load NODE_ENV variables from .env file, where API keys and passwords are configured
// TODO: 배포 버젼을 만들때 배포 버젼 파일과 개발 버젼을 구분한다.

if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: 'https://06f4e243004948ea805a2f3c7709e7ac@sentry.io/1503535',
  });
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
      // app.use(
      //     cors({
      //         origin: '*',
      //         optionsSuccessStatus: 200,
      //     }),
      // );
    }

    app.use(
      cors({
        origin: '*',
        optionsSuccessStatus: 200,
      }),
    );

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
    app.post(
      '/api/v1/business-meeting-room',
      adminCheck,
      ...businessMeetingRoom.apiPost,
    );
    app.get(
      '/api/v1/business-meeting-room',
      adminCheck,
      ...businessMeetingRoom.apiGets,
    );
    app.get(
      '/api/v1/business-meeting-room/meetingRoomId',
      adminCheck,
      ...businessMeetingRoom.apiGet,
    );
    app.patch(
      '/api/v1/business-meeting-room/:meetingRoomId',
      adminCheck,
      ...businessMeetingRoom.apiPost,
    );
    app.delete(
      '/api/v1/business-meeting-room/:meetingRoomId',
      adminCheck,
      ...businessMeetingRoom.apiDelete,
    );

    // meeting time
    app.get('/api/v1/business-time', adminCheck, ...businessTime.apiGet);
    app.post('/api/v1/business-time', adminCheck, ...businessTime.apiPost);
    app.patch('/api/v1/business-time', adminCheck, ...businessTime.apiPost);

    // Meeting time list
    app.get(
      '/api/v1/business-time-list',
      adminCheck,
      ...businessTimeList.apiGets,
    );
    app.post(
      '/api/v1/business-time-list',
      adminCheck,
      ...businessTimeList.apiPost,
    );
    app.patch(
      '/api/v1/business-time-list/:timeListId',
      adminCheck,
      ...businessTimeList.apiPatch,
    );

    // vendor field init
    app.post(
      '/api/v1/business-vendor-field-init',
      adminCheck,
      ...businessVendorField.apiInit,
    );

    // vendor field
    app.post(
      '/api/v1/business-vendor-field',
      adminCheck,
      ...businessVendorField.apiPost,
    );
    app.get(
      '/api/v1/business-vendor-field/:fieldId',
      adminCheck,
      ...businessVendorField.apiGet,
    );
    app.get(
      '/api/v1/business-vendor-field',
      adminCheck,
      ...businessVendorField.apiGets,
    );
    app.patch(
      '/api/v1/business-vendor-field/:fieldId',
      adminCheck,
      ...businessVendorField.apiPatch,
    );
    app.delete(
      '/api/v1/business-vendor-field/:fieldId',
      adminCheck,
      ...businessVendorField.apiDelete,
    );
    app.delete(
      '/api/v1/business-vendor-field/:fieldId/child/:fieldChildNodeId',
      adminCheck,
      ...businessVendorField.apiDeleteChildNode,
    );
    app.delete(
      '/api/v1/business-vendor-field-all',
      adminCheck,
      ...businessVendorField.apiDeleteAll,
    );

    // vendor field child node
    app.delete(
      '/api/v1/business-vendor-field-child/:fieldChildNodeId',
      adminCheck,
      ...businessVendorFieldChildNode.apiDelete,
    );

    // Business vendor
    app.post('/api/v1/business-vendor', adminCheck, ...businessVendor.apiPost);
    app.patch(
      '/api/v1/business-vendor/:vendorId',
      adminCheck,
      ...businessVendor.apiPatch,
    );
    app.delete(
      '/api/v1/business-vendor/:vendorId',
      adminCheck,
      ...businessVendor.apiDelete,
    );
    app.get(
      '/api/v1/business-vendor/:vendorId',
      adminCheck,
      ...businessVendor.apiGet,
    );
    app.get(
      '/api/v1/business-vendor/:vendorId/information-type/:informationType',
      adminCheck,
      ...businessVendor.apiGetInformationType,
    );
    app.get('/api/v1/business-vendor', adminCheck, ...businessVendor.apiGets);
    app.get(
      '/api/v1/business-vendor-field-list/:informationTypeId',
      adminCheck,
      ...businessVendor.apiGetField,
    );

    // Business vendor manager
    app.get(
      '/api/v1/business-vendor/:vendorId/manager/:managerId',
      adminCheck,
      ...businessVendorManager.apiGet,
    );

    app.get(
      '/api/v1/business-vendor/:vendorId/manager',
      adminCheck,
      ...businessVendorManager.apiGets,
    );

    app.post(
      '/api/v1/business-vendor/:vendorId/manager',
      adminCheck,
      ...businessVendorManager.apiPost,
    );

    app.patch(
      '/api/v1/business-vendor/:vendorId/manager/:managerId',
      adminCheck,
      ...businessVendorManager.apiPost,
    );

    app.delete(
      '/api/v1/business-vendor/:vendorId/manager/:managerId',
      adminCheck,
      ...businessVendorManager.apiDelete,
    );

    // Business code get
    app.get('/api/v1/business-code', adminCheck, ...businessCode.apiGet);

    // code table
    app.get('/api/v1/code/:category', ...code.apiGet);
    app.get('/api/v1/code', ...code.apiGet);

    // Temperature token
    app.post('/api/v1/token', ...api.generateToken);
    app.get('/api/v1/token-verify', ...api.tokenVerify);

    // == user ================================================================================
    const clientCheck = auth('xsync-user').isAuthenticate;

    // Vendor
    app.get('/api/v1/user/vendor', clientCheck, ...userVendor.apiGets);
    app.get('/api/v1/user/vendor/:vendorId', clientCheck, ...userVendor.apiGet);
    app.post('/api/v1/user/vendor', clientCheck, ...userVendor.apiPost);
    app.patch(
      '/api/v1/user/vendor/:vendorId',
      clientCheck,
      ...userVendor.apiPatch,
    );
    // Vendor code
    app.post(
      '/api/v1/user/vendor/:vendorId/verify-vendor-code',
      clientCheck,
      ...userVendor.apiPostVerifyVendorCode,
    );

    // Favorite
    app.get('/api/v1/user/favorite', clientCheck, ...userFavorite.apiGets);
    app.post(
      '/api/v1/user/favorite/:vendorId',
      clientCheck,
      ...userFavorite.apiPost,
    );
    app.delete(
      '/api/v1/user/favorite/:vendorId',
      clientCheck,
      ...userFavorite.apiDelete,
    );

    // Meeting reservation
    app.get(
      '/api/v1/user/meeting-reservation/:blockId',
      clientCheck,
      ...userFavorite.apiGets,
    );
    app.patch(
      '/api/v1/user/meeting-reservation/:blockId',
      clientCheck,
      ...userFavorite.apiGets,
    );
    app.delete(
      '/api/v1/user/meeting-reservation/:blockId',
      clientCheck,
      ...userFavorite.apiGets,
    );

    // Meeting Lists
    app.get(
      '/api/v1/user/meeting-reservation/:blockId',
      clientCheck,
      ...userFavorite.apiGets,
    );

    // Vendor Time
    app.get('/api/v1/user/time', clientCheck, ...userBusinessTime.apiGets);
    app.get('/api/v1/user/time/:date', clientCheck, ...userBusinessTime.apiGet);

    // Vendor filter lists
    app.get('/api/v1/user/filter', clientCheck, ...userVendorFilter.apiGets);

    // Vendor field
    app.get('/api/v1/user/field', clientCheck, ...userVendorField.apiGets);

    // Business
    app.get('/api/v1/user/business', clientCheck, ...userBusiness.apiGet);

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

    app.use(
      (err: any, req: Request, res: Response | any, next: NextFunction) => {
        // The error id is attached to `res.sentry` to be returned
        // and optionally displayed to the user for support.
        const method: RequestRole = req.method.toString() as any;
        responseJson(res, [res.sentry], method, 'invalid');
      },
    );

    // process.on('SIGINT', (e: any) => {
    //    console.error(e)
    // });

    app.listen(app.get('port'), () => {
      console.clear();
      console.log(
        '  App is running at http://localhost:%d in %s mode',
        app.get('port'),
        process.env.NODE_ENV,
      );
      console.log('  Press CTRL-C to stop\n');
    });
  })
  .catch(error => {
    console.log('DB error:', error);
  });
