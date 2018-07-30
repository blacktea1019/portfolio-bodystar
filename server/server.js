const compression = require('compression'); // 응답 본문 gzip 압축
const express = require('express'); // 익스프레스 코어
const helmet = require('helmet'); // 보안
const serveStatic = require('serve-static'); // 정적 파일을 라우팅
const path = require('path'); // 파일 경로를 다루는 모듈
const cookieParser = require('cookie-parser'); // 쿠키 분석
const morgan = require('morgan'); // 모건 로깅
const http = require('http'); // http 모듈
const history = require('connect-history-api-fallback'); // HTML5 History API 를 사용하는 페이지를 위해 요청이 오면 index.html 을 돌려줌
const passport = require('passport'); // 패스포트 권한
const routes = require('./src/routes'); // 라우팅
const moment = require('moment-timezone'); // 모먼트 날짜
const logger = require('./src/config/logger'); // 로깅 설정
const counter = require('./src/config/counter'); // 카운터 설정

const app = express(); // 익스프레스 생성

moment.tz.setDefault('Asia/Seoul'); // 날짜 로컬 존 설정

counter.init(); // 카운터 생성

morgan.token('date', function(){ // 로깅시에, 로컬존에 맞는 시간나오게 변경
    return moment().format();
});

app.use(helmet.hidePoweredBy({ setTo: 'bodystar' })); // 응답 헤더에서 express 노출되지 않게함
app.use(history()); // history 모듈 사용
app.use(compression()); // gzip 사용
app.use(morgan('[:date] ":method :url :response-time ms" :status :res[content-length] ":remote-addr :referrer" ":user-agent"')); // 로깅 포맷
app.use(express.json()); // 요청을 json 으로 분석
app.use(express.urlencoded({ extended: true })); // urlencoded 된 요청을 분석
app.use(cookieParser()); // 쿠키 분석

app.use(passport.initialize()); // 권한 모듈 시작

require('./src/config/passport'); // 권한 설정


app.use(serveStatic('public', { // 정적 파일 제공 설정
    index: ['index.html'], // 루트 페이지는 index.html
    maxAge: '365d', // 응답 헤더에 캐쉬요청 전달 365일
    setHeaders: setCustomCacheControl // 캐시를 걸 헤더를 선정
}));

app.use('/api', routes); // api 라우팅
app.use(errorHandler); // 에러 핸들러 추가

/**
 * 캐쉬 응답 설정
 * @param res 응답 객체
 * @param path 전달할 파일
 */
function setCustomCacheControl (res, path) {
    if (serveStatic.mime.lookup(path) === 'text/html') { // text/html 요청일 때는 캐쉬 하지 않음
        res.setHeader('Cache-Control', 'public, max-age=0')
    }
}
/**
 * 에러 핸들링
 * @param err 발생한 에러
 * @param req 요청한 리퀘스트
 * @param res 전달할 리스폰스
 * @param next 다음 미들웨어 전달
 */
function errorHandler(err, req, res, next) {
    if (err && err.statusCode && err.code && err.type) { // 에러가 상태 코드등 정보를 담고 있는 경우라면
        let data = {
            status: err.statusCode, // 상태 코드
            code: err.code, // 에러 코드
            message: err.type // 에러 메시지
        };
        if (err.statusCode < 500) {
            logger.warn("errorHandler", data);
        } else {
            logger.error(err);
            console.log(err);
        }
        return res.status(err.statusCode).json(data); // 에러 응답
    }
    console.log(err);
    logger.error(err);
    res.status(500).json({
        status: 500,
        message: '서버에서 오류가 발생하였습니다.'
    });
}

module.exports = app;


var port = normalizePort(process.env.PORT || '3000'); // 포트 번호 추출 ( 환경변수에 없을 시에, 디폴트 3000 )

app.set('port', port); // 포트 전달


var server = http.createServer(app); // 서버 생성
server.listen(app.get('port')); // 포트 대기
server.on('error', onError); // 에러 리스너 지정

/**
 * 포트 값을 정규화
 * @param val 포트 값
 */
function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        return val;
    }

    if (port >= 0) {
        return port;
    }

    return false;
}
/**
 * 서버 시작시에 에러 발생시에 문구 노출
 * @param error
 */
function onError(error) {
    if (error.syscall !== 'listen') { // 시스템 호출 실패
        throw error;
    }

    var bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port; // port 값 타입에 따라 텍스트 수정

    switch (error.code) {
        // 권한이 앖을 시에
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        // 포트가 이미 사용중
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}