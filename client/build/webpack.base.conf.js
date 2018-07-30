'use strict'

const path = require('path');  // 경로 모듈
const utils = require('./utils'); // 빌드 유틸 모듈
const config = require('../config'); // 빌드 설정
const vueLoaderConfig = require('./vue-loader.conf'); // 뷰 로더 설정

/**
 * 상위 경로 이동
 */
function resolve (dir) {
  return path.join(__dirname, '..', dir)
}

module.exports = {
  context: path.resolve(__dirname, '../'),
  entry: { // 웹팩이 빌드를 시작할 경로
    app: './src/main.js'
  },
  output: { // 빌드 후 아웃풋을 저장할 경로 지정
    path: config.build.assetsRoot,
    filename: '[name].js',
    publicPath: process.env.NODE_ENV === 'production'
      ? config.build.assetsPublicPath
      : config.dev.assetsPublicPath
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'], // 웹팩에서 분석할 대상
    alias: {
      'vue$': 'vue/dist/vue.esm.js', // 웹팩과 함께 런타임에 사용될 vue 모듈
      '@': resolve('src'),
    }
  },
  module: {
    rules: [ // 확장자별 로더 매핑 설정
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: vueLoaderConfig
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [resolve('src'), resolve('test'), resolve('node_modules/webpack-dev-server/client')]
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('img/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('media/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
        }
      }
    ]
  },
  node: {
    setImmediate: false, // setImmediate 함수를 넣지 않게 한다.
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty'
  }
}
