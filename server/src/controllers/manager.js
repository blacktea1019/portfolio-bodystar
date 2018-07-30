'use strict';

const managerInfo = require('../models/managerInfo'); // managerInfo 테이블 모델
const cryptoUtil = require('../util/cryptoUtil'); // 암호화 유틸
const auth = require('../config/auth'); // 토큰 모듈
const { check, validationResult } = require('express-validator/check'); // 파라미터 검증 모듈 ( 리퀘스트로 전달받은 파라미터의 값을 지정하고 검사할 수 있으며, 유효하지 않은 파라미터가 있는 경우 에러가 발생하며 지정한 메시지를 담을 수 있다. )
const passport = require('passport'); // 권한 인증 모듈
const _ = require('underscore'); // 유틸리티 함수
const moment = require('moment-timezone'); // 날짜 모듈
const counter = require('./../config/counter'); // 카운터 모듈

/**
 * 로그아웃 처리
 * @param req 요청 객체
 * @param res 응답 객체
 * @param next 다음 미들웨어 전달 함수
 */
module.exports.logout = (req, res, next) => {
    managerInfo.updateTokens(req.user, '', '').then(result => { // 액세스 / 리프레쉬 토큰 삭제
        res.json({status: 200});
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            status: 500,
            code: err.code,
            message: '로그아웃 진행 중에 오류가 발생하였습니다.'
        });
    });
};
/**
 * 로그인 함수
 * @param req 요청 객체
 * @param res 응답 객체
 * @param next 다음 미들웨어 전달 함수
 */
module.exports.login = (req, res, next) => {
    passport.authenticate('local', { session: false }, (err, user, info) => { // 권한 인증
        if (err) { // 권한 인증 실패 시
            return res.json({ // 실패 오류 전달
              status: err.statusCode,
              code: err.code,
              message: err.type
            });
        }
        if (!user) { // 파라미터가 제대로 전달되지 않은 경우
          return res.json({
            status: 422,
            code: 'invalid_grant',
            message: '아이디가 존재하지 않거나 패스워드가 일치하지 않습니다.'
          });
        }

        let accessToken = auth.signToken(user); // 액세스 토큰 생성
        let refreshToken = auth.signRefreshToken(user); // 리프레쉬 토큰 생성

        managerInfo.updateTokens(user, accessToken, refreshToken).then(result => { // 토큰 저장
            counter.hit(); // 방문자 수 1증가
            res.json({ // 생성한 토큰 응답에 추가
                accessToken: accessToken,
                refreshToken: refreshToken,
            });
        }).catch(err => {
            console.log(err);
            res.status(500).json({
                status: 500,
                code: err.code,
                message: '로그인 진행 중에 오류가 발생하였습니다.'
            });
        });

    })(req, res, next);
};
/**
 * 권한 승인
 */
module.exports.permission = [
    [
        check('data.id').isLength({ min: 3 }), // 아이디는 최소 3자 이상
        check('data.permission').matches(/^[01]{1}$/) // 퍼미션은 0,1 만 허용
    ],
    (req, res) => {
        if (!validationResult(req).isEmpty()) { // 파라미터 검증에 통과하지 못한 경우
            return res.status(422).json({ message: '파라미터가 잘못 되었습니다.' });
        }
        let id = req.body.data.id; // 권한을 변경할 아이디
        let permission = req.body.data.permission; // 변경할 권한
        managerInfo.updatePermission(id, permission).then(result => { // 권한 변경
            if (result === 0) { // 권한을 변경할 대상을 찾지 못한 경우
                return res.json({
                    status: 422,
                    code: 'NOT_FOUND_USER',
                    message: '사용자를 찾을 수 없습니다.'
                })
            }
            res.json({ // 권한 변경 성공
                status: 200
            })
        }).catch(err => {
            console.log(err);
            res.status(500).json({
                status: 500,
                code: err.code,
                message: '승인 취소 진행 중에 오류가 발생하였습니다.'
            });
        });
    }
];
/**
 * 회원 삭제
 */
module.exports.delete = [
    [check('data.id').isLength({ min: 3 })], // 회원 아이디는 최소 3자 이상
    (req, res) => {
        if (!validationResult(req).isEmpty()) { // 파라미터 검증에 통과하지 못한 경우
            return res.status(422).json({ errors: '파라미터가 잘못 되었습니다.' });
        }
        var params = {
            id: req.body.data.id, // 삭제할 아이디
            gymCode: req.user.gymCode // 체육관 코드 ( 삭제 요청한 요청자의 체육관 코드와 사용자가 일치할 경우만 삭제 )
        };
        managerInfo.deleteManager(params).then(cnt => { // 삭제 요청
            res.json({status: 200});
        }).catch(err => {
            console.log(err);
            res.status(500).json({
                status: 500,
                code: err.code,
                message: '회원 삭제 진행 중에 오류가 발생하였습니다.'
            });
        });
    }
];
/**
 * 권한 부여하거나 삭제할 회원 검색
 */
