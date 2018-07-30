'use strict';

const managerStatus = require('../models/managerStatus'); // managerStatus 테이블 모델

const hitMap = { // 방문자 수
    count: 0, // 증가된 방문자 수 ( 여기 모아진 값은 디비 저장에 사용 )
    total: 0 // 전체 방문자 수
};
/**
 * 증가된 방문자수를 디비에 저장
 */
function flushCount() {
    managerStatus.plusHitCount(hitMap.count)
        .then(result => {
            hitMap.count = 0; // 디비에 저장하고 증가수를 0으로 초기화
        })
        .catch(err => {
            console.log(err)
        });
}
/**
 * 방문자 수 1 증가
 */
module.exports.hit = () => {
    hitMap.count += 1; // 증가된 방문자 +1
    hitMap.total += 1; // 전체 방문자 수 + 1
};
/**
 * 전체 방문자 수 리턴
 */
module.exports.getCount = () => {
  return hitMap.total;
};
/**
 * 모듈 시작
 */
module.exports.init = () => {
    managerStatus.getHitCount().then(result => { // 디비에 저장된 전체 방문자수를 가져온다.
        hitMap.total = result.count; // 전체 방문자 수 대입
        setInterval(flushCount, 60 * 1000); // 1분에 한번씩 그동안 증가된 수치를 디비에 저장
    }).catch(err => {
        console.log(err);
    });
};