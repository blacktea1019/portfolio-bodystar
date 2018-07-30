'use strict'

const utils = require('./utils')
const config = require('../config')
const isProduction = process.env.NODE_ENV === 'production'
const sourceMapEnabled = isProduction
  ? config.build.productionSourceMap
  : config.dev.cssSourceMap

/**
 * vue 로더 설정
 */
module.exports = {
  loaders: utils.cssLoaders({ // css 로더 설정
    sourceMap: sourceMapEnabled,
    extract: isProduction
  }),
  cssSourceMap: sourceMapEnabled, // css 소스맵 설정
  cacheBusting: config.dev.cacheBusting, // 캐쉬 부스팅 여부
  transformToRequire: { // 주어진 특정 속성을 require 호출로 변환하여 대상을 웹팩 에서 처리
    video: ['src', 'poster'],
    source: 'src',
    img: 'src',
    image: 'xlink:href'
  }
}
