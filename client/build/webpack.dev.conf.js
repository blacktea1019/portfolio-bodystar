'use strict'

const utils = require('./utils'); // 빌드 시 유틸 함수 모듈
const webpack = require('webpack'); // 웹팩
const config = require('../config'); // 빌드 환경 설정
const merge = require('webpack-merge'); // 웹팩 구성 요소를 병합
const path = require('path'); // 경로 모듈
const baseWebpackConfig = require('./webpack.base.conf'); // 웹팩 기본 설정
const CopyWebpackPlugin = require('copy-webpack-plugin'); // 파일 복사 플러그인
const HtmlWebpackPlugin = require('html-webpack-plugin'); // html 파일 생성 플러그인
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin'); // 웹팩 오류를 보기 쉽게 변환
const portfinder = require('portfinder'); // 사용 가능한 포트 추척

const HOST = process.env.HOST;
const PORT = process.env.PORT && Number(process.env.PORT);

const devWebpackConfig = merge(baseWebpackConfig, {
  module: { // css 로드 설정
    rules: utils.styleLoaders({ sourceMap: config.dev.cssSourceMap, usePostCSS: true })
  },
  devtool: config.dev.devtool, // 소스맵을 제공하는 옵션
  devServer: { // 웹팩 개발 서버 설정
    clientLogLevel: 'warning',
    historyApiFallback: { // HTML5 히스토리 API를 사용할 때, 아래 경로로 요청하면 404 응답 대신 index.html 페이지가 제공
      rewrites: [
        { from: /.*/, to: path.posix.join(config.dev.assetsPublicPath, 'index.html') },
      ],
    },
    hot: true, // 모듈이 변경되도 서버를 재시작하지 않고 반영
    contentBase: false, // 소스를 프로젝트 외부의 경로에서 불러와야 할 경우
    compress: true, // gzip 압축을 사용할지
    host: HOST || config.dev.host,
    port: PORT || config.dev.port,
    open: config.dev.autoOpenBrowser, // 자동으로 브라우저를 띄울지
    overlay: config.dev.errorOverlay // 오류 발생시 브라우저 전체화면으로 표시
      ? { warnings: false, errors: true }
      : false,
    publicPath: config.dev.assetsPublicPath, // 기본 경로
    proxy: config.dev.proxyTable, // 프록시 사용 여부
    quiet: true, // 웹팩의 오류나 경고 표시
    watchOptions: { // 주기적인 파일 변경 감지
      poll: config.dev.poll,
    }
  },
  plugins: [
    new webpack.DefinePlugin({ // 컴파일할 코드에서 특정 문자열을 설정한 값으로 치환
      'process.env': require('../config/dev.env')
    }),
    new webpack.HotModuleReplacementPlugin(), // 모둘 자동 변경 감지
    new webpack.NamedModulesPlugin(), // 모둘 변경시 콘솔에 변경한 모듈 이름 노출
    new webpack.NoEmitOnErrorsPlugin(), // 컴파일 시에 오류가 발생한 리소스들은 제외하고 작업을 진행
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html',
      inject: true // 템플릿 파일내 자바스크립트는 body 아래로 삽입
    }),
    new CopyWebpackPlugin([ // static 폴더를 지정한 경로로 복사
      {
        from: path.resolve(__dirname, '../static'),
        to: config.dev.assetsSubDirectory,
        ignore: ['.*']
      }
    ])
  ]
})
/**
 * 웹팩 개발 서버 설정추가 후 실행
 */
module.exports = new Promise((resolve, reject) => {
  portfinder.basePort = process.env.PORT || config.dev.port
  portfinder.getPort((err, port) => {
    if (err) {
      reject(err)
    } else {
      process.env.PORT = port
      devWebpackConfig.devServer.port = port
      devWebpackConfig.plugins.push(new FriendlyErrorsPlugin({
        compilationSuccessInfo: {
          messages: [`Your application is running here: http://${devWebpackConfig.devServer.host}:${port}`],
        },
        onErrors: config.dev.notifyOnErrors
        ? utils.createNotifierCallback()
        : undefined
      }))

      resolve(devWebpackConfig)
    }
  })
})
