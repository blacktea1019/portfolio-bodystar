'use strict';

const managerComment = require('../models/managerComment'); // managerComment 테이블 모델
const managerBoard = require('../models/managerBoard'); // managerBoard 테이블 모델
const { check, validationResult } = require('express-validator/check'); // 파라미터 검증 모듈 ( 리퀘스트로 전달받은 파라미터의 값을 지정하고 검사할 수 있으며, 유효하지 않은 파라미터가 있는 경우 에러가 발생하며 지정한 메시지를 담을 수 있다. )
const _ = require('underscore'); // 유틸리티 함수
const moment = require('moment-timezone'); // 날짜 모듈
const s = require("underscore.string"); // 스트링 유틸 함수

/**
 * 댓글수 증가
 * @param postNo 게시글 번호
 */
function plusCommentCount (postNo) {
    managerBoard.plusCommentCount(postNo).catch(err => { // 댓글수 1 증가
        console.log('ERR plusCommentCount=' + err);
    });
}
/**
 * 댓글 목록 불러오기
 * @param req 리퀘스트
 * @param res 리스폰스
 */
module.exports.list = (req, res) => {
    return managerComment.list(req.body.postNo).then(comments => { // 댓글 목록 불러오기
        res.json(
            _.map(comments, (comment) => {
                return _.extend(comment, {
                    createdAt: moment.unix(comment.createdAt).format("YYYY-MM-DD HH:mm:ss") // 댓글 생성 시간을 유닉스 시간 => 날짜 포맷으로 변경
                })
            })
        );
    }).catch( err => {
        console.log(err);
        res.status(500).json({
            status: 500,
            code: err.code,
            message: '코멘트 조회 중에 오류가 발생하였습니다.'
        })
    });
}
/**
 * 댓글 작성
 */
module.exports.write = [
    [
        check('data.comment').isLength({ min: 1 }).withMessage('코멘트를 입력해주세요.'), // 댓글 내용은 최소 1글자 이상
        check('data.comment').isLength({ max: 400 }).withMessage('코멘트가 너무 깁니다. ( 최대 400자 )') // 댓글 내용은 최대 400 글자 제한
    ],
    (req, res) => {
        let errors = validationResult(req);
        if (!errors.isEmpty()) { // 파라미터 검증에 실패한 경우
            return res.status(422).json({ message: errors.array()[0].msg }); // 실패 사유를 전달
        }
        let params = {
            writerId: req.user.id, // 작성자 아이디
            postNo: req.body.data.postNo, // 게시글 번호
            comment: req.body.data.comment, // 댓글 내용
            createdAt: moment().unix() // 글 생성 시간을 유닉스 시간으로 변환
        };
        return managerComment.insert(params).then(results => { // 댓글 저장
            plusCommentCount(params.postNo); // 댓글 갯수 1 증가
            res.json(
                _.extend(params, {
                    seq: results[0], // 댓글 번호
                    createdAt: moment.unix(params.createdAt).format("YYYY-MM-DD HH:mm:ss") // 글의 생성 시간을 유닉스 시간 => 날짜 포맷으로 변경
                })
            );
        }).catch( err => {
            console.log(err);
            res.status(500).json({
                status: 500,
                code: err.code,
                message: '코멘트 저장 중에 오류가 발생하였습니다.'
            })
        });
    }
];