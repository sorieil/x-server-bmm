import { BusinessEventBridge } from './../entity/mysql/entities/MysqlBusinessEventBridge';
import _ from 'lodash';
import { Strategy, ExtractJwt, StrategyOptions } from 'passport-jwt';
import passport from 'passport';
import { NextFunction, Request, Response } from 'express';
import logger from './logger';
import ServiceAccount from '../service/ServiceAccount';
import { tryCatch } from './common';
import ServiceBusinessEventBridge from '../service/ServiceBusinessEventBridge';
export type secretNameType =
    | 'xsync-super'
    | 'xsync-admin'
    | 'xsync-user'
    | 'xsync-guest'
    | 'xsync-scanner'
    | 'xsync-eUser';
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
            // console.log('jwt_payload:', jwt_payload);

            try {
                const serviceAccount = new ServiceAccount();
                const level = jwt_payload.level;

                // 이벤트 아이디가 있어야지만 이용 할 수 있다.
                if (typeof jwt_payload.eventId === 'undefined') {
                    console.log('jwt_payload.eventId:', jwt_payload.eventId);
                    return done('noEventId', null);
                }
                // 토큰의 상태가 유저인지 관리자인지 체크 한다.
                if (level === 'eUser') {
                    const user = serviceAccount.getUserId(jwt_payload._id);
                    return user
                        .then(r => {
                            if (r) {
                                const eventId = jwt_payload.eventId;
                                const service = new ServiceBusinessEventBridge();
                                const businessEventBridge = new BusinessEventBridge();
                                businessEventBridge.eventId = eventId;

                                // 디비에서 등록된 이벤트 아이디(businessId)가 있는지 체크 한다.
                                // 비즈니스 아이디를 발급 해준다.
                                return service.get(businessEventBridge).then(rr => {
                                    if (rr) {
                                        Object.assign(r, { business: rr.business });
                                        return setTimeout(() => {
                                            return done(undefined, r);
                                        }, 0);
                                    } else {
                                        // 등록된 business가 없는경우...
                                        // 이벤트 아이디는 유저가 이벤트에 처음 진입하게 되면
                                        // 기존 몽고디비 기반 서비스에서 바로 등록이 되고, 
                                        console.log('유효하지 않은 이벤트');
                                        // 유효하지 않은 이벤트라고 표시한다.
                                        return done('noEventId', null);
                                    }
                                });
                            } else {
                                return done(undefined, null);
                            }
                        })
                        .catch(error => {
                            console.log('passport error:', error);
                            return done('dbError', null);
                        });
                } else {
                    const admin = serviceAccount.getAdminId(jwt_payload._id);
                    return admin.then(r => {
                        /**
                         *  유저와 같이 eventId 기준으로 Business 를 라우터에넣주지 않는 이유는 비즈니스 인증이 필요 없는 경우도
                         *  있기 때문이고, 유저 같은 경우는 인증을 위해서 무조건 eventId 로 business 인증수단으로 사용하기 때문이다.
                         */

                        if (r) {
                            Object.assign(r, { eventId: jwt_payload.eventId });
                            // 여기에서 setTimeout 으로 처리하는 이유는 위 오브젝트의 연산시 패스하고
                            // 바로 결과로 넘어 갈 수 있어서 확실히 하기 위해서 setTimeout은 코어 스크립트
                            // 에서 제일 마지막에 실행되기 때문에 코드를 이렇게 해놨다. (그냥 혹시나 하는 마음에..)
                            // 혹시라도 불안해서.. node 의 불안요소때문에..ㅎㅎ
                            return setTimeout(() => {
                                return done(undefined, r);
                            }, 0);
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
            // console.log('\n info:', info);
            if (err === 'dbError') {
                res.status(500).json({
                    resCode: 500,
                    message: '관리자에게 문의해주세요.',
                });
                return;
            }

            if (err === 'noEventId') {
                res.status(401).json({
                    resCode: 401,
                    message: 'No allow token. It is not event token.',
                });
                return;
            }

            if (user === null || !user || typeof info !== 'undefined') {
                res.status(401).json({
                    resCode: 401,
                    message: 'No auth token',
                });
                return;
            } else {
                // req.user = user;
                Object.assign(req, { user: user });
                // 맨 마지막에 실행 되게 하기 위해서
                setTimeout(() => {
                    next();
                }, 0);
            }
        })(req, res, next);
    };

    return {
        isAuthenticate,
    };
};
