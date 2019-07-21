import _ from 'lodash';
import { Strategy, ExtractJwt, StrategyOptions } from 'passport-jwt';
import passport from 'passport';
import { NextFunction, Request, Response } from 'express';
import logger from './logger';
import ServiceAccount from '../service/ServiceAccount';
import { tryCatch } from './common';
export type secretNameType = 'xsync-super' | 'xsync-admin' | 'xsync-user' | 'xsync-guest' | 'xsync-scanner';
export const auth = (secretName: secretNameType) => {
    const opts: StrategyOptions = {
        jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('jwt'), // 어떤 토큰으로 발행을 하는지 체크 해봐야 한다.
        secretOrKey: secretName,
        algorithms: ['HS256'],
    };
    // (req: Request, res: Response, next: NextFunction) => {
    passport.use(
        secretName,
        new Strategy(opts, async (jwt_payload, done) => {
            console.log('jwt_payload:', jwt_payload);
            try {
                const serviceAccount = new ServiceAccount();
                const level = jwt_payload.level;

                if (level === 'user') {
                    const user = serviceAccount.getUserId(jwt_payload._id);
                    return user
                        .then(user => {
                            if (user) {
                                return done(undefined, user);
                            } else {
                                return done(undefined, null);
                            }
                        })
                        .catch(error => {
                            // console.log('passport error:', error);
                            return done('dbError', null);
                        });
                } else {
                    const admin = serviceAccount.getAdminId(jwt_payload._id);
                    return admin.then(user => {
                        if (user) {
                            return done(undefined, user);
                        } else {
                            return done(undefined, null);
                        }
                    });
                }
            } catch (error) {
                console.log(error);
                return done(undefined, undefined);
            }
        }),
    );
    // };

    passport.serializeUser<any, any>((user, done) => {
        logger.info('serializeUser: ', user);
        done(undefined, user.id);
    });

    passport.deserializeUser((id, done) => {
        logger.info('deserializeUser: ', id);
        done(undefined, id);
    });

    const isAuthenticate = (req: Request, res: Response, next: NextFunction) => {
        passport.authenticate(secretName, { session: false }, (err, user, info) => {
            // console.log('eeeee:', err);
            // console.log('\n info:', info);
            if (err === 'dbError') {
                res.status(500).json({
                    resCode: 500,
                    message: '관리자에게 문의해주세요.',
                    result: [],
                });
            }
            if (user === null || !user || typeof info !== 'undefined') {
                res.status(401).json({
                    resCode: 401,
                    message: 'No auth token',
                    result: [],
                });
            } else {
                req.user = user;
                next();
            }
        })(req, res, next);
    };

    return {
        isAuthenticate,
    };
};
