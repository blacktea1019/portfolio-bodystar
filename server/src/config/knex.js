const props = require('./properties'); // 속성 값 로드

module.exports = require('knex')(props.db); // 디비 설정 정보를 knex 모듈에 전달