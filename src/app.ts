import { RouterRole } from './util/routerConstant';
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
import userVendorFilter from './controllers/user/userVendorFilter';
import businessVendorManager from './controllers/admin/businessVendorManager';
import userVendorField from './controllers/user/userVendorField';
import userBusiness from './controllers/user/userBusiness';
import userBusinessTimeList from './controllers/user/userBusinessTimeList';
import userBuyer from './controllers/user/userBuyer';
import userVendorManager from './controllers/user/userVendorManager';
import user from './controllers/user/user';
import userBusinessTime from './controllers/user/userBusinessTime';
import userMeetingRoomReservation from './controllers/user/userMeetingRoomReservation';
import userMeetingRoom from './controllers/user/userMeetingRoom';

// Load NODE_ENV variables from .env file, where API keys and passwords are configured
// TODO: 배포 버젼을 만들때 배포 버젼 파일과 개발 버젼을 구분한다.
// Setup sentry.
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

    // Active sentry when deployed.
    if (process.env.NODE_ENV === 'production') {
      app.use(Sentry.Handlers.requestHandler());
      // app.use(
      //     cors({
      //         origin: '*',
      //         optionsSuccessStatus: 200,
      //     }),
      // );
    }

    // Cross browsing free open.
    app.use(
      cors({
        origin: '*',
        optionsSuccessStatus: 200,
      }),
    );

    // Traffic compress.
    app.use(compression());

    // Auto convert body parse
    app.use(bodyParser.json({ limit: '50mb' }));
    app.use(
      bodyParser.urlencoded({
        limit: '50mb',
        extended: true,
      }),
    );
    // Default secure guard
    app.use(helmet());
    app.use(passport.initialize());

    /**
     * Primary app routes.
     */
    // == Admin router
    const adminCheck = auth('xsync-admin').isAuthenticate;
    app.get(RouterRole['/api/v1/business'], adminCheck, ...business.apiGet);
    app.post(RouterRole['/api/v1/business'], adminCheck, ...business.apiPost);
    app.patch(RouterRole['/api/v1/business'], adminCheck, ...business.apiPost);
    app.delete(
      RouterRole['/api/v1/business'],
      adminCheck,
      ...business.apiDelete,
    );

    // meeting room
    app.post(
      RouterRole['/api/v1/business-meeting-room'],
      adminCheck,
      ...businessMeetingRoom.apiPost,
    );
    app.get(
      RouterRole['/api/v1/business-meeting-room'],
      adminCheck,
      ...businessMeetingRoom.apiGets,
    );
    app.get(
      RouterRole['/api/v1/business-meeting-room/:meetingRoomId'],
      adminCheck,
      ...businessMeetingRoom.apiGet,
    );
    app.patch(
      RouterRole['/api/v1/business-meeting-room/:meetingRoomId'],
      adminCheck,
      ...businessMeetingRoom.apiPost,
    );
    app.delete(
      RouterRole['/api/v1/business-meeting-room/:meetingRoomId'],
      adminCheck,
      ...businessMeetingRoom.apiDelete,
    );

    // meeting time
    app.get(
      RouterRole['/api/v1/business-time'],
      adminCheck,
      ...businessTime.apiGet,
    );
    app.post(
      RouterRole['/api/v1/business-time'],
      adminCheck,
      ...businessTime.apiPost,
    );
    app.patch('/api/v1/business-time', adminCheck, ...businessTime.apiPost);

    // Meeting time list
    app.get(
      RouterRole['/api/v1/business-time-list'],
      adminCheck,
      ...businessTimeList.apiGets,
    );
    app.post(
      RouterRole['/api/v1/business-time-list'],
      adminCheck,
      ...businessTimeList.apiPost,
    );
    app.patch(
      RouterRole['/api/v1/business-time-list/:timeListId'],
      adminCheck,
      ...businessTimeList.apiPatch,
    );

    // vendor field init
    app.post(
      RouterRole['/api/v1/business-vendor-field-init'],
      adminCheck,
      ...businessVendorField.apiInit,
    );

    // vendor field
    app.post(
      RouterRole['/api/v1/business-vendor-field'],
      adminCheck,
      ...businessVendorField.apiPost,
    );
    app.get(
      RouterRole['/api/v1/business-vendor-field/:fieldId'],
      adminCheck,
      ...businessVendorField.apiGet,
    );
    app.get(
      RouterRole['/api/v1/business-vendor-field'],
      adminCheck,
      ...businessVendorField.apiGets,
    );
    app.patch(
      RouterRole['/api/v1/business-vendor-field/:fieldId'],
      adminCheck,
      ...businessVendorField.apiPatch,
    );
    app.delete(
      RouterRole['/api/v1/business-vendor-field/:fieldId'],
      adminCheck,
      ...businessVendorField.apiDelete,
    );
    app.delete(
      RouterRole[
        '/api/v1/business-vendor-field/:fieldId/child/:fieldChildNodeId'
      ],
      adminCheck,
      ...businessVendorField.apiDeleteChildNode,
    );
    app.delete(
      RouterRole['/api/v1/business-vendor-field-all'],
      adminCheck,
      ...businessVendorField.apiDeleteAll,
    );

    // vendor field child node
    app.delete(
      RouterRole['/api/v1/business-vendor-field-child/:fieldChildNodeId'],
      adminCheck,
      ...businessVendorFieldChildNode.apiDelete,
    );

    // Business vendor
    app.post(
      RouterRole['/api/v1/business-vendor'],
      adminCheck,
      ...businessVendor.apiPost,
    );
    app.patch(
      RouterRole['/api/v1/business-vendor/:vendorId'],
      adminCheck,
      ...businessVendor.apiPatch,
    );
    app.delete(
      RouterRole['/api/v1/business-vendor'],
      adminCheck,
      ...businessVendor.apiDelete,
    );
    app.get(
      RouterRole['/api/v1/business-vendor/:vendorId'],
      adminCheck,
      ...businessVendor.apiGet,
    );
    app.get(
      RouterRole[
        '/api/v1/business-vendor/:vendorId/information-type/:informationType'
      ],
      adminCheck,
      ...businessVendor.apiGetInformationType,
    );
    app.get(
      RouterRole['/api/v1/business-vendor'],
      adminCheck,
      ...businessVendor.apiGets,
    );
    app.get(
      RouterRole['/api/v1/business-vendor-field-list/:informationTypeId'],
      adminCheck,
      ...businessVendor.apiGetField,
    );

    // Business vendor manager
    app.get(
      RouterRole['/api/v1/business-vendor/:vendorId/manager/:managerId'],
      adminCheck,
      ...businessVendorManager.apiGet,
    );

    app.get(
      RouterRole['/api/v1/business-vendor/:vendorId/manager'],
      adminCheck,
      ...businessVendorManager.apiGets,
    );

    app.post(
      RouterRole['/api/v1/business-vendor/:vendorId/manager'],
      adminCheck,
      ...businessVendorManager.apiPost,
    );

    app.patch(
      RouterRole['/api/v1/business-vendor/:vendorId/manager/:managerId'],
      adminCheck,
      ...businessVendorManager.apiPatch,
    );

    app.delete(
      RouterRole['/api/v1/business-vendor/:vendorId/manager/:managerId'],
      adminCheck,
      ...businessVendorManager.apiDelete,
    );

    // Business code get
    app.get(
      RouterRole['/api/v1/business-code'],
      adminCheck,
      ...businessCode.apiGet,
    );

    // code table
    app.get(RouterRole['/api/v1/code/:category'], ...code.apiGet);
    app.get('/api/v1/code', ...code.apiGet);

    // Temperature token
    app.post(RouterRole['/api/v1/token'], ...api.generateToken);
    app.get(RouterRole['/api/v1/token-verify'], ...api.tokenVerify);

    // User router ================================================================================
    const clientCheck = auth('xsync-user').isAuthenticate;

    // Vendor
    app.get(
      RouterRole['/api/v1/user/vendor'],
      clientCheck,
      ...userVendor.apiGets,
    );
    app.get(
      RouterRole['/api/v1/user/vendor/:vendorId'],
      clientCheck,
      ...userVendor.apiGet,
    );
    app.post(
      RouterRole['/api/v1/user/vendor'],
      clientCheck,
      ...userVendor.apiPost,
    );
    app.patch(
      RouterRole['/api/v1/user/vendor/:vendorId'],
      clientCheck,
      ...userVendor.apiPatch,
    );
    // Vendor code
    app.post(
      RouterRole['/api/v1/user/vendor/:vendorId/verify-vendor-code'],
      clientCheck,
      ...userVendor.apiPostVerifyVendorCode,
    );

    // Favorite
    app.get(
      RouterRole['/api/v1/user/favorite'],
      clientCheck,
      ...userFavorite.apiGets,
    );
    app.post(
      RouterRole['/api/v1/user/favorite/:vendorId'],
      clientCheck,
      ...userFavorite.apiPost,
    );
    app.delete(
      RouterRole['/api/v1/user/favorite/:vendorId'],
      clientCheck,
      ...userFavorite.apiDelete,
    );

    // Meeting reservation
    app.post(
      RouterRole['/api/v1/user/meeting-reservation'],
      clientCheck,
      ...userMeetingRoomReservation.apiPost,
    );
    app.patch(
      RouterRole['/api/v1/user/meeting-reservation/:reservationId'],
      clientCheck,
      ...userMeetingRoomReservation.apiPatch,
    );
    app.delete(
      RouterRole['/api/v1/user/meeting-reservation/:reservationId'],
      clientCheck,
      ...userMeetingRoomReservation.apiDelete,
    );
    app.get(
      RouterRole['/api/v1/user/meeting-reservation/:reservationId'],
      clientCheck,
      ...userMeetingRoomReservation.apiGet,
    );

    // app.get(
    //   RouterRole['/api/v1/user/meeting-reservation/:blockId'],
    //   clientCheck,
    //   ...userFavorite.apiGets,
    // );

    // Vendor schedule
    // app.get(
    //   RouterRole['/api/v1/user/schedule'],
    //   clientCheck,
    //   ...userBusinessTimeList.apiGet,
    // );
    app.get(
      RouterRole['/api/v1/user/schedule/:date'],
      clientCheck,
      ...userBusinessTimeList.apiGet,
    );

    // Vendor filter lists
    app.get(
      RouterRole['/api/v1/user/filter'],
      clientCheck,
      ...userVendorFilter.apiGets,
    );

    // Vendor field
    app.get(
      RouterRole['/api/v1/user/field'],
      clientCheck,
      ...userVendorField.apiGets,
    );

    // Business
    app.get(
      RouterRole['/api/v1/user/business'],
      clientCheck,
      ...userBusiness.apiGet,
    );

    // Business time
    app.get(
      RouterRole['/api/v1/user/business-time/:requestType'],
      clientCheck,
      ...userBusinessTime.apiGet,
    );

    app.get(
      RouterRole['/api/v1/user/business-time'],
      clientCheck,
      ...userBusinessTime.apiGet,
    );

    // Buyer
    app.get(RouterRole['/api/v1/user/buyer'], clientCheck, ...userBuyer.apiGet);
    app.post(
      RouterRole['/api/v1/user/buyer'],
      clientCheck,
      ...userBuyer.apiPost,
    );
    app.patch(
      RouterRole['/api/v1/user/buyer'],
      clientCheck,
      ...userBuyer.apiPost,
    );

    // User Vendor manager
    app.get(
      RouterRole['/api/v1/user/vendor-manager'],
      clientCheck,
      ...userVendorManager.apiGet,
    );

    app.post(
      RouterRole['/api/v1/user/vendor-manager/:vendorId'],
      clientCheck,
      ...userVendorManager.apiPost,
    );

    app.patch(
      RouterRole['/api/v1/user/vendor-manager/:vendorManagerId'],
      clientCheck,
      ...userVendorManager.apiPatch,
    );

    // User type
    app.get(RouterRole['/api/v1/user'], clientCheck, ...user.apiGet);
    // app.post('/api/v1/user/buyer', clientCheck, ...userVendorManager.apiPost);
    // app.patch('/api/v1/user/buyer/:businessVendorManagerId', clientCheck, ...userVendorManager.apiPatch);

    // User MeetingRoom
    app.get(
      RouterRole['/api/v1/user/meeting-room'],
      clientCheck,
      ...userMeetingRoom.apiGet,
    );
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
