require('dotenv').config()
const server = require('http').createServer()
const options = {}
const SERVER_PORT = process.env.SERVER_PORT
const builderOrg = process.env.ORGANISATION
const allOrgsDir = `${__dirname.replace('builder/socket', '')}builder-organisations`
const devAppsDir = `${__dirname.replace('builder/socket', '')}builder-organisations/${builderOrg}/applications`
const builderDnaDir = `${__dirname.replace('socket', 'dna')}`
const orgInvitePackageDir = `${__dirname.replace('builder/socket', '')}builder-organisations/${builderOrg}/invite-package`
const devPluginsDir = `${__dirname.replace('builder/socket', '')}builder-organisations/${builderOrg}/plugins`
let rootDir = devAppsDir
const io = require('socket.io')(server, options)
const fs = require('fs')
const { spawn } = require('child_process')
const npmLogin = require('npm-cli-login')
let conductor = undefined
let appServer = undefined

if (!fs.existsSync(rootDir)) {
  fs.mkdirSync(rootDir, { recursive: true })
}
if (!fs.existsSync(devPluginsDir)) {
  fs.mkdirSync(devPluginsDir, { recursive: true })
}
if (!fs.existsSync(orgInvitePackageDir)) {
  fs.mkdirSync(orgInvitePackageDir, { recursive: true })
}
function getFileType (fileName) {
  if (fileName.startsWith('.')) return fileName.replace('.', '')
  const index = fileName.lastIndexOf('.') + 1
  const fileType = fileName.substring(index, fileName.length)
  return fileType
}
function getFoldersAndFiles (parentDir, socket) {
  if (parentDir.includes('vue-cli-plugin')) {
    rootDir = devPluginsDir
    console.log('RootDIR', rootDir)
    console.log('parentDir', parentDir)
  }
  const entries = fs.readdirSync(parentDir, { withFileTypes: true })
  console.log('🚀 ~ file: index.js ~ line 38 ~ getFoldersAndFiles ~ entries', entries)
  const folders = entries
    .filter(entry => entry.isDirectory())
    .filter(entry => entry.name !== '.git')
    .filter(entry => entry.name !== 'node_modules')
    .filter(entry => entry.name !== 'target')
    .filter(entry => entry.name !== 'dist')
    .filter(entry => entry.name !== '.wasm_cache')
    .filter(entry => entry.name !== '.wasm_target')
    .filter(entry => entry.name !== '.cargo')
  for (const folder of folders) {
    const folderEntries = fs.readdirSync(`${parentDir}${folder.name}/`, {
      withFileTypes: true
    })
    if (folderEntries.length > 0) {
      const newDirectory = {
        parentDir: parentDir.replace(`${rootDir}`, ''),
        name: folder.name,
        type: 'dir'
      }
      socket.emit('GET_STATUS', newDirectory)
      getFoldersAndFiles(`${parentDir}${folder.name}/`, socket)
    }
  }
  const files = entries
    .filter(entry => !entry.isDirectory())
    .filter(entry => entry.name !== '.DS_Store')
    .filter(entry => entry.name.includes('.dna.gz') === false)
  for (const file of files) {
    let content = ''
    let fileExtension = getFileType(file.name)
    let contentPrefix = ''
    let fileEncoding = 'utf8'
    if (['png', 'jpg', 'jpeg'].find(ext => ext === fileExtension)) {
      if (fileExtension === 'jpg') fileExtension = 'jpeg'
      fileEncoding = 'base64'
      contentPrefix = `data:image/${fileExtension};base64,`
      content = `${contentPrefix}${fs.readFileSync(`${parentDir}${file.name}`, fileEncoding)}`
    } else {
      content = `${fs.readFileSync(`${parentDir}${file.name}`, fileEncoding)}`
    }

    const newFile = {
      parentDir: parentDir.replace(`${rootDir}`, ''),
      name: file.name,
      type: 'file',
      extension: fileExtension,
      encoding: fileEncoding,
      content: content
    }
    socket.emit('GET_STATUS', newFile)
  }
}

