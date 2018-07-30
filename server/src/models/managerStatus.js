'use strict';

const knex = require('../config/knex'); // sql 실행 모듈
/**
 * 방문자 수 ManagerStatus 테이블 모델
 */
module.exports = {
  /**
   * 방문자 수 업데이트
   */
    plusHitCount(count) {
        return knex.raw('UPDATE ManagerStatus SET count = count +' + count + ' WHERE type = ?', 'hit');
    },
  /**
   * 방문자 수 가져오기
   */
    getHitCount() {
        return knex.select('count').from('ManagerStatus').where('type', 'hit').first();
    }
};