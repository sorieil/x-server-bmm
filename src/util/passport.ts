import { Strategy, ExtractJwt, StrategyOptions } from 'passport-jwt';
import { BusinessEventBridge } from './../entity/mysql/entities/MysqlBusinessEventBridge';
import passport from 'passport';
import { NextFunction, Request, Response } from 'express';
import logger from './logger';
import ServiceAccount from '../service/ServiceAccount';
import ServiceBusinessEventBridge from '../service/ServiceBusinessEventBridge';

// 발급되는 토큰의 타입들( 기존 2.0 api 에서 발급)
export type secretNameType =
    | 'xsync-super'
    | 'xsync-admin'
    | 'xsync-user'
    | 'xsync-scanner'
    | 'xsync-eUser';
export const auth = (secretName: secretNameType) => {
    const opts: StrategyOptions = {
        jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('jwt'), // 어떤 토큰으로 발행을 하는지 체크 해봐야 한다.
        secretOrKey: secretName,
        algorithms: ['HS256'],
    };

    passport.use(
        secretName,
        new Strategy(opts, async (jwtPayload, done) => {
            try {
                const serviceAccount = new ServiceAccount();
                const level = jwtPayload.level;
                console.log(`JWT PAYLOAD <<<<<<<<<<<<< \n`, jwtPayload);

                // 이벤트 아이디가 있어야지만 이용 할 수 있다.
                if (typeof jwtPayload.eventId === 'undefined') {
                    console.log('No eventId');
                    // 토큰에 이벤트 아이디가 없으면, 사용을 할 수 없다.
                    return done('noEventId', null);
                }
                // 토큰의 상태가 유저인지 관리자인지 체크 한다.
                // 관리자 모드와, 앱/웹 모드를 구분 짓는다.
                if (level === 'eUser') {
                    // 유저 모드
                    const user = serviceAccount.getUserId(jwtPayload._id);
                    return user
                        .then(userResult => {
                            if (userResult) {
                                const eventId = jwtPayload.eventId;
                                const service = new ServiceBusinessEventBridge();
                                const businessEventBridge = new BusinessEventBridge();
                                businessEventBridge.eventId = eventId;

                                // 디비에서 등록된 이벤트 아이디(businessId)가 있는지 체크 한다.
                                // 비즈니스 아이디를 발급 해준다.
                                return service
                                    .get(businessEventBridge)
                                    .then(eventResult => {
                                        if (eventResult) {
                                            Object.assign(userResult, {
                                                business: eventResult.business,
                                                eventId: jwtPayload.eventId,
                                            });
                                            return setTimeout(() => {
                                                return done(
                                                    undefined,
                                                    userResult,
                                                );
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
                } else if (level === 'eAdmin') {
                    // If the event ID is different, a new business ID is created.
                    const admin = serviceAccount.getAdminId(jwtPayload);
                    return admin.then(adminResult => {
                        /**
                         *  유저와 같이 eventId 기준으로 Business 를 라우터에넣주지 않는 이유는 비즈니스 인증이 필요 없는 경우도
                         *  있기 때문이고, 유저 같은 경우는 인증을 위해서 무조건 eventId 로 business 인증수단으로 사용하기 때문이다.
                         */

                        if (adminResult) {
                            Object.assign(adminResult, {
                                eventId: jwtPayload.eventId,
                            });
                            return setTimeout(() => {
                                return done(undefined, adminResult);
                            }, 0);
                        } else {
                            return done(undefined, null);
                        }
                    });
                } else {
                    return done('Unknown type token', null);
                }

                // TODO 여기에다가 로그를 기록해야 한다.
            } catch (error) {
                console.log('Passport: ', error);
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

    const isAuthenticate = (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        passport.authenticate(
            secretName,
            { session: false },
            (err, user, info) => {
                if (err === 'dbError') {
                    res.status(500).json({
                        resCode: 500,
                        message: '관리자에게 문의해주세요.',
                    });
                    return;
                }
                // 이벤트 아이디가 없으면, 정지
                if (err === 'noEventId') {
                    res.status(401).json({
                        resCode: 401,
                        message: 'No allow token. It is not event token.',
                    });
                    return;
                }

                if (typeof user === 'undefined' || user === null || !user) {
                    res.status(403).json({
                        resCode: 403,
                        message: 'Members only.',
                    });
                    return;
                }

                // 정상 토큰이 아닙니다.
                if (typeof info !== 'undefined') {
                    res.status(401).json({
                        resCode: 401,
                        message: 'No auth token',
                    });
                    return;
                } else {
                    // Pass through
                    // req.user = user;
                    // 여기에서 login 으로 할 수 있는데 login 은 express 의 내부 함수이기도 해서 user 로 했다.
                    // 그리서 req 로 불러 올때  req.user.users[0] or req.user.admin[0] 이런식으로 사용해야 한다.
                    // console.log('============= :', user);
                    Object.assign(req, { user: user });
                    // 맨 마지막에 실행 되게 하기 위해서
                    setTimeout(() => {
                        next();
                    }, 0);
                }
            },
        )(req, res, next);
    };

    return {
        isAuthenticate,
    };
};
