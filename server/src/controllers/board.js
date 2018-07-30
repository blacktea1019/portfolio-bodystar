'use strict';

const managerBoard = require('../models/managerBoard'); // managerBoard 테이블 모델
const cryptoUtil = require('../util/cryptoUtil'); // 암호화 유틸
const auth = require('../config/auth'); // 토큰 모듈
const { check, validationResult } = require('express-validator/check'); // 파라미터 검증 모듈 ( 리퀘스트로 전달받은 파라미터의 값을 지정하고 검사할 수 있으며, 유효하지 않은 파라미터가 있는 경우 에러가 발생하며 지정한 메시지를 담을 수 있다. )
const _ = require('underscore'); // 유틸리티 함수
const moment = require('moment-timezone'); // 날짜 모듈
const s = require("underscore.string"); // 스트링 유틸 함수
/**
 * 검색 파라미터 추출
 * @param req 리퀘스트
 */
function makeSearchParam(req) {
    let limit = parseInt(req.body['length']); // 페이지당 노출 갯수
    let offset = parseInt(req.body.start); // 페이지 시작 번호
    let column = req.body.column; // 검색할 컬럼
    let keyword = req.body.keyword; // 검색할 키워드

    return {
        limit: limit,
        offset: offset,
        column: column,
        keyword: keyword,
    };
}
/**
 * 게시글 조회 수
 * @param seq 게시글 seq
 */
function plusViewCount (seq) {
    managerBoard.plusViewCount(seq).then(cnt => {}).catch(err => {
        console.log('ERR updateViewCount=' + err);
    });
}
/**
 * 게시글 삭제
 */
module.exports.delete = [
    (req, res) => {
        let seq = req.params.seq; // 게시글 번호

        managerBoard.findByIdwithWriterId(seq, req.user.id) // 본인 아이디와 게시글 번호로 조회
            .then(post => {
                if (!post) { // 게시글을 찾을 수 없는 경우 ( 본인이 작성한 글이 아닌 경우 )
                    return Promise.reject({ code: 'invalid_grant'});
                }
                return managerBoard.deleteWithComments(seq); // 글과 댓글 삭제
            })
            .then(result => { // 성공
                res.json({status: 200});
            })
            .catch(err => { // 실패
                console.log(err);
                if (err.code === 'invalid_grant') {
                    return res.status(422).json({
                        status: 422,
                        code: err.code,
                        message: '본인이 작성한 글만 삭제할 수 있습니다.'
                    })
                }
                res.status(500).json({
                    status: 500,
                    code: err.code,
                    message: '게시글 삭제 중에 오류가 발생하였습니다.'
                })
            });
    }
];
/**
 * 게시글 작성
 */
module.exports.write = [
    [
        check('data.title').isLength({ min: 1 }).withMessage('제목을 입력해주세요.'), // 제목 검증 ( 최소 1글자 이상 )
        check('data.title').isLength({ max: 200 }).withMessage('제목이 너무 깁니다. ( 최대 200자 )'), // 제목 검증 ( 최대 200 글자 제한 )
        check('data.content').isLength({ min: 1 }).withMessage('내용을 입력해주세요.') // 내용 검증 ( 최소 1글자 이상 )
    ],
    (req, res) => {
        let errors = validationResult(req);
        if (!errors.isEmpty()) { // 검증 실패시
            return res.status(422).json({ message: errors.array()[0].msg }); // 검증 실패 결과를 리턴
        }
        let seq = req.params.seq; // 게시글 번호

        let params = {
            title: req.body.data.title, // 제목
            writerId: req.user.id, // 작성자 아이디
            createdAt: moment().unix(), // 글 생성 시간을 유닉스 시간으로 변환
            content: req.body.data.content // 내용
        };

        if (s(req.params.seq).isBlank()) { // 신규 작성
            return managerBoard.insertPost(params).then(result => { // 게시글 저장
                res.json({ status: 200, seq: seq });
            }).catch( err => {
                console.log(err);
                res.status(500).json({
                    status: 500,
                    code: err.code,
                    message: '게시글 저장 중에 오류가 발생하였습니다.'
                })
            });
        } else { // 수정
            params.seq = seq;
            return managerBoard.updatePost(params).then(result => { // 게시글 수정
                res.json({ status: 200, seq: seq });
            }).catch( err => {
                console.log(err);
                res.status(500).json({
                    status: 500,
                    code: err.code,
                    message: '게시글 수정 중에 오류가 발생하였습니다.'
                })
            });
        }
    }
];

