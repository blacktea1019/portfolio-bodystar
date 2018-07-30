'use strict';

const userInfo = require('../models/userInfo'); // userInfo 테이블 모델
const counter = require('../config/counter'); // 카운터 모듈
/**
 * 대쉬보드에 노출할 상태 값
 *  - 현재 유저
 *  - 방문자 수
 */
module.exports.view = [
    (req, res) => {
        userInfo.currentUsers().then(result => { // 현재 등록된 유저의 갯수를 가져온다.
              res.json({
                currentUsers: result.count, // 현재 등록된 전체 유저 갯수
                visitCount: counter.getCount() // 카운터 모듈에 등록된 전체 방문자 수
              })
        }).catch(err => { // 실패시
            res.json({
                currentUsers: 0,
                visitCount: counter.getCount()
            })
        });
    }
];