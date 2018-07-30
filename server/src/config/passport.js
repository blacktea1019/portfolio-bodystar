'use strict';

const passport = require('passport'); // 패스포트 권한 모듈
const LocalStrategy = require('passport-local').Strategy; // 아이디 & 패스워드 인증
const BearerStrategy = require('passport-http-bearer').Strategy; // http 헤더 인증
const managerInfo = require('../models/managerInfo'); // managerInfo 테이블 모델
const cryptoUtil = require('../util/cryptoUtil'); // 암호화 유틸
const auth = require('../config/auth'); // 토큰 모듈
const _ = require('underscore'); // 유틸 함수
/**
 * 토큰 검증
 * @param accessToken 액세스 토큰
 * @param done 다음 미들웨어 전달
 * @param permission 권한
 */
function verifyToken(accessToken, done, permission) {
    auth.verifyToken(accessToken, (err, decoded) => {
        if (err) { // 토큰이 유효하지 않은 경우
            return done(_.extend(err, { // 에러 응답
                statusCode: 401,
                code: err.name,
                type: err.message
            }));
        }
        managerInfo.findById(decoded.id) // 토큰 내 아이디로 사용자 조회
            .then(user => {
                return permissionCheck(permission, user, accessToken, done); // 권한 체크
            })
            .catch(err => {
                return done(err, false)
            });
    });
}
/**
 * 권한 체크
 * @param permission 제한할 권한
 * @param user 사용자 정보
 * @param accessToken 액세스 토큰
 * @param done 다음 미들웨어 전달
 */
function permissionCheck(permission, user, accessToken, done) {
    if (!user) { // 사용자를 찾을 수 없는 경우
        return done({
            statusCode: 403,
            code: 'invalid_client',
            type: '등록된 사용자가 아닙니다.'
        }, false);
    }
    if (accessToken !== user.accessToken) { // 디비에 저장된 액세스 토큰과 다를 경우
        return done({
            statusCode: 403,
            code: 'invalid_grant',
            type: '액세스 토큰이 유효하지 않습니다.'
        }, false);
    }
    if (!auth.verifyTokenSync(user.refreshToken)) { // 리프레시 토큰이 유효하지 않은 경우
        return done({
            statusCode: 403,
            code: 'invalid_grant',
            type: '리프레시 토큰이 만료되었습니다.'
        }, false);
    }
    if (parseInt(user.permission) < permission) { // 제한할 권한보다 작은 경우
        return done({
            statusCode: 403,
            code: 'invalid_scope',
            type: '접근 권한이 없습니다.'
        }, false);
    }
    return done(null, user); // 모두 통과시 다음 미들웨어 호출
}

passport.use('bearer-refresh', new BearerStrategy( // 토큰 갱신 요청 시
    (refreshToken, done) => {
        auth.verifyToken(refreshToken, (err, decoded) => { // 리프레쉬 토큰 검증
            if (err) { // 토큰이 유효하지 않은 경우 에러 응답
                console.log('ERR bearer-refresh#refreshToken=' + refreshToken);
                return done(_.extend(err, {
                    statusCode: 401,
                    code: err.name,
                    type: err.message
                }));
            }
            managerInfo.findById(decoded.id) // 해당하는 사용자 조회
                .then(user => {
                    if (!user) { // 유저가 존재하지 않는 경우
                        return done({
                            statusCode: 403,
                            code: 'invalid_client',
                            type: '등록된 사용자가 아닙니다.'
                        }, false);
                    }
                    return done(null, user); // 성공시 다음 미들웨어 처리
                })
                .catch(err => {
                    return done(err, false)
                });
        });
    }
));

passport.use('bearer-admin-check', new BearerStrategy( // 어드민 권한 체크
    (accessToken, done) => {
        verifyToken(accessToken, done, 9); // 퍼미션 9 이상
    }
));

passport.use('bearer-manager-check', new BearerStrategy( // 매니저 체크
    (accessToken, done) => {
        verifyToken(accessToken, done, 1); // 퍼미션 1이상
    }
));

passport.use(new BearerStrategy( // 일반 사용자 체크
    (accessToken, done) => {
        verifyToken(accessToken, done, 0); // 퍼미션 0 이상
    }
));

passport.use(new LocalStrategy({ // 아아디, 비밀번호를 사용한 인증
        usernameField: 'id', // id 파라미터 이름
        passwordField: 'password' // password 파라미터 이름
    },
    (id, password, done) => {
        managerInfo.findById(id).then((user) => { // 아이디로 사용자 조회
            if (!user) { // 사용자를 찾을 수 없는 경우
                return done({
                  statusCode: 422,
                  code: 'invalid_id',
                  type: '존재하지 않는 아이디입니다.'
                }, false);
            }
            let encryptPassword = cryptoUtil.encryptPassword(password, user.salt); // 전달받은 비밀번호 암호화
            if (user.password !== encryptPassword) { // 비밀 번호가 다르면
                return done({
                  statusCode: 422,
                  code: 'invalid_password',
                  type: '비밀번호가 일치하지 않습니다.'
                }, false);
            }
            // 로그인 성공
            return done(null, user);
        }).catch( err => {
            // 조회 중 에러 발생
            done(err)
        });
    }
));

/**
 *  passport 내에서 후속 요청이 있을 때를 대비하여, 인증이 완료된 사용자의 id 를 담는다.
 *      - 직렬화 :  데이터 구조나 오브젝트 상태를 다른 환경에 저장하고 나중에 재구성할 수 있는 포맷으로 변환하는 과정이다.
 *                   여기서는 사용자 id 가 유일하기 때문에, id 만 저장하고 나중에 id 로 조회하여 재구성할 수 있게 하였다.
 */
passport.serializeUser((user, done) =>  done(null, user.id)); // 사용자 객체 직렬화
/**
 * passport 내에서 후속 요청이 있을 때를 대비하여, serializeUser 에서 저장한 id 를 가지고 사용자를 찾을 방법을 정의한다.
 *      - 역직렬화 : 직렬화의 반대이며, 직렬화로 id 를 저장했다면, 해당 id 를 가지고 원래의 사용자 객체를 만드는 과정이다.
 */
passport.deserializeUser((id, done) => {
    managerInfo.findById(id, (error, user) => done(error, user)); // 사용자 객체 역 직렬화
});