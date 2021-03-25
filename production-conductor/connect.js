const adminSocket = require('@holochain/conductor-api').AdminWebsocket

const PRODUCTION_CONDUCTOR_ADMIN_INTERFACE_DOCKER_PORT = 22799
const PRODUCTION_CONDUCTOR_APP_INTERFACE_PORT = 22669

setTimeout(() => {
  adminSocket.connect(`ws://localhost:${PRODUCTION_CONDUCTOR_ADMIN_INTERFACE_DOCKER_PORT}`, 10000)
  .then(admin => {
    console.log(admin)
    admin.attachAppInterface({ port: PRODUCTION_CONDUCTOR_APP_INTERFACE_PORT })
      .then(appinterface => console.log(appinterface))
      .catch(err => console.log('hcClient', err))
  })
  .catch(err => console.log('hcAdmin', err))
}, 2000)
