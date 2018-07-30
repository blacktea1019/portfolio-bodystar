'use strict';

const winston = require('winston'); // 윈스톤 로거 설정
const props = require('./properties'); // 속성 값 로드
const moment = require('moment-timezone'); // 날짜 모듈
const level = props.log.level; // 로그 레벨 설정

const logger = new winston.Logger({ // 로거 설정
    transports: [
        new winston.transports.Console({ // 콘솔 로거
            level: level, // 로깅 레벨
            timestamp: function () { // 날짜 포맷 지정
                return moment().format("YYYY-MM-DD HH:mm:ss.SSS");
            }
        })
    ]
});

module.exports = logger;