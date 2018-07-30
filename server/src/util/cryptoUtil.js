const crypto = require('crypto');
/**
 * 비밀번호 암호화 유틸
 */
module.exports = {
  /**
   * 솔트 값 만들기
   * @param length 솔트 값 길이
   */
    randomString: function(length){
        return crypto.randomBytes(Math.ceil(length/2))
            .toString('hex') // 16진수로 인코딩
            .slice(0,length); // 주어진 길이로 자름
    },
  /**
   * 비밀번호 암호화
   * @param password 원 비밀번호
   * @param salt 솔트
   */
    encryptPassword: function(password, salt) {
        var digest = 'sha512'; // 암호화 방식
        var iterations = 3000; // 키 스트레칭 ( 암호화 반복 횟수 )
        var keyLen = 128; // 암호화 문자열 길이
        return crypto.pbkdf2Sync(password, salt, iterations, keyLen, digest).toString('hex');
    }
};