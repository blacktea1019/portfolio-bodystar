'use strict'

const path = require('path');

/**
 *  환경 변수 설정
 */
module.exports = {
  dev: {
    assetsSubDirectory: 'static', // 정적 파일 경로
    assetsPublicPath: '/', // 루트 경로
    proxyTable: { // 내부에서 api 호출시 프록시 지정 여부
      '/api': { // /api/* 로 들어오는 요청은
        target: 'http://127.0.0.1:3000/api', // 변경할 프록시
        changeOrigin: true, // 요청 헤더 변경
        pathRewrite: { // 경로 변경
          '^/api': ''
        }
      }
    },
    host: 'localhost', // 접속 도메인
    port: 8080, // 접속 포트
    autoOpenBrowser: false, // 브라우저 자동 오픈
    errorOverlay: true, // 에러 문구 배경 표시
    notifyOnErrors: true, // 에러 문구 표시
    poll: false, // 주기적인 파일 감지
    devtool: 'cheap-module-eval-source-map', // 소스맵 생성
    cacheBusting: true, // 빌드시마다 파일명을 바꿈으로서 캐쉬 무효화 처리
    cssSourceMap: true // css 소스맵 설정
  },
  build: { // 빌드 옵션
    index: path.resolve(__dirname, './../../server/public/index.html'), // 생성된 index.html 파일 위치
    assetsRoot: path.resolve(__dirname, './../../server/public'), // 생성된 파일들이 들어갈 루트 패스
    assetsSubDirectory: 'static', // assets 파일들이 저장될 폴더명
    assetsPublicPath: '/', // 기본 assets 폴더 패스
    productionSourceMap: true, // 운영 계약 소스맵 설정
    devtool: '#source-map', // 소스맵 생성시 오리지날 소스 사용
    productionGzip: false, // 빌드시 gzip 압축 사용 안함
    productionGzipExtensions: ['js', 'css'], // gzip 압축 대상
    bundleAnalyzerReport: process.env.npm_config_report // 빌드 시 추가 옵션
  }
}