module.exports.search = [
    [
        check('length').isNumeric(), // 페이지당 리스트 갯수는 숫자로 존재
        check('start').isNumeric() // 페이지 시작 번호는 숫자로 존재
    ],
    (req, res) => {
        if (!validationResult(req).isEmpty()) { // 파라미터 검증에 실패한 경우
            return res.status(422).json({ errors: '파라미터가 잘못 되었습니다.' });
        }
        let gymCode = req.user.gymCode; // 요청한 사람과 같은 체육관 코드인 것만 보임.
        let limit = parseInt(req.body['length']); // 페이지당 리스트 갯수
        let offset = parseInt(req.body.start); // 페이지 시작 번호
        let column = req.body.type; // 검색할 컬럼
        let keyword = req.body.keyword; // 검색할 키워드

        let params = {
            gymCode: gymCode, // 체육관 코드
            limit: limit, // 페이지당 리스트 갯수
            offset: offset, // 페이지 시작 번호
            column: column, // 검색할 컬럼
            keyword: keyword, // 검색할 키워드
        };

        managerInfo.pageGymUsers(params).then(page => { // 체육관 내 매니저 검색
            res.json({
                draw: req.body.draw, // ajax 전송시 임의의 숫자를 주고 받음 ( 여러번 호출시 자신의 번호를 찾기 위함 )
                recordsTotal: page.total,// 전체 갯수
                recordsFiltered: page.total, // 필터링된 전체 갯수
                data: _.map(page.data, (each, i) => _.extend(each, { // 테이블을 그릴 데이타
                    no: i +1, // 리스트 번호
                    joinDate: moment.unix(each.joinDate).format("YYYY-MM-DD HH:mm:ss"), // 가입일자 시간을 유닉스 시간 => 날짜 포맷으로 변경
                    oriDate: each.joinDate // 가입일자 유닉스 시간
                }))
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
/**
 * 회원 가입 > 아이디 중복 체크
 */
module.exports.exists = [
    [check('id').isLength({ min: 3 })], // 아이디는 최소 3글자 이상
    (req, res) => {
        if (!validationResult(req).isEmpty()) { // 파라미터 검증에 실패한 경우
            return res.status(422).json({ errors: '파라미터가 잘못 되었습니다.' });
        }
        managerInfo.findById(req.body.id).then((user) => { // 전달받은 아이디로 디비에 존재하는 지 조회
            res.json({
                status: 200,
                id: req.body.id,
                exists: !!user // 유저 존재 여부 플래그 값
            });
        }).catch( err => {
            res.status(500).json({ errors: err.message })
        });
    }
];
/**
 * 회원 가입
 */
module.exports.register = [
    [
        check('data.id').matches(/^[A-Za-z0-9]{3,20}$/).withMessage('아이디가 형식에 맞지 않습니다. <br/>(3~20글자, 영문, 숫자만 입력 가능)'), // 아이디 패턴 정규식 체크
        check('data.name').isLength({ min: 1, max: 20 }).withMessage('이름이 형식에 맞지 않습니다.<br/>(1~20글자)'), // 이름 제한 길이 체크
        check('data.phone').matches(/^\d{3}-\d{3,4}-\d{4}$/).withMessage('폰번호가 형식에 맞지 않습니다.'), // 폰번호 패턴 정규식 체크
        check('data.email').isEmail().withMessage('이메일이 형식에 맞지 않습니다.'), // 이메일 패턴 정규식 체크
        check('data.consentTerms').isBoolean().withMessage('약관에 동의해 주세요.'), // 약관 동의 여부 체크
        check('data.password').matches(/^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*()\-+`~_=<>:"'?/{}\[\]\\])[a-zA-Z0-9!@#$%^&*()\-+`~_=<>:"'?/{}\[\]\\]{8,12}$/).withMessage('비밀번호가 형식에 맞지 않습니다. <br/> (8~12글자, 영문/숫자/특수문자 포함, 대소문자 구분함)') // 패스워드 패턴 정규식 체크
    ],
    (req, res) => {
        const errors = validationResult(req); // 가입시 입력한 데이타가 검증에 통과하지 못한 경우
        if (!errors.isEmpty()) {
            return res.status(422).json({
                status: 422,
                code: "VALIDATE_ERROR",
                message: (errors.array()[0]).msg // 검증 실패 에러를 응답
            });
        }

        const data = req.body.data; // 가입시 입력한 전제 데이타
        const salt = cryptoUtil.randomString(16); // 솔트로 사용할 랜덤 스트링 16자
        const encryptPwd = cryptoUtil.encryptPassword(data.password, salt); // 솔트를 사용한 비밀번호 암호화

        data.password = encryptPwd; // 암호화된 비밀번호
        data.salt = salt; // 솔트
        data.joinDate = moment().unix(); // 가입 시간

        managerInfo.create(data).then(result => { // 유저 생성
            let accessToken = auth.signToken({id: data.id, permission: 0}); // 기본 퍼미션은 0으로 주어 액세스 토큰 생성
            let refreshToken = auth.signRefreshToken({id: data.id}); // 리프레쉬 토큰 생성

            managerInfo.updateTokens({id: data.id}, accessToken, refreshToken).then(result => { // 생성한 토큰 저장
                res.json({ // 토큰을 응답으로 보냄
                    status: 200,
                    accessToken: accessToken,
                    refreshToken: refreshToken,
                });
            }).catch(err => {
                console.log(err);
                res.status(500).json({
                    status: 500,
                    code: err.code,
                    message: '회원 가입 중에 오류가 발생하였습니다.'
                });
            });
        }).catch( err => {
            console.log(err);
            var msg = '회원 가입 중에 오류가 발생하였습니다.';
            if (err.code === 'ER_DUP_ENTRY') {
                msg = '이미 가입된 아이디가 존재합니다.'
            }
            res.status(500).json({
                status: 500,
                code: err.code,
                message: msg
            })
        });
    }
];