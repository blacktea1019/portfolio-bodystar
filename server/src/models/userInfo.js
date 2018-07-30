'use strict';

const knex = require('../config/knex'); // sql 실행 모듈
const auth = require('./../config/auth'); // 토큰 모듈
const s = require("underscore.string"); // 스트링 유틸리티 함수

/**
 * UserInfo 테이블 모델
 */
module.exports = {
    searchColumns : { // 검색할 컬럼 정의
        nickName: 'UserInfo.nickName', // 닉네임
        email: 'Auth.email', // 이메일
        phone: 'UserInfo.phone', // 폰번호
        sex: 'UserInfo.sex' // 성별
    },
  /**
   * 현재 유저 갯수 가져오기
   */
    currentUsers () {
        return knex('UserInfo').count('id as count').first();
    },
  /**
   * 시작 / 만료 일자 수정
   */
    updateTime (params) {
        let query = knex('UserInfo')
            .where('id', params.id) // 유저 아이디로 조회
            .andWhere('gymCode', '=', params.gymCode); // 체육관 코드로 조회

        if (params.dateType === 'begin') { // 시작 일자
            query = query.update({
                membership_begin: params.date
            });
        } else { // 만료 일자
            query = query.update({
                membership_end: params.date
            });
        }
        return query;
    },
  /**
   * 입출입 유저 리스트
   *
   * - 트랜젝션이란 ?
   *    - 여러개의 쿼리가 하나의 묶음으로 처리되어야 할 때 사용한다.
   *    - 트랜젝션으로 조회 쿼리들( 리스트 조회, 조회한 갯수 가져오기 )을 묶으면,
   *        하나의 커넥션 하에서 조회 쿼리가 실행되는 것이 보장된다.
   *            - 리스트 조회를 한 뒤에, 조회한 갯수를 가져올 때는 트랜젝션으로 묶어야( 하나의 커넥션으로 조회 ) 정확한 결과를 가져올 수 있다.
   *
   */
    pageInoutUsers (params) {
        return new Promise((resolve, reject) => {
            knex.transaction(trx => { // 트랜젝션 시작
                var query = trx.select(knex.raw('SQL_CALC_FOUND_ROWS UserInfo.nickName, UserInfo.sex, Auth.email, UserInfo.phone, enter.inTime, enter.outTime'))
                    .from('UserInfo')
                    .innerJoin('Auth', function () { // Auth 테이블과 아이디로 조인
                        this.on('UserInfo.id', '=', 'Auth.id')
                    })
                    .innerJoin('enter', function () { // enter 테이블과 이메일로 조인
                        this.on('Auth.email', '=', 'enter.email')
                    });
                if (!s(params.keyword).isBlank() && !s(params.column).isBlank()) { // 검색 키워드나 컬럼이 존재한다면
                    query = query.where(this.searchColumns[params.column], 'like', '%' + params.keyword + '%'); // 해당 조건 추가
                }
                if (params.sex.length === 1) { // 남녀 성별 검색 조건이 있다면
                    query = query.where(this.searchColumns['sex'], '=', params.sex[0]); // 성별 조건 추가
                }
                query = query
                    .where('UserInfo.gymCode', '=', params.gymCode) // 주어진 체육관 코드로 조회
                    .andWhere('enter.gymCode', '=', params.gymCode) // 입출입 테이블 내의 체육관 코드로 조회
                    .orderBy('enter.inTime', 'asc') // 입장 시간으로 정렬
                    .limit(params.limit) // 페이지당 리스트
                    .offset(params.offset); // 페이지당 시작 번호
                return query.then(users => { // 결과 조회 후
                    return new Promise((resolve, reject) => {
                        trx.select(knex.raw('found_rows() as total')).first() // 전체 갯수 조회
                            .then(row => resolve({ total: row.total, data: users }))
                            .catch(err => reject(err));
                    });
                });
            }).then(result => resolve(result)).catch(err => reject(err));
        });
    },
  /**
   * 회원 등록 확인 / 추가 리스트
   *
   * - 트랜젝션이란 ?
   *    - 여러개의 쿼리가 하나의 묶음으로 처리되어야 할 때 사용한다.
   *    - 트랜젝션으로 조회 쿼리들( 리스트 조회, 조회한 갯수 가져오기 )을 묶으면,
   *        하나의 커넥션 하에서 조회 쿼리가 실행되는 것이 보장된다.
   *            - 리스트 조회를 한 뒤에, 조회한 갯수를 가져올 때는 트랜젝션으로 묶어야( 하나의 커넥션으로 조회 ) 정확한 결과를 가져올 수 있다.
   */
    pageGymUsers (params) {
        return new Promise((resolve, reject) => {
            knex.transaction(trx => { // 트랜젝션 시작
                var query = trx.select(knex.raw('SQL_CALC_FOUND_ROWS UserInfo.id, UserInfo.nickName, UserInfo.sex, Auth.email, UserInfo.phone, UserInfo.membership_begin, UserInfo.membership_end'))
                    .from('UserInfo')
                    .innerJoin('Auth', function () { // Auth 테이블과 아이디로 조인
                        this.on('UserInfo.id', '=', 'Auth.id')
                    });
                if (!s(params.keyword).isBlank() && !s(params.column).isBlank()) { // 검색할 키워드와 컬럼이 존재한다면
                    query = query.where(this.searchColumns[params.column], 'like', '%' + params.keyword + '%'); // 검색 조건 추가
                }
                if (params.sex.length === 1) {  // 남녀 성별 검색 조건이 있다면
                    query = query.where(this.searchColumns['sex'], '=', params.sex[0]); // 성별 조건 추가
                }
                query = query
                    .where('UserInfo.gymCode', '=', params.gymCode) // 체육관 코드로 조회
                    .orderBy('UserInfo.membership_begin', 'asc') // 시작 일자로 정렬
                    .limit(params.limit) // 페이지당 리스트 갯수
                    .offset(params.offset); // 페이지 시작 번호
                return query.then(users => { // 결과 조회 후
                        return new Promise((resolve, reject) => {
                            trx.select(knex.raw('found_rows() as total')).first() // 전체 갯수 조회
                                .then(row => resolve({ total: row.total, data: users }))
                                .catch(err => reject(err));
                        });
                    });
            }).then(result => resolve(result)).catch(err => reject(err));
        });
    }
};