io.on('connection', socket => {
  socket.on('CREATE_AGENT', (payload, callback) => {
    console.log('CREATE_AGENT', payload)
    hcClient.admin.generateAgentPubKey().then(agentKey => {
      callback(agentKey)
    })
  })

  socket.on('SAVE_FILE', payload => {
    rootDir = devAppsDir
    if (payload.parentDir.includes('vue-cli-plugin')) rootDir = devPluginsDir
    fs.writeFile(
      `${rootDir}${payload.parentDir}${payload.name}`,
      payload.content,
      err => {
        if (err) throw err
        console.log(`${payload.parentDir}${payload.name} has been saved!`)
      }
    )
  })

  socket.on('SAVE_UPLOADED_IMAGE', (payload, callback) => {
    const file = payload
    console.log(payload)
    const fileName = `${rootDir}${file.parentDir}${file.name}`
    let content = ''
    let fileExtension = getFileType(file.name)
    if (fileExtension === 'jpg') fileExtension = 'jpeg'
    const fileEncoding = 'base64'
    const contentPrefix = `data:image/${fileExtension};base64,`
    var buf = Buffer.from(file.data, 'base64')
    fs.writeFileSync(fileName, buf)
    content = `${contentPrefix}${fs.readFileSync(fileName, fileEncoding)}`
    console.log(content.substring(0, 40))

    const newFile = {
      parentDir: file.parentDir.replace(`${rootDir}`, ''),
      name: file.name,
      type: 'file',
      extension: fileExtension,
      encoding: fileEncoding,
      content: content
    }
    callback(newFile)
  })

  socket.on('CREATE_DIRECTORY', (payload, callback) => {
    console.log('CREATE_DIRECTORY', payload)
    fs.mkdir(`${rootDir}/${payload.path}`, { recursive: true },
      (err) => {
        if (err) throw err
        callback(err, `Added ${payload}`)
      }
    )
  })

  socket.on('CHANGE_BRANCH', (payload) => {
    if (appServer !== undefined) {
      appServer.stdin.end()
      appServer.kill('SIGINT')
      appServer = undefined
    }
    const removeFiles = `cd ${rootDir} && mv ${payload.name}/commits ${rootDir}/commits && rm -rf ${payload.name} && mkdir ${payload.name} && mv ${rootDir}/commits ${payload.name}/commits`
    const fileRemover = spawn(removeFiles, { shell: true })
    fileRemover.stderr.on('data', function (err) {
      console.error('STDERR:', err.toString())
      socket.emit('TERMINAL_ERROR', err.toString())
    })
    fileRemover.stdout.on('data', function (data) {
      console.log('STDOUT:', data.toString())
      socket.emit('TERMINAL_STDOUT', data.toString())
    })
    fileRemover.on('exit', function (exitCode) {
      const files = payload.files
      files.forEach(file => {
        const dir = `${rootDir}${file.parentDir}`
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true })
        }
        if (file.type === 'file') {
          if (['png', 'jpg', 'jpeg'].find(ext => ext === file.extension)) {
            if (file.extension === 'jpg') file.extension = 'jpeg'
            const data = file.content.replace(/^data:image\/\w+;base64,/, '')
            var buf = Buffer.from(data, 'base64')
            fs.writeFileSync(`${dir}${file.name}`, buf)
          } else {
            fs.writeFileSync(`${dir}${file.name}`, file.content, { encoding: file.encoding })
          }
        }
        socket.emit('TERMINAL_STDOUT', `${dir}${file.name}`)
      })
      const yarnInstallCmd = `cd ${rootDir}/${payload.name} && yarn install`
      const yarnInstall = spawn(yarnInstallCmd, { shell: true })
      yarnInstall.stderr.on('data', function (err) {
        socket.emit('TERMINAL_ERROR', err.toString())
      })
      yarnInstall.stdout.on('data', function (data) {
        socket.emit('TERMINAL_STDOUT', data.toString())
      })
      yarnInstall.on('exit', function () {
        socket.emit('TERMINAL_EXIT', 'CHANGE_BRANCH_FINISHED')
      })
    })
  })

  socket.on('GET_TEMPLATES', (payload, callback) => {
    console.log('GET_TEMPLATES')
    let entries = fs.readdirSync('./templates/dna/', { withFileTypes: true })
    entries = entries.filter(entry => entry.isDirectory())
    const templates = entries.map(folder => ({
      ...folder,
      preview: `data:image/png;base64,${fs.readFileSync(
        `./templates/dna/${folder.name}/preview.png`,
        'base64'
      )}`
    }))
    callback(templates)
  })

  socket.on('GET_WEB_PART_TEMPLATES', (payload, callback) => {
    console.log('GET_WEB_PART_TEMPLATES')
    let entries = fs.readdirSync(`./templates/${payload.webPartType}/`, {
      withFileTypes: true
    })
    entries = entries.filter(entry => entry.isDirectory())
    console.log(entries)
    const templates = entries.map(folder => ({
      ...folder,
      preview: `data:image/png;base64,${fs.readFileSync(
        `./templates/${payload.webPartType}/${folder.name}/preview.png`,
        'base64'
      )}`
    }))
    callback(templates)
  })

  socket.on('CLONE_DNA', (payload, callback) => {
    console.log('CLONE_DNA', payload)
    const cloneDna = `cp -r ./templates/dna/${payload.template} ${rootDir}/${payload.name}/dna && mv ${rootDir}/${payload.name}/dna/${payload.template}.dna.workdir ${rootDir}/${payload.name}/dna/${payload.name}.dna.workdir && mv ${rootDir}/${payload.name}/dna/tests/src/${payload.template}.ts ${rootDir}/${payload.name}/dna/tests/src/${payload.name}.ts && mv ${rootDir}/${payload.name}/dna/zomes/${payload.template} ${rootDir}/${payload.name}/dna/zomes/${payload.name} && cd ${rootDir}/${payload.name}/dna && grep -rl '${payload.template.charAt(0).toUpperCase()}${payload.template.slice(1)}' . | xargs sed -i "" 's/${payload.template.charAt(0).toUpperCase()}${payload.template.slice(1)}/${payload.name.charAt(0).toUpperCase()}${payload.name.slice(1)}/g' && grep -rl '${payload.template}' . | xargs sed -i "" 's/${payload.template}/${payload.name}/g' && cd ${rootDir}/${payload.name}/dna/tests && npm install`
    const dnaCloner = spawn(cloneDna, { shell: true })
    dnaCloner.stderr.on('data', function (err) {
      console.error('STDERR:', err.toString())
    })
    dnaCloner.stdout.on('data', function (data) {
      console.log('STDOUT:', data.toString())
    })
    dnaCloner.on('exit', function (exitCode) {
      console.log('Child exited with code: ' + exitCode)
      callback(exitCode, 'Child exited with code: ' + exitCode)
    })
  })

  socket.on('RENAME_ENTRY_TYPE', (payload) => {
    console.log('RENAME_ENTRY_TYPE', payload)
    const renameCmd = `mv ${rootDir}${payload.entryTypeToDuplicate.parentDir}${payload.entryTypeToDuplicate.name} ${rootDir}${payload.entryTypeToDuplicate.parentDir}${payload.newName} && cd ${rootDir}${payload.entryTypeToDuplicate.parentDir}${payload.newName} && grep -rl '${payload.entryTypeToDuplicate.name.charAt(0).toUpperCase()}${payload.entryTypeToDuplicate.name.slice(1)}' . | xargs sed -i "" 's/${payload.entryTypeToDuplicate.name.charAt(0).toUpperCase()}${payload.entryTypeToDuplicate.name.slice(1)}/${payload.newName.charAt(0).toUpperCase()}${payload.newName.slice(1)}/g' && grep -rl '${payload.entryTypeToDuplicate.name}' . | xargs sed -i "" 's/${payload.entryTypeToDuplicate.name}/${payload.newName}/g'`
    console.log('socket.on ~ renameCmd', renameCmd)
    const renamer = spawn(renameCmd, { shell: true })
    renamer.stderr.on('data', function (err) {
      console.error('STDERR:', err.toString())
      socket.emit('TERMINAL_STDERR', err.toString())
    })
    renamer.stdout.on('data', function (data) {
      console.log('STDOUT:', data.toString())
      socket.emit('TERMINAL_STDOUT', data.toString())
    })
    renamer.on('exit', function () {
      const renameCmd = `mv ${rootDir}${payload.entryTypeToDuplicate.testPath}${payload.entryTypeToDuplicate.name} ${rootDir}/${payload.entryTypeToDuplicate.testPath}${payload.newName} && cd ${rootDir}/${payload.entryTypeToDuplicate.testPath}${payload.newName} && grep -rl '${payload.entryTypeToDuplicate.name.charAt(0).toUpperCase()}${payload.entryTypeToDuplicate.name.slice(1)}' . | xargs sed -i "" 's/${payload.entryTypeToDuplicate.name.charAt(0).toUpperCase()}${payload.entryTypeToDuplicate.name.slice(1)}/${payload.newName.charAt(0).toUpperCase()}${payload.newName.slice(1)}/g' && grep -rl '${payload.entryTypeToDuplicate.name}' . | xargs sed -i "" 's/${payload.entryTypeToDuplicate.name}/${payload.newName}/g'`
      console.log('socket.on ~ renameCmd', renameCmd)
      const testRenamer = spawn(renameCmd, { shell: true })
      testRenamer.stderr.on('data', function (err) {
        console.error('STDERR:', err.toString())
      })
      testRenamer.stdout.on('data', function (data) {
        console.log('STDOUT:', data.toString())
        socket.emit('TERMINAL_STDOUT', data.toString())
      })
      testRenamer.on('exit', function () {
        socket.emit('TERMINAL_EXIT', 'RENAME_ENTRY_TYPE_FINISHED')
        getFoldersAndFiles(`${rootDir}/${payload.name}/`, socket)
        socket.emit('GET_STATUS_EXIT')
      })
    })
  })

  socket.on('DUPLICATE_ENTRY_TYPE', (payload) => {
    console.log('DUPLICATE_ENTRY_TYPE', payload)
    const renameCmd = `cp -r ${rootDir}${payload.entryTypeToDuplicate.parentDir}${payload.entryTypeToDuplicate.name} ${rootDir}${payload.entryTypeToDuplicate.parentDir}${payload.newName} && cd ${rootDir}${payload.entryTypeToDuplicate.parentDir}${payload.newName} && grep -rl '${payload.entryTypeToDuplicate.name.charAt(0).toUpperCase()}${payload.entryTypeToDuplicate.name.slice(1)}' . | xargs sed -i "" 's/${payload.entryTypeToDuplicate.name.charAt(0).toUpperCase()}${payload.entryTypeToDuplicate.name.slice(1)}/${payload.newName.charAt(0).toUpperCase()}${payload.newName.slice(1)}/g' && grep -rl '${payload.entryTypeToDuplicate.name}' . | xargs sed -i "" 's/${payload.entryTypeToDuplicate.name}/${payload.newName}/g'`
    console.log('socket.on ~ renameCmd', renameCmd)
    const renamer = spawn(renameCmd, { shell: true })
    renamer.stderr.on('data', function (err) {
      console.error('STDERR:', err.toString())
      socket.emit('TERMINAL_STDERR', data.toString())
    })
    renamer.stdout.on('data', function (data) {
      console.log('STDOUT:', data.toString())
      socket.emit('TERMINAL_STDOUT', data.toString())
    })
    renamer.on('exit', function () {
      const renameCmd = `cp -r ${rootDir}${payload.entryTypeToDuplicate.testPath}${payload.entryTypeToDuplicate.name} ${rootDir}/${payload.entryTypeToDuplicate.testPath}${payload.newName} && cd ${rootDir}/${payload.entryTypeToDuplicate.testPath}${payload.newName} && grep -rl '${payload.entryTypeToDuplicate.name.charAt(0).toUpperCase()}${payload.entryTypeToDuplicate.name.slice(1)}' . | xargs sed -i "" 's/${payload.entryTypeToDuplicate.name.charAt(0).toUpperCase()}${payload.entryTypeToDuplicate.name.slice(1)}/${payload.newName.charAt(0).toUpperCase()}${payload.newName.slice(1)}/g' && grep -rl '${payload.entryTypeToDuplicate.name}' . | xargs sed -i "" 's/${payload.entryTypeToDuplicate.name}/${payload.newName}/g'`
      console.log('socket.on ~ renameCmd', renameCmd)
      const testRenamer = spawn(renameCmd, { shell: true })
      testRenamer.stderr.on('data', function (err) {
        console.error('STDERR:', err.toString())
      })
      testRenamer.stdout.on('data', function (data) {
        console.log('STDOUT:', data.toString())
        socket.emit('TERMINAL_STDOUT', data.toString())
      })
      testRenamer.on('exit', function () {
        socket.emit('TERMINAL_EXIT', 'DUPLICATE_ENTRY_TYPE_FINISHED')
        getFoldersAndFiles(`${rootDir}/${payload.name}/dna/`, socket)
        socket.emit('GET_STATUS_EXIT')
      })
    })
  })

  socket.on('CLONE_WEB_PART', (payload, callback) => {
    console.log('CLONE_WEB_PART', payload)
    const cloneDna = `cp -r ./templates/${payload.webPartType}/${payload.template} ${rootDir}/${payload.name}/src/${payload.webPartType}/${payload.name}/${payload.webPartName}`
    const dnaCloner = spawn(cloneDna, { shell: true })
    dnaCloner.stderr.on('data', function (err) {
      socket.emit('TERMINAL_STDOUT', err.toString())
    })
    dnaCloner.stdout.on('data', function (data) {
      socket.emit('TERMINAL_STDOUT', data.toString())
    })
    dnaCloner.on('exit', function () {
      socket.emit('TERMINAL_EXIT', 'CLONE_WEB_PART_FINISHED')
      getFoldersAndFiles(`${rootDir}/${payload.name}/src/`, socket)
      socket.emit('GET_STATUS_EXIT')
    })
  })

  socket.on('GET_STATUS', (payload) => {
    console.log(payload)
    if (payload.name.includes('vue-cli-plugin')) {
      rootDir = devPluginsDir
      console.log('GET_STATUS RootDIR', rootDir)
      console.log('GET_STATUS payload.name', payload.name)
    } else {
      rootDir = devAppsDir
      console.log('GET_STATUS RootDIR', rootDir)
      console.log('GET_STATUS payload.name', payload.name)
    }
    getFoldersAndFiles(`${rootDir}/${payload.name}/`, socket)
    socket.emit('GET_STATUS_EXIT')
  })

  socket.on('GET_APPLICATIONS', (_, callback) => {
    const entries = fs.readdirSync(`${devAppsDir}/`, { withFileTypes: true }).filter(entry => entry.isDirectory())
    callback(entries)
  })

  socket.on('GET_PLUGINS', (_, callback) => {
    console.log('GET_PLUGINS')
    console.log(devPluginsDir)
    const entries = fs.readdirSync(`${devPluginsDir}/`, { withFileTypes: true }).filter(entry => entry.isDirectory())
    callback(entries)
  })

  socket.on('COMMIT_CHANGES', (payload) => {
    console.log('COMMIT_CHANGES', payload)
    console.log(rootDir)
    const commit = JSON.parse(payload.commit)
    if (!fs.existsSync(`${rootDir}/${payload.application}/commits`)) {
      fs.mkdirSync(`${rootDir}/${payload.application}/commits`, { recursive: true })
    }
    fs.writeFile(
      `${rootDir}/${payload.application}/commits/${commit.uuid}.json`,
      payload.commit,
      err => {
        if (err) throw err
        console.log('Commit saved!')
      }
    )
  })

  socket.on('CREATE_APPLICATION', (payload) => {
    console.log(payload)
    // save the preset as a file for vue cli
    fs.writeFile(`${devAppsDir}/preset.json`, JSON.stringify(payload.preset),
      err => {
        if (err) throw err
        console.log('preset.json saved!')
        const createApp = `cd ${devAppsDir} && npx vue create ${payload.name} --preset ./preset.json --no-git`
        console.log('CREATE_APPLICATION', createApp)
        const appCreator = spawn(createApp, { shell: true })
        appCreator.stderr.on('data', function (err) {
          console.error('STDERR:', err.toString())
          socket.emit('TERMINAL_ERROR', err.toString())
        })
        appCreator.stdout.on('data', function (data) {
          console.log('STDOUT:', data.toString())
          socket.emit('TERMINAL_STDOUT', data.toString())
        })
        appCreator.on('exit', function (exitCode) {
          console.log('Child exited with code: ' + exitCode)
          socket.emit('TERMINAL_EXIT', 'CREATE_APPLICATION_FINISHED')
          getFoldersAndFiles(`${devAppsDir}/${payload.name}/`, socket)
          socket.emit('GET_STATUS_EXIT')
        })
      }
    )
  })

  socket.on('CREATE_APP_PLUGIN', (payload) => {
    console.log(payload)
    rootDir = devPluginsDir
    const name = payload.name
    const applicationName = payload.applicationName
    const product = payload.product
    const cloneAppPluginTemplate = `cp -r ./templates/app-plugins/${product.template} ${devPluginsDir}/${name}`
    const appPluginCloner = spawn(cloneAppPluginTemplate, { shell: true })
    appPluginCloner.stderr.on('data', function (err) {
      console.error('STDERR:', err.toString())
    })
    appPluginCloner.stdout.on('data', function (data) {
      console.log('STDOUT:', data.toString())
      socket.emit('TERMINAL_STDOUT', data.toString())
    })
    appPluginCloner.on('exit', function (exitCode) {
      console.log('Child exited with code: ' + exitCode)
      const cloneAppPlginFilesCommand = `mkdir -p ${devPluginsDir}/${name}/generator/templates/${applicationName} && cp -r ${devAppsDir}/${applicationName}/src ${devPluginsDir}/${name}/generator/templates/${applicationName} && cp -r ${devAppsDir}/${applicationName}/tests ${devPluginsDir}/${name}/generator/templates/${applicationName} && mkdir -p ${devPluginsDir}/${name}/generator/templates/${applicationName}/public && cp ${devAppsDir}/${applicationName}/public/robots.txt ${devPluginsDir}/${name}/generator/templates/${applicationName}/public && cp ${devAppsDir}/${applicationName}/Procfile ${devPluginsDir}/${name}/generator/templates/${applicationName}/Procfile`
      const appPluginFilesCloner = spawn(cloneAppPlginFilesCommand, { shell: true })
      appPluginFilesCloner.stderr.on('data', function (err) {
        socket.emit('TERMINAL_ERROR', err.toString())
      })
      appPluginFilesCloner.stdout.on('data', function (data) {
        socket.emit('TERMINAL_STDOUT', data.toString())
      })
      appPluginFilesCloner.on('exit', function () {
        socket.emit('TERMINAL_EXIT', 'CREATE_APP_PLUGIN_FINISHED')
        getFoldersAndFiles(`${devPluginsDir}/${payload.name}/`, socket)
      })
    })
  })

  socket.on('CREATE_MODULE_PLUGIN', (payload) => {
    console.log(payload)
    rootDir = devPluginsDir
    const name = payload.name
    // const applicationName = payload.applicationName
    const product = payload.product
    const cloneModulePluginTemplate = `cp -r ./templates/module-plugins/${product.template} ${devPluginsDir}/${name}`
    const modulePluginCloner = spawn(cloneModulePluginTemplate, { shell: true })
    modulePluginCloner.stderr.on('data', function (err) {
      console.error('STDERR:', err.toString())
    })
    modulePluginCloner.stdout.on('data', function (data) {
      console.log('STDOUT:', data.toString())
      socket.emit('TERMINAL_STDOUT', data.toString())
    })
    modulePluginCloner.on('exit', function (exitCode) {
      console.log('Child exited with code: ' + exitCode)
      // const cloneAppPlginFilesCommand = `mkdir -p ${devPluginsDir}/${name}/generator/templates/${applicationName} && cp -r ${devAppsDir}/${applicationName}/src ${devPluginsDir}/${name}/generator/templates/${applicationName} && cp -r ${devAppsDir}/${applicationName}/tests ${devPluginsDir}/${name}/generator/templates/${applicationName} && mkdir -p ${devPluginsDir}/${name}/generator/templates/${applicationName}/public && cp ${devAppsDir}/${applicationName}/public/robots.txt ${devPluginsDir}/${name}/generator/templates/${applicationName}/public && cp ${devAppsDir}/${applicationName}/Procfile ${devPluginsDir}/${name}/generator/templates/${applicationName}/Procfile`
      // const appPluginFilesCloner = spawn(cloneAppPlginFilesCommand, { shell: true })
      // appPluginFilesCloner.stderr.on('data', function (err) {
      //   socket.emit('TERMINAL_ERROR', err.toString())
      // })
      // appPluginFilesCloner.stdout.on('data', function (data) {
      //   socket.emit('TERMINAL_STDOUT', data.toString())
      // })
      // appPluginFilesCloner.on('exit', function () {
      //   socket.emit('TERMINAL_EXIT', 'CREATE_APP_PLUGIN_FINISHED')
      getFoldersAndFiles(`${devPluginsDir}/${payload.name}/`, socket)
      // })
    })
  })

  socket.on('PUBLISH_PLUGIN', (payload) => {
    npmLogin('philipbeadle', 'horsechildsuperbeach', 'philip.beadle@holo.host')
    const name = payload.name
    const publishCommand = `cd ${devPluginsDir}/${name} && npm publish`
    const publisher = spawn(publishCommand, { shell: true })
    publisher.stderr.on('data', function (err) {
      socket.emit('TERMINAL_ERROR', err.toString())
    })
    publisher.stdout.on('data', function (data) {
      socket.emit('TERMINAL_STDOUT', data.toString())
    })
    publisher.on('exit', function () {
      socket.emit('TERMINAL_EXIT', 'PUBLISH_PLUGIN_FINISHED')
    })
  })

  socket.on('ADD_MODULE', (payload) => {
    const yarnAddCommand = `cd ${rootDir}/${payload.name} && yarn add ${payload.plugin}`
    console.log(yarnAddCommand)
    const yarnAdd = spawn(yarnAddCommand, { shell: true })
    yarnAdd.stderr.on('data', function (err) {
      console.error('STDERR:', err.toString())
      socket.emit('TERMINAL_ERROR', err.toString())
    })
    yarnAdd.stdout.on('data', function (data) {
      console.log('STDOUT:', data.toString())
      socket.emit('TERMINAL_STDOUT', data.toString())
    })
    yarnAdd.on('exit', function (exitCode) {
      console.log('Child exited with code: ' + exitCode)
      const invokePlugin = `cd ${rootDir}/${payload.name} && npx vue invoke ${payload.plugin}`
      const pluginInvoker = spawn(invokePlugin, { shell: true })
      pluginInvoker.stderr.on('data', function (err) {
        console.error('STDERR:', err.toString())
        socket.emit('TERMINAL_ERROR', err.toString())
      })
      pluginInvoker.stdout.on('data', function (data) {
        console.log('STDOUT:', data.toString())
        socket.emit('TERMINAL_STDOUT', data.toString())
      })
      pluginInvoker.on('exit', function (exitCode) {
        console.log('Child exited with code: ' + exitCode)
        socket.emit('TERMINAL_EXIT', 'ADD_MODULE_FINISHED')
        getFoldersAndFiles(`${rootDir}/${payload.name}/`, socket)
        socket.emit('GET_STATUS_EXIT')
      })
    })    
  })

  socket.on('LINT_FILES', (payload, callback) => {
    const lintFiles = `cd ${rootDir}/${payload.name} && yarn lint`
    console.log('LINT_FILES', lintFiles)
    const fileLinter = spawn(lintFiles, { shell: true })
    fileLinter.stderr.on('data', function (err) {
      socket.emit('TERMINAL_ERROR', err.toString())
    })
    fileLinter.stdout.on('data', function (data) {
      socket.emit('TERMINAL_STDOUT', data.toString())
    })
    fileLinter.on('exit', function () {
      socket.emit('LINT_FILES_EXIT', 'LINT_FILES_FINISHED')
    })
  })

  socket.on('START_WEB_SERVER', (payload) => {
    if (appServer !== undefined) {
      appServer.stdin.end()
      appServer.kill('SIGINT')
      appServer = undefined
    }
    const serveWebApp = `cd ${rootDir}/${payload.name} && yarn start`
    appServer = spawn(serveWebApp, { shell: true })
    appServer.stderr.on('data', function (err) {
      console.error('STDERR:', err.toString())
      socket.emit('SERVE_WEB_APP_ERROR', err.toString())
    })
    appServer.stdout.on('data', function (data) {
      console.log('STDOUT:', data.toString())
      socket.emit('SERVE_WEB_APP_STDOUT', data.toString())
    })
    appServer.on('exit', function (exitCode) {
      console.log('Child exited with code: ' + exitCode)
      socket.emit('SERVE_WEB_APP_EXIT', exitCode)
    })
  })
  socket.on('STOP_WEB_SERVER', () => {
    if (appServer !== undefined) appServer.kill()
    socket.emit('SERVE_WEB_APP_EXIT', 'WEB_SERVER_STOPPED')
  })

  socket.on('IS_CONDUCTOR_RUNNING', () => {
    socket.emit('CONDUCTOR_RUNNING', conductor !== undefined)
  })
  socket.on('START_CONDUCTOR', () => {
    conductor = spawn('holochain', ['-c', './devConductor/developer.yaml'])
    conductor.stderr.on('data', function (err) {
      console.error('CONDUCTOR_ERROR:', err.toString())
      socket.emit('CONDUCTOR_ERROR', err.toString())
    })
    conductor.stdout.on('data', function (data) {
      console.log('CONDUCTOR_STDOUT:', data.toString())
      socket.emit('CONDUCTOR_STDOUT', data.toString())
    })
    conductor.on('exit', function (exitCode) {
      console.log('CONDUCTOR_EXIT with code: ' + exitCode)
      socket.emit('CONDUCTOR_RUNNING', false)
      socket.emit('CONDUCTOR_EXIT', exitCode)
    })
    conductor.on('close', function (exitCode) {
      console.log('CONDUCTOR_CLOSE with code: ' + exitCode)
      socket.emit('CONDUCTOR_RUNNING', false)
      socket.emit('CONDUCTOR_CLOSE', exitCode)
    })
  })

  socket.on('RESET_CONDUCTOR', () => {
    if (conductor !== undefined) {
      conductor.stdin.end()
      conductor.kill('SIGHUP')
      conductor = undefined
    }
    const reset = `cd devConductor && rm -rf files && mkdir files`
    console.log('RESET_CONDUCTOR', reset)
    const resetConductor = spawn(reset, { shell: true })
    resetConductor.stderr.on('data', function (err) {
      console.error('STDERR:', err.toString())
      socket.emit('CONDUCTOR_ERROR', err.toString())
    })
    resetConductor.stdout.on('data', function (data) {
      console.log('STDOUT:', data.toString())
      socket.emit('CONDUCTOR_STDOUT', data.toString())
    })
    resetConductor.on('exit', function (exitCode) {
      console.log('Child exited with code: ' + exitCode)
      socket.emit('CONDUCTOR_EXIT', 'RESET_CONDUCTOR_FINISHED')
    })
  })

  socket.on('TEST_DNA', (payload, callback) => {
    const testDnaCmd = `cd ${rootDir}${payload.path}/tests && yarn install && yarn test`
    console.log('TEST_DNA', testDnaCmd)
    const dnaTester = spawn(testDnaCmd, { shell: true })
    dnaTester.stderr.on('data', function (err) {
      console.error('STDERR:', err.toString())
      socket.emit('TEST_DNA_ERROR', err.toString())
    })
    dnaTester.stdout.on('data', function (data) {
      console.log('STDOUT:', data.toString())
      socket.emit('TEST_DNA_STDOUT', data.toString())
    })
    dnaTester.on('exit', function (exitCode) {
      console.log('Child exited with code: ' + exitCode)
      socket.emit('TEST_DNA_EXIT', exitCode)
    })
  })

  socket.on('YARN_ADD', (payload, callback) => {
    console.log('YARN_ADD')
    const yarnAddCommand = `cd ${rootDir}/${payload.name} && yarn add ${payload.modules}`
    console.log('YARN_ADD', yarnAddCommand)
    const yarnAdd = spawn(yarnAddCommand, { shell: true })
    yarnAdd.stderr.on('data', function (err) {
      console.error('STDERR:', err.toString())
      socket.emit('YARN_ADD_ERROR', err.toString())
    })
    yarnAdd.stdout.on('data', function (data) {
      console.log('STDOUT:', data.toString())
      socket.emit('YARN_ADD_STDOUT', data.toString())
    })
    yarnAdd.on('exit', function (exitCode) {
      console.log('Child exited with code: ' + exitCode)
      socket.emit('YARN_ADD_EXIT', exitCode)
    })
  })

  socket.on('REINSTALL_NODE_MODULES', (payload) => {
    const yarnReinstallCmd = `cd ${rootDir}/${payload.name} && rm -rf node_modules && yarn install`
      const yarnInstall = spawn(yarnReinstallCmd, { shell: true })
      yarnInstall.stderr.on('data', function (err) {
        socket.emit('TERMINAL_ERROR', err.toString())
      })
      yarnInstall.stdout.on('data', function (data) {
        socket.emit('TERMINAL_STDOUT', data.toString())
      })
      yarnInstall.on('exit', function () {
        socket.emit('TERMINAL_EXIT', 'REINSTALL_NODE_MODULES_FINISHED')
      })
  })

  socket.on('CREATE_INVITE_PACKAGE', (payload) => {
    fs.writeFile(`${orgInvitePackageDir}/org-details.json`, JSON.stringify(payload),
      err => {
        if (err) throw err
        console.log(`${orgInvitePackageDir}/org-details.json has been saved!`)
      }
    )
    const createInviteCmd = `cd ${builderDnaDir} && find . -type f \\( -iname "*.dna.gz" ! -iname "test.dna.gz" \\) |  xargs  -I _ cp _ ${orgInvitePackageDir} && cd  ${orgInvitePackageDir} && tar -cvzf invite.tar.gz .`
      const inviteCreator = spawn(createInviteCmd, { shell: true })
      inviteCreator.stderr.on('data', function (err) {
        console.log('CREATE_INVITE_PACKAGE_ERROR', err.toString())
      })
      inviteCreator.stdout.on('data', function (data) {
        console.log('CREATE_INVITE_PACKAGE_STDOUT', data.toString())
      })
      inviteCreator.on('exit', function () {
        console.log('CREATE_INVITE_PACKAGE_EXIT', orgInvitePackageDir)
      })
  })

  socket.on('JOIN_ORGANISATION', (payload, callback) => {
    var buf = Buffer.from(payload.data, 'gzip')
    fs.writeFileSync(`${allOrgsDir}/invite.tar.gz`, buf)
    const joinOrgCmd = `cd ${allOrgsDir} && tar -xf ${allOrgsDir}/invite.tar.gz`
      const orgJoiner = spawn(joinOrgCmd, { shell: true })
      orgJoiner.stderr.on('data', function (err) {
        console.log('JOIN_ORGANISATION_ERROR', err.toString())
      })
      orgJoiner.stdout.on('data', function (data) {
        console.log('JOIN_ORGANISATION_STDOUT', data.toString())
      })
      orgJoiner.on('exit', function () {
        const organisation = JSON.parse(fs.readFileSync(`${allOrgsDir}/org-details.json`))
        callback(organisation)
        console.log('JOIN_ORGANISATION_EXIT', organisation)
      })
  })
})
io.on('error', () => {
  console.log('Error')
})

server.listen(SERVER_PORT, () => {
  console.log(`Listening on port:${SERVER_PORT}`)
})
