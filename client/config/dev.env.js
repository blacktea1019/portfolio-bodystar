'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')
/**
 * 개발 모드 NODE_ENV 설정
 */
module.exports = merge(prodEnv, {
  NODE_ENV: '"development"'
})
