'use strict'
const path = require('path'); // 경로 모듈
const utils = require('./utils'); // 빌드 시 유틸 함수 모듈
const webpack = require('webpack'); // 웹팩
const config = require('../config'); //  빌드 환경 설정
const merge = require('webpack-merge');// 웹팩 구성 요소를 병합
const baseWebpackConfig = require('./webpack.base.conf');// 웹팩 기본 설정
const CopyWebpackPlugin = require('copy-webpack-plugin');// 파일 복사 플러그인
const HtmlWebpackPlugin = require('html-webpack-plugin'); // html 파일 생성 플러그인
const ExtractTextPlugin = require('extract-text-webpack-plugin'); // css 파일 추출 플러그인
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin'); // css 최적화/최소화 플러그인
const UglifyJsPlugin = require('uglifyjs-webpack-plugin'); // JS 최적화/최소화 플러그인

const env = require('../config/prod.env');

const webpackConfig = merge(baseWebpackConfig, {
  module: {  // css 로드 설정
    rules: utils.styleLoaders({
      sourceMap: config.build.productionSourceMap,
      extract: true,
      usePostCSS: true
    })
  },
  devtool: config.build.productionSourceMap ? config.build.devtool : false, // 소스맵을 제공하는 옵션
  output: { // 빌드한 파일을 저장할 경로 지정
    path: config.build.assetsRoot,
    filename: utils.assetsPath('js/[name].[chunkhash].js'),
    chunkFilename: utils.assetsPath('js/[id].[chunkhash].js')
  },
  plugins: [
    new webpack.DefinePlugin({ // 컴파일할 코드에서 특정 문자열을 설정한 값으로 치환
      'process.env': env
    }),
    new UglifyJsPlugin({ // js 파일 컴프레스
      uglifyOptions: {
        compress: {
          warnings: false
        }
      },
      sourceMap: config.build.productionSourceMap,
      parallel: true // 병렬로 컴프레스 진행
    }),
    new ExtractTextPlugin({ // css 를 파일로 추출
      filename: utils.assetsPath('css/[name].[contenthash].css'),
      allChunks: true,
    }),
    new OptimizeCSSPlugin({ // css 최적화
      cssProcessorOptions: config.build.productionSourceMap
        ? { safe: true, map: { inline: false } }
        : { safe: true }
    }),
    new HtmlWebpackPlugin({ // html 생성
      filename: config.build.index,
      template: 'index.html',
      inject: true,
      minify: {
        removeComments: true, // 주석 제거
        collapseWhitespace: true, // 공백 축소
        removeAttributeQuotes: true // 속성 값을 표현할 때 " 가 없어도 되는 경우 삭제
      },
      chunksSortMode: 'dependency' // 대상을 종속성에 따라 정렬
    }),
    new webpack.HashedModuleIdsPlugin(), // 해쉬 경로 생성 플러그인
    new webpack.optimize.ModuleConcatenationPlugin(), // 함수내에서 변수 선언시, 함수내 최상단으로 선언을 이동
    new webpack.optimize.CommonsChunkPlugin({ // 공통 모듈을 별도 파일로 분리하는 플러그인
      name: 'vendor',
      minChunks (module) {
        return (
          module.resource &&
          /\.js$/.test(module.resource) &&
          module.resource.indexOf(
            path.join(__dirname, '../node_modules')
          ) === 0
        )
      }
    }),
    new webpack.optimize.CommonsChunkPlugin({ // 런타임 웹팩 동작 코드를 따로 분리하여 빌드시에 번들등의 캐쉬가 깨지지 않게 한다.
      name: 'manifest',
      minChunks: Infinity
    }),
    new webpack.optimize.CommonsChunkPlugin({ // 코드들에서 공유될 코드를 분리
      name: 'app',
      async: 'vendor-async',
      children: true,
      minChunks: 3
    }),

    new CopyWebpackPlugin([ // static 폴더를 지정한 경로로 복사
      {
        from: path.resolve(__dirname, '../static'),
        to: config.build.assetsSubDirectory,
        ignore: ['.*']
      }
    ])
  ]
})

if (config.build.productionGzip) { // gzip 사용 시에 압축
  const CompressionWebpackPlugin = require('compression-webpack-plugin')

  webpackConfig.plugins.push(
    new CompressionWebpackPlugin({
      asset: '[path].gz[query]',
      algorithm: 'gzip',
      test: new RegExp(
        '\\.(' +
        config.build.productionGzipExtensions.join('|') +
        ')$'
      ),
      threshold: 10240,
      minRatio: 0.8
    })
  )
}

if (config.build.bundleAnalyzerReport) { // 웹팩 출력 파일의 시각화
  const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
  webpackConfig.plugins.push(new BundleAnalyzerPlugin())
}

module.exports = webpackConfig
