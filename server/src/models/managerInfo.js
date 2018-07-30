'use strict';

const knex = require('../config/knex'); // sql 실행 모듈
const auth = require('./../config/auth'); // 토큰 모듈
const s = require("underscore.string"); // 스트링 유틸리티 함수
/**
 * 관리자 ManagerInfo 테이블 모델
 */
module.exports = {
    searchColumns : { // 검색 컬럼 정의
        name: 'ManagerInfo.name', // 이름
        id: 'ManagerInfo.id', // 아이디
        phone: 'ManagerInfo.phone' // 전화번호
    },
  /**
   * 토큰 업데이트
   * @param user 사용자 정보
   * @param accessToken 액세스 토큰
   * @param refreshToken 리프레시 토큰
   */
    updateTokens (user, accessToken, refreshToken) {
        return knex('ManagerInfo')
            .where('id', user.id) // 사용자 아이디로 조회
            .update({ // 토큰 업데이트
                accessToken: accessToken,
                refreshToken: refreshToken
            })
    },
  /**
   * 액세스 토큰 업데이트
   * @param user 사용자 정보
   * @param accessToken 액세스 토큰
   */
    updateAccessToken (user, accessToken) {
        return knex('ManagerInfo')
            .where('id', user.id) // 사용자 아이디로 조회
            .update({ // 액세스 토큰
                accessToken: accessToken
            });
    },
  /**
   * 권한 변경
   * @param id 사용자 아이디
   * @param permission 권한 값
   */
    updatePermission (id, permission) {
        return knex('ManagerInfo').where('id', id) // 사용자 아이디로 조회
            .update({ // 변경할 권한 값
                permission: permission
            });
    },
  /**
   * 아이디로 조회
   * @param id 사용자 아이디
   */
    findById (id) {
        return knex('ManagerInfo').where('id', id).first();
    },
  /**
   * 권한 부여 리스트 조회
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
                var query = trx.select(knex.raw('SQL_CALC_FOUND_ROWS ManagerInfo.id, ManagerInfo.name, ManagerInfo.phone, GymList.gymName, ManagerInfo.joinDate, ManagerInfo.permission'))
                    .from('ManagerInfo')
                    .innerJoin('GymList', function () {
                        this.on('ManagerInfo.gymCode', '=', 'GymList.number') // GymList 테이블과 체육관 코드로 조인
                    });
                if (!s(params.keyword).isBlank() && !s(params.column).isBlank()) { // 검색 키워드나 컬럼이 존재한다면
                    query = query.where(this.searchColumns[params.column], 'like', '%' + params.keyword + '%'); // 해당 검색 컬럼 조건에 추가
                }
                query = query
                    .where('ManagerInfo.gymCode', '=', params.gymCode) // 해당하는 체육관 코드로 조회
                    .andWhere('ManagerInfo.permission', '<', 9) // 권한레벨이 9보다 작은 경우만
                    .orderBy('ManagerInfo.joinDate', 'asc') // 가입 날짜 정렬
                    .limit(params.limit) // 페이지당 리스트 갯수
                    .offset(params.offset); // 페이지 시작 번호
                return query.then(users => { // 쿼리를 수행한 다음
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
   * 회원 삭제
   *    - 삭제할 사용자 아이디와 체육관 코드로 조회
   */
    deleteManager (params) {
        return knex('ManagerInfo').where('id', params.id).andWhere('gymCode', params.gymCode).del();
    },
  /**
   * 회원 추가
   */
    create (data) {
        return knex('ManagerInfo').insert(data);
    }
};