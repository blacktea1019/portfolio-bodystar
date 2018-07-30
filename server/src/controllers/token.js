'use strict';

const managerInfo = require('../models/managerInfo');
const auth = require('../config/auth');
/**
 * 토큰 리프레쉬
 * @param req 요청 객체
 * @param res 응답 객체
 */
module.exports.refresh = (req, res) => {
    let accessToken = auth.signToken(req.user); // 액세스 토큰 발급
    let refreshToken = auth.signRefreshToken(req.user); // 리프레쉬 토큰 발급

    managerInfo.updateTokens(req.user, accessToken, refreshToken).then(result => { // 토큰 저장
        res.json({ // 발급한 토큰 응답
            accessToken: accessToken,
            refreshToken: refreshToken
        });
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            status: 500,
            code: err.code,
            message: '토큰 갱신 진행 중에 오류가 발생하였습니다.'
        });
    });
};