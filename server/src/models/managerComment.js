'use strict';

const knex = require('../config/knex'); // sql 실행 모듈
const auth = require('./../config/auth'); // 토큰 모듈
const s = require("underscore.string"); // 스트링 유틸리티 함수

/**
 *  게시판 > 댓글 ManageComment 테이블 모델
 */
module.exports = {
  /**
   * 댓글 추가
   */
    insert (params) {
        return knex.insert(params).into('ManagerComment') // 댓글 테이블에 댓글 데이타 저장
    },
  /**
   * 댓글 리스트 보기
   * @param postNo 게시글 번호
   */
    list (postNo) {
        return knex.select('*').from('ManagerComment') // 댓글 리스트 조회
            .where('postNo', postNo) // 게시글 번호로 조회
            .orderBy('createdAt', 'asc'); // 작성일자로 정렬
    }
};