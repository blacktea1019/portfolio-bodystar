'use strict';

const userInfo = require('../models/userInfo'); // userInfo 테이블 모델
const cryptoUtil = require('../util/cryptoUtil'); // 암호화 유틸
const auth = require('../config/auth'); // 토큰 모듈
const { check, validationResult } = require('express-validator/check'); // 파라미터 검증 모듈 ( 리퀘스트로 전달받은 파라미터의 값을 지정하고 검사할 수 있으며, 유효하지 않은 파라미터가 있는 경우 에러가 발생하며 지정한 메시지를 담을 수 있다. )
const passport = require('passport'); // 권한 모듈
const _ = require('underscore'); // 유틸리티 함수
const moment = require('moment-timezone'); // 날짜 모듈
const s = require("underscore.string"); // 스트링 유틸리티 함수

/**
 * 회원 시작 / 만료 일자 수정
 */
module.exports.time = [
    [
        check('data.id').exists(), // 회원 아이디 존재
        check('data.date').exists(), // 변경할 날짜 존재
        check('data.dateType').exists() // 변경할 날짜 타입 존재
    ],
    (req, res) => {
        if (!validationResult(req).isEmpty()) { // 파라미터 점증에 실패한 경우
            return res.status(422).json({ errors: '파라미터가 잘못 되었습니다.' });
        }
        let dateType = req.body.data.dateType; // 변경할 타입 ( 시작 / 만료 일자 )
        let formatDate = req.body.data.date; // 변경할 날짜
        if (dateType === 'begin') { // 시작 날짜인 경우
            formatDate = formatDate + ' 00:00:00'; // 00 시를 붙여줌
        } else { // 만료 날짜인 경우
            formatDate = formatDate + ' 23:59:59'; // 23 시 59분으로 붙여줌
        }
        userInfo.updateTime({ // 시간 변경
            id: req.body.data.id, // 변경할 회원 아이디
            date: moment(formatDate, "YYYY-MM-DD HH:mm:ss").unix(), // 변경할 날짜를 유닉스 시간으로 변환
            dateType: dateType, // 변경할 데이터 타입
            gymCode: req.user.gymCode // 체육관 코드
        }).then(count => { // 성공시 결과 리턴
            res.json({
                status: 200,
                formatDate: formatDate
            });
        }).catch(err => {
            console.log(err);
            res.status(500).json({
                status: 500,
                code: err.code,
                message: '입/출입 시간 갱신 중에 오류가 발생하였습니다.'
            })
        });
    }
];

/**
 * 검색 파라미터 추출
 * @param req 요청 객체
 */
function makeSearchParam(req) {
    let gymCode = req.user.gymCode; // 체육관 코드
    let limit = parseInt(req.body['length']); // 페이지당 리스트 갯수
    let offset = parseInt(req.body.start); // 페이지 시작 번호
    let column = req.body.column; // 검색할 컬럼 이름
    let keyword = req.body.keyword; // 검색할 키워드
    let sex = req.body.sex || []; // 남녀 성별

    return {
        gymCode: gymCode,
        limit: limit,
        offset: offset,
        column: column,
        keyword: keyword,
        sex: sex
    };
}

module.exports.inoutSearch = [
    [
        check('length').isNumeric(),
        check('start').isNumeric()
    ],
    (req, res) => {
        if (!validationResult(req).isEmpty()) {
            return res.status(422).json({ errors: '파라미터가 잘못 되었습니다.' });
        }
        userInfo.pageInoutUsers(makeSearchParam(req)).then(page => {
            res.json({
                draw: req.body.draw,
                recordsTotal: page.total,
                recordsFiltered: page.total,
                data: _.map(page.data, (each, i) => {
                    return _.extend(each, {
                        no: i +1,
                        inTime: s(each.inTime).isBlank() ? '' : moment.unix(each.inTime).format("YYYY-MM-DD HH:mm:ss"),
                        outTime: s(each.outTime).isBlank() ? '' : moment.unix(each.outTime).format("YYYY-MM-DD HH:mm:ss")
                    });
                })
            });
        }).catch( err => {
            console.log(err);
            res.status(500).json({
                status: 500,
                code: err.code,
                message: '입출입 조회 중에 오류가 발생하였습니다.'
            })
        });
    }
];
/**
 * 회원 등록 / 확인 리스트
 */
module.exports.search = [
    [
        check('length').isNumeric(), // 페이지당 리스트 갯수 파라미터는 정수형인지 체크
        check('start').isNumeric() // 페이지 시작 번호 파라미터는 정수형인지 체크
    ],
    (req, res) => {
        if (!validationResult(req).isEmpty()) { // 파라미터 검증 실패시
            return res.status(422).json({ errors: '파라미터가 잘못 되었습니다.' });
        }
        userInfo.pageGymUsers(makeSearchParam(req)).then(page => { // 회원 리스트 검색
            res.json({
                draw: req.body.draw, // ajax 전송시 임의의 숫자를 주고 받음 ( 여러번 호출시 자신의 번호를 찾기 위함 )
                recordsTotal: page.total,  // 전체 갯수
                recordsFiltered: page.total, // 필터링된 전체 갯수
                data: _.map(page.data, (each, i) => { // 테이블을 그릴 데이타
                    return _.extend(each, {
                        no: i +1, // 리스트 번호 부여
                        membership_begin: s(each.membership_begin).isBlank() ? '' : moment.unix(each.membership_begin).format("YYYY-MM-DD HH:mm:ss"), // 시작일자 시간을 유닉스 시간 => 날짜 포맷으로 변경
                        membership_end: s(each.membership_end).isBlank() ? '' : moment.unix(each.membership_end).format("YYYY-MM-DD HH:mm:ss") // 만료일자 시간을 유닉스 시간 => 날짜 포맷으로 변경
                    });
                })
            });
        }).catch( err => {
            console.log(err);
            res.status(500).json({
                status: 500,
                code: err.code,
                message: '회원 조회 중에 오류가 발생하였습니다.'
            })
        });
    }
];