/**
 * 게시글 내용 가져오기
 */
module.exports.post = [
    (req, res) => {
        let seq = req.params.seq; // 글 번호
        managerBoard.findById(seq) // 글 번호로 조회
            .then(post => {
                if (!post) { // 게시글을 찾을 수 없는 경우
                    return res.status(422).json({ errors: '게시글이 존재하지 않습니다.' });
                }
                res.json(post);
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({
                    status: 500,
                    code: err.code,
                    message: '게시글을 가져오는 중에 오류가 발생하였습니다.'
                })
            });
    }
];
/**
 * 게시글 전체 보기
 *     - 게시글 정보
 *     - 이전글 / 다음글 정보
 */
module.exports.view = [
    (req, res) => {
        let seq = req.params.seq; // 게시글 번호
        managerBoard.findByIdWithRelatedPosts(seq) // 게시글 & 이전/다음 글 가져오기
            .then(posts => {
                let formatPosts = _.map(posts, (post) => { // 글의 생성 시간을 유닉스 시간 => 날짜 포맷으로 변경
                    return _.extend(post, {createdAt: moment.unix(post.createdAt).format("YYYY-MM-DD HH:mm:ss")});
                });
                let result = {
                    post: _.find(formatPosts, (post) => parseInt(post.seq) === parseInt(seq)), // 원글
                    prv: _.find(formatPosts, (post) => parseInt(post.seq) < parseInt(seq)), // 이전글
                    next: _.find(formatPosts, (post) => parseInt(post.seq) > parseInt(seq)) // 다음글
                };
                if (!result.post) { // 원글을 찾을 수 없는 경우
                    return res.status(422).json({ message: '게시글이 존재하지 않습니다.' });
                }
                plusViewCount(seq); // 조회수 1 증가

                res.json(result); // 결과 전송
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({
                    status: 500,
                    code: err.code,
                    message: '게시글을 가져오는 중에 오류가 발생하였습니다.'
                })
            });
    }
];
/**
 * 게시글 검색
 */
module.exports.search = [
    [
        check('length').isNumeric(), // 페이지당 보여줄 갯수
        check('start').isNumeric() // 페이지 시작 번호
    ],
    (req, res) => {
        if (!validationResult(req).isEmpty()) { // 파라미터 검증에 실패한 경우
            return res.status(422).json({ errors: '파라미터가 잘못 되었습니다.' });
        }
        managerBoard.page(makeSearchParam(req)).then(page => { // 검색 파라미터 전달
            res.json({
                draw: req.body.draw, // ajax 전송시 임의의 숫자를 주고 받음 ( 여러번 호출시 자신의 번호를 찾기 위함 )
                recordsTotal: page.total, // 전체 갯수
                recordsFiltered: page.total, // 필터링된 전체 갯수
                data: _.map(page.data, (each, i) => { // 테이블을 그릴 데이타
                    return _.extend(each, {
                        createdAt: moment.unix(each.createdAt).format("YYYY-MM-DD HH:mm:ss") // 글의 생성 시간을 유닉스 시간 => 날짜 포맷으로 변경
                    });
                })
            });
        }).catch( err => {
            console.log(err);
            res.status(500).json({
                status: 500,
                code: err.code,
                message: '게시글 조회 중에 오류가 발생하였습니다.'
            })
        });
    }
];