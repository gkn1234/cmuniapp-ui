/* eslint-disable no-console */
/*
 * @Autor: Guo Kainan
 * @Date: 2022-02-04 09:57:32
 * @LastEditors: Guo Kainan
 * @LastEditTime: 2022-07-17 23:47:54
 * @Description: 用于一键设定 uni-app 的版本
 */
const fs = require('fs')
const path = require('path')
const spawn = require('child_process').spawn
const prettier = require('prettier');

/**
 * 使用示例：
 * 
 * 修改版本号，但不安装
 * npm run uni-version 3.0.0-alpha-3030520211229002 
 * 
 * 修改版本号并安装
 * npm run uni-version 3.0.0-alpha-3030520211229002 --install
 */

/** 依赖中若含有以下字段，则忽略 */
const EXCLUDE_DEPS = [
  '@dcloudio/types',
]

/** package.json 路径 */
const pkgPath = path.join(__dirname, '../package.json')

async function getPkg() {
  const buffer = await fs.promises.readFile(pkgPath, 'utf-8')
  return JSON.parse(buffer)
}

async function setPkg(json) {
  let jsonStr = JSON.stringify(json)
  jsonStr = prettier.format(jsonStr, {
    parser: 'json'
  })
  await fs.promises.writeFile(pkgPath, jsonStr, 'utf-8')
}

function isUniappDep(name) {
  return name.includes('@dcloudio/') && !EXCLUDE_DEPS.includes(name)
}

function installDeps() {
  return new Promise((resolve, reject) => {
    const ins = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['install'], {
      stdio: 'inherit'
    })

    ins.on('close', (code) => {
      console.log(`npm install exited with code ${code}`)
      if (code === 0) {
        resolve()
      }
      else {
        reject()
      }
    })
  })
}

async function main() {
  const version = process.argv[2]
  const isInstall = process.argv[3]
  if (typeof version !== 'string' || !version) {
    throw new Error('Invalid version name!')
  }

  const pkg = await getPkg()

  Object.keys(pkg.dependencies).forEach((k) => {
    if (isUniappDep(k)) {
      pkg.dependencies[k] = version
    }
  })
  Object.keys(pkg.devDependencies).forEach((k) => {
    if (isUniappDep(k)) {
      pkg.devDependencies[k] = version
    }
  })

  await setPkg(pkg)

  if (isInstall) {
    await installDeps()
  }
}

main()
