'use strict';

const express = require('express'); // 익스프레스 코어
const router = express.Router(); // 라우팅 모듈
const gym = require('./../controllers/gym'); // 체육관 컨트롤러
const manager = require('./../controllers/manager'); // 관리자 컨트롤러
const user = require('./../controllers/user'); // 유저 컨트롤러
const board = require('./../controllers/board'); // 게시판 컨트롤러
const comment = require('./../controllers/comment'); // 댓글 컨트롤러
const token = require('./../controllers/token'); // 토큰 갱신 컨트롤러
const status = require('./../controllers/status'); // 대쉬보드 통계 컨트롤러
const auth = require('./../config/auth'); // 토큰 모듈
const passport = require('passport'); // 권한 모듈
const managerInfo = require('../models/managerInfo'); // managerInfo 테이블 모델

const defaultAuth = passport.authenticate('bearer', { session: false }); // 기본 권한
const managerAuth = passport.authenticate('bearer-manager-check', { session: false }); // 관리자 권한
const adminAuth = passport.authenticate('bearer-admin-check', { session: false }); // 어드민 권한
const refreshTokenAuth = passport.authenticate('bearer-refresh', { session: false }); // 토큰 갱신 권한

/**
 * 회원 가입 > 체육관 검색
 */
router.post('/gym/search', gym.search);
/**
 * 회원 가입 > 중복 아아디 체크
 */
router.post('/manager/exists', manager.exists);
/**
 * 회원 가입 > 저장
 */
router.post('/manager/register', manager.register);
/**
 * 로그인
 */
router.post('/manager/login', manager.login);
/**
 * token 갱신
 */
router.post('/token/refresh', refreshTokenAuth, token.refresh);
/**
 * 로그아웃
 */
router.post('/manager/logout', defaultAuth, manager.logout);
/**
 * 통계 ( 현재 유저수 , 사이트 방문자 수 )
 */
router.post('/status', defaultAuth, status.view);
/**
 * 회원 등록 확인/추가 > 리스트
 */
router.post('/user/search', managerAuth, user.search);
/**
 * 회원 등록 확인/추가 > 시작/만료 일자 수정
 */
router.post('/user/time', managerAuth, user.time);
/**
 * 회원 입/출입 확인 > 리스트
 */
router.post('/user/inout/search', managerAuth, user.inoutSearch);
/**
 * 게시판 > 리스트
 */
router.post('/board/search', managerAuth, board.search)
/**
 * 게시판 > 글 보기 ( 코멘트, 이전/다음글 포함 )
 */
router.post('/board/:seq(\\d+)', managerAuth, board.view)
/**
 * 게시판 > 글 작성
 */
router.post('/board/write/:seq(\\d+)?', managerAuth, board.write)
/**
 * 게시판 > 글 가져오기
 */
router.post('/board/post/:seq(\\d+)', managerAuth, board.post)
/**
 * 게시판 > 글 삭제
 */
router.post('/board/post/delete/:seq(\\d+)', managerAuth, board.delete)
/**
 * 코멘트 > 작성
 */
router.post('/comment/write', managerAuth, comment.write)
/**
 * 코멘트 > 리스트
 */
router.post('/comments', managerAuth, comment.list)
/**
 * 권한 부여 > 매니저 리스트
 */
router.post('/manager/search', adminAuth, manager.search)
/**
 * 권한 부여 > 매니저 삭제
 */
router.post('/manager/delete', adminAuth, manager.delete)
/**
 * 권한 부여 > 승인 하기 / 승인 취소
 */
router.post('/manager/permission', adminAuth, manager.permission)

module.exports = router;