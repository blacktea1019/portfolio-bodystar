'use strict';

const knex = require('../config/knex'); // sql 실행 모듈
const auth = require('./../config/auth'); // 토큰 모듈
const s = require("underscore.string"); // 스트링 유틸리티 함수
/**
 *  게시판 > ManageBoard 테이블 모델
 */
module.exports = {
    searchColumns : { // 검색 컬럼 정의
        title: 'ManagerBoard.title', // 제목
        writerId: 'ManagerBoard.writerId', // 작성자 아이디
    },
  /**
   * 댓글 수 업데이트
   * @param seq 게시글 번호
   * @param frag 증감
   */
    updateCommentCount(seq, frag) {
        return knex.raw('UPDATE ManagerBoard SET commentCnt = commentCnt ' + frag + ' WHERE seq = ?', [seq]);
    },
  /**
   * 댓글 수 감소
   * @param seq 게시글 번호
   */
    minusCommentCount(seq) {
        return this.updateCommentCount(seq, '-1'); // 1 감소
    },
  /**
   * 댓글 수 증가
   * @param seq 게시글 번호
   */
    plusCommentCount(seq) {
        return this.updateCommentCount(seq, '+1'); // 1 증가
    },
  /**
   * 조회 수 증가
   * @param seq 게시글 번호
   */
    plusViewCount(seq) {
        return knex.raw('UPDATE ManagerBoard SET viewCnt = viewCnt +1 WHERE seq = ?', [seq]);
    },
  /**
   * 게시글과 댓글 삭제
   *
   * - 트랜젝션이란 ?
   *    - 여러개의 쿼리가 하나의 묶음으로 처리되어야 할 때 사용한다.
   *    - 트랜젝션으로 쿼리들( 게시글 삭제, 댓글 삭제 )을 묶으면,
   *        게시글 또는 댓글을 둘다 삭제가 성공해야 커밋( 최종 삭제 처리 )이 되며,
   *        하나라도 실패하면 롤백( 삭제 시도 이전으로 )이 된다.
   *
   * @param seq 게시글 번호
   */
    deleteWithComments(seq) {
        return new Promise((resolve, reject) => {
            knex.transaction(trx => { // 트랜젝션 시작
                var query = knex('ManagerBoard').where('seq', seq).del(); // 게시글 삭제
                return query.then(cnt => {
                    return new Promise((resolve, reject) => {
                        knex('ManagerComment').where('postNo', seq).del() // 게시글에 해당하는 댓글들 삭제
                            .then(result => resolve({ result }))
                            .catch(err => reject(err));
                    })
                })
            }).then(result => resolve(result)).catch(err => reject(err));
        });
    },
  /**
   * 게시글 아이디와 작성자 아이디로 게시글 조회
   * @param seq 게시글 번호
   * @param writerId 작성자 아이디
   */
    findByIdwithWriterId(seq, writerId) {
        return knex('ManagerBoard')
            .where('seq', seq)
            .andWhere('writerId', writerId)
            .first();
    },
  /**
   * 게시글 번호로 조회
   * @param seq 게시글 번호
   */
    findById(seq) {
        return knex('ManagerBoard').where('seq', seq).first();
    },
  /**
   * 게시글 번호를 기준으로, 게시글과 함께 이전 / 다음 글 조회
   * @param seq 게시글 번호
   */
    findByIdWithRelatedPosts(seq) {
        var nextSub = knex.select('seq').from('ManagerBoard').where('seq', '>', seq).orderBy('seq', 'asc').limit(1); // 다음 글 조회
        var prvSub = knex.select('seq').from('ManagerBoard').where('seq', '<', seq).orderBy('seq', 'desc').limit(1); // 이전 글 조회
        return knex.select('*').from('ManagerBoard').whereIn('seq', [seq, nextSub, prvSub]); // 게시글 조회
    },
  /**
   * 게시글 업데이트
   */
    updatePost (params) {
        return knex('ManagerBoard').where('seq', parseInt(params.seq)) // 게시글 번호
            .update({
                title: params.title, // 제목
                content: params.content // 내용
            });
    },
  /**
   * 게시글 추가
   *    - 글 번호로 해당 게시글을 찾아온 뒤, 제목 / 내용 업데이트
   *        - 게시글 그룹 넘버에 해당 게시글의 번호를 저장
   */
    insertPost (params) {
        return new Promise((resolve, reject) => {
            knex.insert(params).into('ManagerBoard') // 제목 / 내용 저장
                .then(seq => {
                    knex('ManagerBoard').where('seq', seq).update({ groupNo: seq }) // 그룹 넘버에 게시글 번호 저장
                        .then(result => resolve({ result: result }))
                        .catch(err => reject(err));
                })
                .catch(err => reject(err));
        });
    },
  /**
   * 게시글 리스트 조회
   */
    page (params) {
        return new Promise((resolve, reject) => {
            knex.transaction(trx => { // 트랜젝션 조회
                var query = trx.select(knex.raw('SQL_CALC_FOUND_ROWS seq, depth, title, writerId, createdAt, viewCnt, commentCnt')) // 게시글 데이타 조회
                    .from('ManagerBoard');
                if (!s(params.keyword).isBlank() && !s(params.column).isBlank()) { // 검색 키워드와 컬럼이 존재하는 경우
                    query = query.where(this.searchColumns[params.column], 'like', '%' + params.keyword + '%'); // 해당 컬럼 조회 쿼리 추가
                }
                query = query
                    .orderBy('groupNo', 'desc') // 그룹으로 역순 정렬
                    .orderBy('orderNo', 'asc') // 그룹내 순서로 정렬
                    .limit(params.limit) // 페이지당 리스트 갯수
                    .offset(params.offset); // 페이지 시작 번호
                return query.then(list => { // 쿼리 전송 이후에
                    return new Promise((resolve, reject) => {
                        trx.select(knex.raw('found_rows() as total')).first() // 전체 갯수 조회
                            .then(row => resolve({ total: row.total, data: list }))
                            .catch(err => reject(err));
                    });
                });
            }).then(result => resolve(result)).catch(err => reject(err));
        });
    }
};