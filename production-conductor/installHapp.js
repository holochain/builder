const adminSocket = require('@holochain/conductor-api').AdminWebsocket
const HOLOCHAIN_CONDUCTOR_ADMIN_INTERFACE_DOCKER_PORT = 22799
const base64 = require('byte-base64')

setTimeout(() => {
  adminSocket.connect(`ws://localhost:${HOLOCHAIN_CONDUCTOR_ADMIN_INTERFACE_DOCKER_PORT}`, 10000)
  .then(admin => {
    admin.generateAgentPubKey().then(agentPubKey => {
        const appId = 'organisation3'
        admin.installAppBundle({
          installed_app_id: appId,
          agent_key: agentPubKey,
          path: '/Users/philipbeadle/holochain/builder/dna.happ',
          membrane_proofs: {}
        }).then(app => {
          console.log(app)
          Object.keys(app.slots).forEach(key => {
            console.log(app.slots[key].base_cell_id)
            const cellId = encodeURIComponent(base64.bytesToBase64(app.slots[key].base_cell_id[0]))
            console.log(`${key}CellId`, cellId)
            console.log(base64.base64ToBytes(decodeURIComponent(cellId)))
          })
          admin.activateApp({ installed_app_id: appId })
        }).catch(err => {console.log(err)})
      })
      .catch(err => {console.log(err)})
  })
  .catch(err => console.log('hcAdmin', err))
}, 2000)


