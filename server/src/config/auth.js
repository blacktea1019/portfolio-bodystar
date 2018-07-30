'use strict';

const jwt = require('jsonwebtoken'); // jwt 모듈
const SECRET = '5db70f2aaf47ee645db70f2aaf47ee645db70f2aaf47ee645db70f2aaf47ee645db70f2aaf47ee645db70f2aaf47ee64'; // 토큰 생성시 사용할 키
/**
 * 토큰 시간
 */
const EXPIRES_ACCESS = '30m'; // 액세스 토큰 파기 시간
/**
 * 해당 시간 동안 아무런 요청이 없었다면, 다시 로그인을 해야 한다.
 */
const EXPIRES_REFRESH = '120m'; // 리프레시 토큰 파기 시간
const DIGEST = 'HS256'; // 토큰 암호화 방식
/**
 * 액세스 토큰 생성 ( id, permission 포함 )
 * @param user 사용자 정보
 */
exports.signToken = (user) => {
    return jwt.sign({id: user.id, permission: user.permission}, SECRET, {expiresIn: EXPIRES_ACCESS, algorithm: DIGEST});
};
/**
 * 리프레시 토큰 생성 ( id 포함 )
 * @param user 사용자 정보
 * @returns {*}
 */
exports.signRefreshToken = (user) => {
    return jwt.sign({id: user.id}, SECRET, {expiresIn: EXPIRES_REFRESH, algorithm: DIGEST})
};
/**
 * 토큰 검증
 * @param token 검증할 토큰
 * @param callback 실패시에 호출할 콜백 함수
 */
exports.verifyToken = (token, callback) => {
    jwt.verify(token, SECRET, (err, decoded) => {
        callback(err, decoded);
    });
};
/**
 * 토큰 검증을 동기화
 * @param token 검증할 토큰
 */
exports.verifyTokenSync = (token) => {
    try {
        return jwt.verify(token, SECRET);
    } catch (err) {
        return null;
    }
};
/**
 *  토큰 디코드
 * @param token 디코드할 토큰
 */
exports.decodeToken = (token) => {
    return jwt.decode(token);
};
