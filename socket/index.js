const server = require('http').createServer()
const options = {}
const devAppsDir = `${__dirname.replace('builder/socket', '')}dev-apps`
const io = require('socket.io')(server, options)
const fs = require('fs')
const SERVER_PORT = 45678
const { spawn } = require('child_process')
let conductor = undefined
let appServer = undefined

function getFileType (fileName) {
  if (fileName.startsWith('.')) return fileName.replace('.', '')
  const index = fileName.lastIndexOf('.') + 1
  const fileType = fileName.substring(index, fileName.length)
  return fileType
}
function getFoldersAndFiles (parentDir, socket) {
  const entries = fs.readdirSync(parentDir, { withFileTypes: true })
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
        parentDir: parentDir.replace(`${devAppsDir}`, ''),
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
      parentDir: parentDir.replace(`${devAppsDir}`, ''),
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
  console.log('Connected', socket.id)
  socket.on('CREATE_AGENT', (payload, callback) => {
    console.log('CREATE_AGENT', payload)
    hcClient.admin.generateAgentPubKey().then(agentKey => {
      callback(agentKey)
    })
  })

  socket.on('SAVE_FILE', payload => {
    fs.writeFile(
      `${devAppsDir}/${payload.parentDir}${payload.name}`,
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
    const fileName = `${devAppsDir}${file.parentDir}${file.name}`
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
      parentDir: file.parentDir.replace(`${devAppsDir}`, ''),
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
    fs.mkdir(`${devAppsDir}/dev-apps/${payload.path}`, { recursive: true },
      (err) => {
        if (err) throw err
        callback(err, `Added ${payload}`)
      }
    )
  })

  socket.on('CHANGE_BRANCH', (payload) => {
    const removeFiles = `cd ${devAppsDir} && rm -rf ${payload.name} && mkdir ${payload.name}`
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
        const dir = `${devAppsDir}${file.parentDir}`
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
      const yarnInstallCmd = `cd ${devAppsDir}/${payload.name} && yarn install`
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
    const cloneDna = `cp -r ./templates/dna/${payload.template} ${devAppsDir}/${payload.name}/dna && mv ${devAppsDir}/${payload.name}/dna/${payload.template}.dna.workdir ${devAppsDir}/${payload.name}/dna/${payload.name}.dna.workdir && mv ${devAppsDir}/${payload.name}/dna/tests/src/${payload.template}.ts ${devAppsDir}/${payload.name}/dna/tests/src/${payload.name}.ts && mv ${devAppsDir}/${payload.name}/dna/zomes/${payload.template} ${devAppsDir}/${payload.name}/dna/zomes/${payload.name} && cd ${devAppsDir}/${payload.name}/dna && grep -rl '${payload.template.charAt(0).toUpperCase()}${payload.template.slice(1)}' . | xargs sed -i "" 's/${payload.template.charAt(0).toUpperCase()}${payload.template.slice(1)}/${payload.name.charAt(0).toUpperCase()}${payload.name.slice(1)}/g' && grep -rl '${payload.template}' . | xargs sed -i "" 's/${payload.template}/${payload.name}/g' && cd ${devAppsDir}/${payload.name}/dna/tests && npm install`
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
    const renameCmd = `mv ${devAppsDir}${payload.entryTypeToDuplicate.parentDir}${payload.entryTypeToDuplicate.name} ${devAppsDir}${payload.entryTypeToDuplicate.parentDir}${payload.newName} && cd ${devAppsDir}${payload.entryTypeToDuplicate.parentDir}${payload.newName} && grep -rl '${payload.entryTypeToDuplicate.name.charAt(0).toUpperCase()}${payload.entryTypeToDuplicate.name.slice(1)}' . | xargs sed -i "" 's/${payload.entryTypeToDuplicate.name.charAt(0).toUpperCase()}${payload.entryTypeToDuplicate.name.slice(1)}/${payload.newName.charAt(0).toUpperCase()}${payload.newName.slice(1)}/g' && grep -rl '${payload.entryTypeToDuplicate.name}' . | xargs sed -i "" 's/${payload.entryTypeToDuplicate.name}/${payload.newName}/g'`
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
      const renameCmd = `mv ${devAppsDir}${payload.entryTypeToDuplicate.testPath}${payload.entryTypeToDuplicate.name} ${devAppsDir}/${payload.entryTypeToDuplicate.testPath}${payload.newName} && cd ${devAppsDir}/${payload.entryTypeToDuplicate.testPath}${payload.newName} && grep -rl '${payload.entryTypeToDuplicate.name.charAt(0).toUpperCase()}${payload.entryTypeToDuplicate.name.slice(1)}' . | xargs sed -i "" 's/${payload.entryTypeToDuplicate.name.charAt(0).toUpperCase()}${payload.entryTypeToDuplicate.name.slice(1)}/${payload.newName.charAt(0).toUpperCase()}${payload.newName.slice(1)}/g' && grep -rl '${payload.entryTypeToDuplicate.name}' . | xargs sed -i "" 's/${payload.entryTypeToDuplicate.name}/${payload.newName}/g'`
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
        getFoldersAndFiles(`${devAppsDir}/${payload.name}/`, socket)
        socket.emit('GET_STATUS_EXIT')
      })
    })
  })

  socket.on('DUPLICATE_ENTRY_TYPE', (payload) => {
    console.log('DUPLICATE_ENTRY_TYPE', payload)
    const renameCmd = `cp -r ${devAppsDir}${payload.entryTypeToDuplicate.parentDir}${payload.entryTypeToDuplicate.name} ${devAppsDir}${payload.entryTypeToDuplicate.parentDir}${payload.newName} && cd ${devAppsDir}${payload.entryTypeToDuplicate.parentDir}${payload.newName} && grep -rl '${payload.entryTypeToDuplicate.name.charAt(0).toUpperCase()}${payload.entryTypeToDuplicate.name.slice(1)}' . | xargs sed -i "" 's/${payload.entryTypeToDuplicate.name.charAt(0).toUpperCase()}${payload.entryTypeToDuplicate.name.slice(1)}/${payload.newName.charAt(0).toUpperCase()}${payload.newName.slice(1)}/g' && grep -rl '${payload.entryTypeToDuplicate.name}' . | xargs sed -i "" 's/${payload.entryTypeToDuplicate.name}/${payload.newName}/g'`
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
      const renameCmd = `cp -r ${devAppsDir}${payload.entryTypeToDuplicate.testPath}${payload.entryTypeToDuplicate.name} ${devAppsDir}/${payload.entryTypeToDuplicate.testPath}${payload.newName} && cd ${devAppsDir}/${payload.entryTypeToDuplicate.testPath}${payload.newName} && grep -rl '${payload.entryTypeToDuplicate.name.charAt(0).toUpperCase()}${payload.entryTypeToDuplicate.name.slice(1)}' . | xargs sed -i "" 's/${payload.entryTypeToDuplicate.name.charAt(0).toUpperCase()}${payload.entryTypeToDuplicate.name.slice(1)}/${payload.newName.charAt(0).toUpperCase()}${payload.newName.slice(1)}/g' && grep -rl '${payload.entryTypeToDuplicate.name}' . | xargs sed -i "" 's/${payload.entryTypeToDuplicate.name}/${payload.newName}/g'`
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
        getFoldersAndFiles(`${devAppsDir}/${payload.name}/dna/`, socket)
        socket.emit('GET_STATUS_EXIT')
      })
    })
  })

  socket.on('CLONE_WEB_PART', (payload, callback) => {
    console.log('CLONE_WEB_PART', payload)
    const cloneDna = `cp -r ./templates/${payload.webPartType}/${payload.template} ${devAppsDir}/${payload.name}/src/${payload.webPartType}/${payload.name}/${payload.webPartName}`
    const dnaCloner = spawn(cloneDna, { shell: true })
    dnaCloner.stderr.on('data', function (err) {
      socket.emit('TERMINAL_STDOUT', err.toString())
    })
    dnaCloner.stdout.on('data', function (data) {
      socket.emit('TERMINAL_STDOUT', data.toString())
    })
    dnaCloner.on('exit', function () {
      socket.emit('TERMINAL_EXIT', 'CLONE_WEB_PART_FINISHED')
      getFoldersAndFiles(`${devAppsDir}/${payload.name}/src/`, socket)
      socket.emit('GET_STATUS_EXIT')
    })
  })

  socket.on('GET_STATUS', (payload, callback) => {
    console.log('GET_STATUS', payload.name)
    getFoldersAndFiles(`${devAppsDir}/${payload.name}/`, socket)
    socket.emit('GET_STATUS_EXIT')
  })

  socket.on('CREATE_APPLICATION', (payload) => {
    console.log(payload)
    const createApp = `cd ${devAppsDir} && npx vue create ${payload.name} --preset ${payload.preset} --no-git`
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
  })

  socket.on('ADD_MODULE', (payload) => {
    const yarnAddCommand = `cd ${devAppsDir}/${payload.name} && yarn add ${payload.plugin}`
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
      const invokePlugin = `cd ${devAppsDir}/${payload.name} && npx vue invoke ${payload.plugin}`
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
        getFoldersAndFiles(`${devAppsDir}/${payload.name}/`, socket)
        socket.emit('GET_STATUS_EXIT')
      })
    })    
  })

  socket.on('LINT_FILES', (payload, callback) => {
    const lintFiles = `cd ${devAppsDir}/${payload.name} && yarn lint`
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
    const serveWebApp = `cd ${devAppsDir}/${payload.name} && yarn start`
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

  socket.on('START_CONDUCTOR', (payload, callback) => {
    console.log('CONDUCTOR')
    const conductorCmd = `RUST_LOG='[debug]=debug,[]=error' holochain -c ./devConductor/developer.yaml`
    console.log('CONDUCTOR', conductorCmd)
    conductor = spawn(conductorCmd, { shell: true })
    conductor.stderr.on('data', function (err) {
      console.error('STDERR:', err.toString())
      socket.emit('CONDUCTOR_ERROR', err.toString())
    })
    conductor.stdout.on('data', function (data) {
      console.log('STDOUT:', data.toString())
      socket.emit('CONDUCTOR_STDOUT', data.toString())
    })
    conductor.on('exit', function (exitCode) {
      console.log('CONDUCTOR_EXIT with code: ' + exitCode)
      socket.emit('CONDUCTOR_EXIT', exitCode)
    })
  })
  socket.on('STOP_CONDUCTOR', () => {
    console.log(conductor !== undefined)
    if (conductor !== undefined) process.kill(conductor.pid)
  })
  socket.on('RESET_CONDUCTOR', () => {
    console.log(conductor !== undefined)
    if (conductor !== undefined) conductor.kill()
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
    const testDnaCmd = `cd ${devAppsDir}${payload.path}/tests && yarn install && yarn test`
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
    const yarnAddCommand = `cd ${devAppsDir}/${payload.name} && yarn add ${payload.modules}`
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
    const yarnReinstallCmd = `cd ${devAppsDir}/${payload.name} && rm -rf node_modules && yarn install`
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
})
io.on('error', () => {
  console.log('Error')
})

server.listen(SERVER_PORT, () => {
  console.log(`Listening on port:${SERVER_PORT}`)
})
