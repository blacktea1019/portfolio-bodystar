'use strict';

const props = require('../config/properties'); // 설정 값 불러오기
const axios = require('axios'); // http 클라이언트
/**
 * 체육관 검색 API 호출
 * @param req 요청 객체
 * @param res 응답 객체
 */
module.exports.search = (req, res) => {
    if (!req.body.gymName || req.body.gymName.trim().length == 0 ) { // 검색할 체육관 이름이 없는 경우
        return res.json({ "data": [] }); // 빈리스트 전달
    }
    axios.post(props.api['/getGymList'].url, {name: req.body.gymName}).then(result => { // 체육관 이름을 담아 API 호출
        if (result.data && Array.isArray(result.data.response)) { // 결과가 있는 경우
            return res.json({ "data": result.data.response })
        }
        res.json({ "data": [] });
    }).catch(err => {
        console.log(err)
    });
};