'use strict';

require('./check-versions')(); // 버전 체크

process.env.NODE_ENV = 'production'; // 환경 설정

const ora = require('ora'); // 터미널 로딩
const rm = require('rimraf'); // rm 모듈
const path = require('path'); // 경로 유틸 모듈
const chalk = require('chalk'); // 터미널 색깔 표시 모듈
const webpack = require('webpack'); // 웹팩 모듈
const config = require('../config'); // 빌드 설정
const webpackConfig = require('./webpack.prod.conf'); // 웹팩 설정

const spinner = ora('building for production...'); // 로딩 텍스트
spinner.start(); // 로딩 시작

rm(path.join(config.build.assetsRoot, config.build.assetsSubDirectory), err => { // 빌드 대상 경로 클린 후 시작
  if (err) throw err;
  webpack(webpackConfig, (err, stats) => { // 웹팩 빌드 시작
    spinner.stop();
    if (err) throw err;
    process.stdout.write(stats.toString({ // 빌드 진행 상태 표시 설정
      colors: true, // 텍스트 색상
      modules: false, // 빌드된 모듈 정보
      children: false, // 하위 모듈 정보
      chunks: false, // 모든 정보 표시
      chunkModules: false // 모든 모듈 정보 표시
    }) + '\n\n');

    if (stats.hasErrors()) {
      console.log(chalk.red('  Build failed with errors.\n'));
      process.exit(1);
    }

    console.log(chalk.cyan('  Build complete.\n'));
    console.log(chalk.yellow(
      '  Tip: built files are meant to be served over an HTTP server.\n' +
      '  Opening index.html over file:// won\'t work.\n'
    ));
  })
});
