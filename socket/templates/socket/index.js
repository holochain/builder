const server = require('http').createServer()
const options = {
  /* ... */
}
const devAppsDir = `${__dirname.replace('builder/socket', '')}dev-apps`
const io = require('socket.io')(server, options)
const fs = require('fs')
// const path = require("path");
const SERVER_PORT = 11381
const HOLOCHAIN_ADMIN_PORT = 26970
// // const HOLOCHAIN_APP_PORT = 15108;
const hcAws = require('@holochain/conductor-api').AdminWebsocket
// // const holochainAppWebSocket = require("@holochain/conductor-api").AppWebsocket;
const hcClient = {}

const { spawn } = require('child_process')
const conductorReset = spawn('rm -rf ./conductor/files', { shell: true })
conductorReset.on('exit', function (exitCode) {
  setTimeout(() => {
    const holochain = spawn('holochain', ['-c', './conductor/developer.yaml'])
    holochain.stdout.on('data', data => {
      if (`${data}`.indexOf('Conductor ready.') !== -1) {
        console.log('Connecting to Holochain conductor')
        hcAws
          .connect(`ws://localhost:${HOLOCHAIN_ADMIN_PORT}`)
          .then(client => {
            hcClient.admin = client
            console.log('hcClient.admin connected')
          })
          .catch(e => console.log(e))
    
        // holochainAppWebSocket.connect(`ws://localhost:${HOLOCHAIN_APP_PORT}`).then(client => {
        //     hcClient.app = client;
        //     console.log("hcClient.app connected")
        // }).catch(e => console.log(e));
      }
    })
    holochain.stderr.on('data', data => {
      console.error(`stderr: ${data}`)
    })
    holochain.on('close', code => {
      console.log(`holochain process exited with code ${code}`)
    })
  }, 1000)
})

io.on('connection', socket => {
  console.log('Connected', socket.id)
  socket.on('CREATE_AGENT', (payload, callback) => {
    console.log('CREATE_AGENT', payload)
    hcClient.admin.generateAgentPubKey().then(agentKey => {
      callback(agentKey)
    })
  })

  socket.on('SOCKET_EMIT_EXAMPLE_TO_SERVER', (payload) => {
    const createApp = `cd ${devAppsDir} && echo | vue create ${payload.name} --preset vuetifyjs/preset && cd ${payload.name} && echo | vue add vuetify-preset-reply`
    const appCreator = spawn(createApp, { shell: true })
    appCreator.stderr.on('data', function (err) {
      console.error('STDERR:', err.toString())
      socket.emit('SOCKET_EMIT_EXAMPLE_ERROR', err.toString())
    })
    appCreator.stdout.on('data', function (data) {
      console.log('STDOUT:', data.toString())
      socket.emit('SOCKET_EMIT_EXAMPLE_STDOUT', data.toString())
    })
    appCreator.on('exit', function (exitCode) {
      console.log('Child exited with code: ' + exitCode)
      socket.emit('SOCKET_EMIT_EXAMPLE_EXIT', exitCode)
    })
  })
})
io.on('error', () => {
  console.log('Error')
})

server.listen(SERVER_PORT, () => {
  console.log(`Listening on port:${SERVER_PORT}`)
})
