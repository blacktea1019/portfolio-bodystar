'use strict';

const chalk = require('chalk'); // 터미널 색깔 표시 모듈
const semver = require('semver'); // 버전 체크 쿼리 모듈
const packageConfig = require('../package.json'); // package 에 정의된 node, npm 버전 정보 불러온다.
const shell = require('shelljs'); // 쉘 커맨드 모듈

/**
 * 커맨드 호출
 */
function exec (cmd) {
  return require('child_process').execSync(cmd).toString().trim()
}

/**
 * node 버전 체크
 */
const versionRequirements = [
  {
    name: 'node',
    currentVersion: semver.clean(process.version),
    versionRequirement: packageConfig.engines.node
  }
];

/**
 * npm 버전 체크
 */
if (shell.which('npm')) {
  versionRequirements.push({
    name: 'npm',
    currentVersion: exec('npm --version'),
    versionRequirement: packageConfig.engines.npm
  })
}
/**
 * 버전 체크 진행 하여 오류시 경고 메시지 표시
 */
module.exports = function () {
  const warnings = [];

  for (let i = 0; i < versionRequirements.length; i++) {
    const mod = versionRequirements[i];

    if (!semver.satisfies(mod.currentVersion, mod.versionRequirement)) {
      warnings.push(mod.name + ': ' +
        chalk.red(mod.currentVersion) + ' should be ' +
        chalk.green(mod.versionRequirement)
      )
    }
  }

  if (warnings.length) {
    console.log('')
    console.log(chalk.yellow('To use this template, you must update following to modules:'))
    console.log()

    for (let i = 0; i < warnings.length; i++) {
      const warning = warnings[i]
      console.log('  ' + warning)
    }

    console.log()
    process.exit(1)
  }
}
