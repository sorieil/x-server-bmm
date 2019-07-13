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
    };
    // (req: Request, res: Response, next: NextFunction) => {
    passport.use(
        secretName,
        new Strategy(opts, async (jwt_payload, done) => {
            try {
                const serviceAccount = new ServiceAccount();
                const result = serviceAccount.getAdminId(jwt_payload.id);
                return result.then(user => {
                    if (user) {
                        return done(undefined, user);
                    } else {
                        return done(undefined, null);
                    }
                });
            } catch (error) {
                console.log(error);
                // tryCatch(res, error);
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
            if (user === null || !user || typeof info !== 'undefined') {
                res.status(401).json({
                    error: {
                        message: 'No auth token',
                    },
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
