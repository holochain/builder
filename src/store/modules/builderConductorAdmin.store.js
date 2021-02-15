import Vue from 'vue'
import Vuex from 'vuex'
import * as base64 from 'byte-base64'
import Dexie from 'dexie'
import { AppWebsocket, AdminWebsocket } from '@holochain/conductor-api'

const HOLOCHAIN_CONDUCTOR_ADMIN_INTERFACE_DOCKER_PORT = 22799
const HOLOCHAIN_CONDUCTOR_APP_INTERFACE_DOCKER_PORT = 22669

Vue.use(Vuex)

export default {
  namespaced: true,
  state: {
    socket: {},
    hcAdmin: {},
    hcClient: {},
    agent: {
      agentPubKey: '',
      handle: 'Your Handle',
      avatar: ''
    },
    builderKanbanCellId: ''
  },
  actions: {
    initialise ({ state, commit }) {
      state.db = new Dexie('builderAgent')
      state.db.version(1).stores({
        agent: 'handle'
      })
      state.db.agent.toArray().then(agent => {
        if (agent.length !== 0) {
          if (agent[0].agentPubKey) localStorage.setItem('agentPubKey', agent[0].agentPubKey)
          if (agent[0].cellData) localStorage.setItem('builderKanbanCellId', agent[0].cellData.builderKanban)
          commit('updateAgent', agent[0])
        }
      })
      AdminWebsocket.connect(`ws://localhost:${HOLOCHAIN_CONDUCTOR_ADMIN_INTERFACE_DOCKER_PORT}`)
        .then(socket => {
          commit('hcAdmin', socket)
        })
        .catch(err => console.log('hcAdmin', err))
      AppWebsocket.connect(`ws://localhost:${HOLOCHAIN_CONDUCTOR_APP_INTERFACE_DOCKER_PORT}`)
        .then(socket => {
          commit('hcClient', socket)
        })
        .catch(err => console.log('hcClient', err))
    },
    saveAgent ({ state, commit }, payload) {
      const agent = payload.agent
      state.db.agent.put(agent).then(() => {
        commit('updateAgent', agent)
      })
    },
    generateAgentKey ({ state, commit }, payload) {
      const agent = payload.agent
      state.hcAdmin.generateAgentPubKey().then(agentPubKey => {
        console.log(agentPubKey)
        agent.agentPubKey = base64.bytesToBase64(agentPubKey)
        localStorage.setItem('agentPubKey', agent.agentPubKey)
        commit('updateAgent', agent)
        state.db.agent.put(agent)
      })
    },
    installDnas ({ state, commit }) {
      const agent = state.agent
      const dnas = []
      dnas.push({
        path: '../../builder/dna/kanban/kanban.dna.gz',
        nick: 'builderKanban'
      })
      const appId = 'a1a016db-00f1-4ec1-8bef-9970efef94aa'
      state.hcAdmin.installApp({
        installed_app_id: appId,
        agent_key: base64.base64ToBytes(agent.agentPubKey),
        dnas
      }).then(app => {
        state.hcAdmin.activateApp({ installed_app_id: appId })
        const cellIds = []
        app.cell_data.forEach(cell => {
          cellIds[cell[1]] = `${encodeURIComponent(base64.bytesToBase64(cell[0][0]))}`
          localStorage.setItem(`${cell[1]}CellId`, `${encodeURIComponent(base64.bytesToBase64(cell[0][0]))}`)
        })
        agent.cellData = cellIds
        commit('updateAgent', agent)
        state.db.agent.put(agent)
      })
    }
  },
  mutations: {
    updateAgent (state, payload) {
      state.agent = payload
    },
    hcAdmin (state, payload) {
      state.hcAdmin = payload
    },
    hcClient (state, payload) {
      state.hcClient = payload
    }
  },
  modules: {}
}
