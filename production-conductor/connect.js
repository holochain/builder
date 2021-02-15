const adminSocket = require('@holochain/conductor-api').AdminWebsocket

const HOLOCHAIN_CONDUCTOR_ADMIN_INTERFACE_DOCKER_PORT = 22799
const HOLOCHAIN_CONDUCTOR_APP_INTERFACE_PORT = 22669

setTimeout(() => {
  adminSocket.connect(`ws://localhost:${HOLOCHAIN_CONDUCTOR_ADMIN_INTERFACE_DOCKER_PORT}`, 10000)
  .then(admin => {
    admin.attachAppInterface({ port: HOLOCHAIN_CONDUCTOR_APP_INTERFACE_PORT })
      .then(appinterface => console.log(appinterface))
      .catch(err => console.log('hcClient', err))
  })
  .catch(err => console.log('hcAdmin', err))
}, 2000)
