const server = require('http').createServer()
const options = {}
const devAppsDir = `${__dirname.replace('builder/socket', '')}dev-apps`
const io = require('socket.io')(server, options)
const fs = require('fs')
const SERVER_PORT = 45678
const { spawn } = require('child_process')

function getFileType (fileName) {
  if (fileName.startsWith('.')) return fileName.replace('.', '')
  const index = fileName.lastIndexOf('.') + 1
  const fileType = fileName.substring(index, fileName.length)
  return fileType
}
function getFoldersAndFiles (parentDir, socket) {
  console.log(parentDir)
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
    console.log(folder.name)
    const folderEntries = fs.readdirSync(`${parentDir}${folder.name}/`, {
      withFileTypes: true
    })
    if (folderEntries.length > 0) {
      const newDirectory = {
        parentDir: parentDir.replace(`${devAppsDir}`, ''),
        name: folder.name,
        type: 'dir'
      }
      socket.emit('RECURSE_APPLICATION_FILES', newDirectory)
      getFoldersAndFiles(`${parentDir}${folder.name}/`, socket)
    }
  }
  const files = entries
    .filter(entry => !entry.isDirectory())
    .filter(entry => entry.name !== '.DS_Store')
  for (const file of files) {
    let fileExtension = getFileType(file.name)
    let contentPrefix = ''
    let fileEncoding = 'utf8'
    if (['png', 'jpg', 'jpeg'].find(ext => ext === fileExtension)) {
      if (fileExtension === 'jpg') fileExtension = 'jpeg'
      fileEncoding = 'base64'
      contentPrefix = `data:image/${fileExtension};base64,`
    }
    const content = `${contentPrefix}${fs.readFileSync(
      `${parentDir}${file.name}`,
      fileEncoding
    )}`
    const newFile = {
      parentDir: parentDir.replace(`${devAppsDir}`, ''),
      name: file.name,
      type: 'file',
      extension: fileExtension,
      encoding: fileEncoding,
      content: content
    }
    socket.emit('RECURSE_APPLICATION_FILES', newFile)
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

  socket.on('CREATE_DIRECTORY', (payload, callback) => {
    console.log('CREATE_DIRECTORY', payload)
    fs.mkdir(`${devAppsDir}/dev-apps/${payload.path}`, { recursive: true },
      (err) => {
        if (err) throw err
        callback(err, `Added ${payload}`)
      }
    )
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

  socket.on('RENAME_ENTRY_TYPE', (payload, callback) => {
    console.log('RENAME_ENTRY_TYPE', payload)
    const renameCmd = `mv ${devAppsDir}/${payload.name}/dna/zomes/${payload.name}/src/entries/${payload.oldName} ${devAppsDir}/${payload.name}/dna/zomes/${payload.name}/src/entries/${payload.newName} && mv ${devAppsDir}/${payload.name}/dna/zomes/${payload.name}/src/entries/${payload.oldName}.rs ${devAppsDir}/${payload.name}/dna/zomes/${payload.name}/src/entries/${payload.newName}.rs && cd ${devAppsDir}/${payload.name}/dna/zomes/${payload.name}/src && grep -rl '${payload.oldName.charAt(0).toUpperCase()}${payload.oldName.slice(1)}' . | xargs sed -i "" 's/${payload.oldName.charAt(0).toUpperCase()}${payload.oldName.slice(1)}/${payload.newName.charAt(0).toUpperCase()}${payload.newName.slice(1)}/g' && grep -rl '${payload.oldName}' . | xargs sed -i "" 's/${payload.oldName}/${payload.newName}/g' && cd ${devAppsDir}/${payload.name}/dna/tests/src && grep -rl '${payload.oldName.charAt(0).toUpperCase()}${payload.oldName.slice(1)}' . | xargs sed -i "" 's/${payload.oldName.charAt(0).toUpperCase()}${payload.oldName.slice(1)}/${payload.newName.charAt(0).toUpperCase()}${payload.newName.slice(1)}/g' && grep -rl '${payload.oldName}' . | xargs sed -i "" 's/${payload.oldName}/${payload.newName}/g'`
    const renamer = spawn(renameCmd, { shell: true })
    renamer.stderr.on('data', function (err) {
      console.error('STDERR:', err.toString())
    })
    renamer.stdout.on('data', function (data) {
      console.log('STDOUT:', data.toString())
    })
    renamer.on('exit', function (exitCode) {
      console.log('Child exited with code: ' + exitCode)
      callback(exitCode, 'Child exited with code: ' + exitCode)
    })
  })

  socket.on('DUPLICATE_ENTRY_TYPE', (payload, callback) => {
    console.log('DUPLICATE_ENTRY_TYPE', payload)
    const renameCmd = `cp -r ${devAppsDir}/${payload.name}/dna/zomes/${payload.name}/src/entries/${payload.oldName} ${devAppsDir}/${payload.name}/dna/zomes/${payload.name}/src/entries/${payload.newName} && cd ${devAppsDir}/${payload.name}/dna/zomes/${payload.name}/src/entries/${payload.newName} && grep -rl '${payload.oldName.charAt(0).toUpperCase()}${payload.oldName.slice(1)}' . | xargs sed -i "" 's/${payload.oldName.charAt(0).toUpperCase()}${payload.oldName.slice(1)}/${payload.newName.charAt(0).toUpperCase()}${payload.newName.slice(1)}/g' && grep -rl '${payload.oldName}' . | xargs sed -i "" 's/${payload.oldName}/${payload.newName}/g'`
    const renamer = spawn(renameCmd, { shell: true })
    renamer.stderr.on('data', function (err) {
      console.error('STDERR:', err.toString())
    })
    renamer.stdout.on('data', function (data) {
      console.log('STDOUT:', data.toString())
    })
    renamer.on('exit', function (exitCode) {
      console.log('Child exited with code: ' + exitCode)
      callback(exitCode, 'Child exited with code: ' + exitCode)
    })
  })

  socket.on('CLONE_SOCKET', (payload, callback) => {
    console.log('CLONE_DNA', payload)
    const cloneSocket = `cp -r ./templates/socket ${devAppsDir}/${payload.name}/socket && cp -r ./templates/store ${devAppsDir}/${payload.name}/src && mv ${devAppsDir}/${payload.name}/src/store/modules/example.store.js ${devAppsDir}/${payload.name}/src/store/modules/${payload.name}.store.js && cd ${devAppsDir}/${payload.name} && yarn add dexie@next vue-socket.io && cd ${devAppsDir}/${payload.name}/socket && yarn install`
    const socketCloner = spawn(cloneSocket, { shell: true })
    socketCloner.stderr.on('data', function (err) {
      console.error('STDERR:', err.toString())
    })
    socketCloner.stdout.on('data', function (data) {
      console.log('STDOUT:', data.toString())
    })
    socketCloner.on('exit', function (exitCode) {
      console.log('Child exited with code: ' + exitCode)
      callback(exitCode, 'Child exited with code: ' + exitCode)
    })
  })

  socket.on('CLONE_WEB_PART', (payload, callback) => {
    console.log('CLONE_WEB_PART', payload)
    const cloneDna = `cp -r ./templates/${payload.webPartType}/${payload.template} ${devAppsDir}/${payload.name}/src/${payload.webPartType}/${payload.webPartName}`
    const dnaCloner = spawn(cloneDna, { shell: true })
    dnaCloner.stderr.on('data', function (err) {
      console.error('STDERR:', err.toString())
    })
    dnaCloner.stdout.on('data', function (data) {
      console.log('STDOUT:', data.toString())
    })
    dnaCloner.on('exit', function (exitCode) {
      console.log('CLONE_WEB_PART exited with code: ' + exitCode)
      callback(exitCode, 'CLONE_WEB_PART exited with code: ' + exitCode)
    })
  })

  socket.on('RECURSE_APPLICATION_FILES', (payload, callback) => {
    console.log('RECURSE_APPLICATION_FILES', payload.name)
    getFoldersAndFiles(`${devAppsDir}/${payload.name}/`, socket)
  })

  socket.on('CREATE_APPLICATION', (payload) => {
    console.log(payload)
    const createApp = `cd ${devAppsDir} && echo | vue create ${payload.name} --preset /Users/philipbeadle/holochain/app-developer-tools/vue-cli-plugin-holochain-simple/preset.json --no-git`
    console.log('CREATE_APPLICATION', createApp)
    const appCreator = spawn(createApp, { shell: true })
    appCreator.stderr.on('data', function (err) {
      console.error('STDERR:', err.toString())
      socket.emit('CREATE_APLICATION_ERROR', err.toString())
    })
    appCreator.stdout.on('data', function (data) {
      console.log('STDOUT:', data.toString())
      socket.emit('CREATE_APLICATION_STDOUT', data.toString())
    })
    appCreator.on('exit', function (exitCode) {
      console.log('Child exited with code: ' + exitCode)
      socket.emit('CREATE_APLICATION_EXIT', exitCode)
      getFoldersAndFiles(`${devAppsDir}/${payload.name}/`, socket)
    })
  })

  socket.on('LINT_FILES', (payload, callback) => {
    const lintFiles = `cd ${devAppsDir}/${payload.name} && yarn lint`
    console.log('LINT_FILES', lintFiles)
    const fileLinter = spawn(lintFiles, { shell: true })
    fileLinter.stderr.on('data', function (err) {
      console.error('STDERR:', err.toString())
      socket.emit('LINT_FILES_ERROR', err.toString())
    })
    fileLinter.stdout.on('data', function (data) {
      console.log('STDOUT:', data.toString())
      socket.emit('LINT_FILES_STDOUT', data.toString())
    })
    fileLinter.on('exit', function (exitCode) {
      console.log('Child exited with code: ' + exitCode)
      socket.emit('LINT_FILES_EXIT', exitCode)
    })
  })

  socket.on('SERVE_WEB_APP', (payload, callback) => {
    console.log('SERVE_WEB_APP')
    const serveWebApp = `cd ${devAppsDir}/${payload.name} && yarn serve`
    console.log('SERVE_WEB_APP', serveWebApp)
    const fileServer = spawn(serveWebApp, { shell: true })
    fileServer.stderr.on('data', function (err) {
      console.error('STDERR:', err.toString())
      socket.emit('SERVE_WEB_APP_ERROR', err.toString())
    })
    fileServer.stdout.on('data', function (data) {
      console.log('STDOUT:', data.toString())
      socket.emit('SERVE_WEB_APP_STDOUT', data.toString())
    })
    fileServer.on('exit', function (exitCode) {
      console.log('Child exited with code: ' + exitCode)
      socket.emit('SERVE_WEB_APP_EXIT', exitCode)
    })
  })

  socket.on('SOCKET_SERVER', (payload, callback) => {
    console.log('SOCKET_SERVER')
    const socketServerCmd = `cd ${devAppsDir}/${payload.name}/socket && yarn socket`
    console.log('SOCKET_SERVER', socketServerCmd)
    const socketServer = spawn(socketServerCmd, { shell: true })
    socketServer.stderr.on('data', function (err) {
      console.error('STDERR:', err.toString())
      socket.emit('SOCKET_SERVER_ERROR', err.toString())
    })
    socketServer.stdout.on('data', function (data) {
      console.log('STDOUT:', data.toString())
      socket.emit('SOCKET_SERVER_STDOUT', data.toString())
    })
    socketServer.on('exit', function (exitCode) {
      console.log('Child exited with code: ' + exitCode)
      socket.emit('SOCKET_SERVER_EXIT', exitCode)
    })
  })

  socket.on('TEST_DNA', (payload, callback) => {
    const testDnaCmd = `cd ${devAppsDir}/${payload.name}/dna/tests && npm test`
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
})
io.on('error', () => {
  console.log('Error')
})

server.listen(SERVER_PORT, () => {
  console.log(`Listening on port:${SERVER_PORT}`)
})
