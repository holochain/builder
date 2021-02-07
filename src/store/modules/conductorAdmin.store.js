import Vue from 'vue'
import Vuex from 'vuex'
import * as base64 from 'byte-base64'
import Dexie from 'dexie'
import { v4 as uuidv4 } from 'uuid'
import { AppWebsocket, AdminWebsocket } from '@holochain/conductor-api'

const HOLOCHAIN_CONDUCTOR_ADMIN_SOCKET_DOCKER_URL = 'ws://localhost:22776'
const HOLOCHAIN_CONDUCTOR_APP_INTERFACE_PORT = 22665
const HOLOCHAIN_CONDUCTOR_APP_INTERFACE_DOCKER_PORT = 22666

Vue.use(Vuex)

export default {
  namespaced: true,
  state: {
    socket: {},
    hcAdmin: {},
    hcClient: {},
    agent: {
      agentPubKey: '',
      handle: 'philip.beadle',
      avatar: '@/assets/images/philip.beadle.png'
    },
    conductorApp: {
      uuid: uuidv4(),
      path: 'ConductorApplications',
      name: '',
      dnaNickName: '',
      dnaFiles: []
    },
    conductorApplications: []
  },
  actions: {
    initialise ({ state, dispatch, commit }) {
      state.db = new Dexie('conductorAdmin')
      state.db.version(1).stores({
        conductorApplications: 'uuid,name'
      })
      AdminWebsocket.connect(HOLOCHAIN_CONDUCTOR_ADMIN_SOCKET_DOCKER_URL, 10000).then(admin => {
        state.hcAdmin = admin
        state.hcAdmin.attachAppInterface({ port: HOLOCHAIN_CONDUCTOR_APP_INTERFACE_PORT }).then(() => {
          state.hcClient.port = HOLOCHAIN_CONDUCTOR_APP_INTERFACE_DOCKER_PORT
          AppWebsocket.connect(`ws://localhost:${HOLOCHAIN_CONDUCTOR_APP_INTERFACE_DOCKER_PORT}`).then(socket => {
            commit('hcClient', socket)
          })
        })
      })
      dispatch('fetchConductorApplications')
    },
    generateAgentKey ({ state, commit }, payload) {
      const agent = payload.agent
      state.hcAdmin.generateAgentPubKey().then(agentPubKey => {
        console.log(agentPubKey)
        agent.agentPubKey = base64.bytesToBase64(agentPubKey)
        commit('updateAgent', agent)
        state.db.agents.put(agent)
      })
    },
    installDna ({ state, rootState, commit }, payload) {
      console.log(payload)
      const dnas = []
      dnas.push({
        path: '../../builder/dna/kanban/kanban.dna.gz',
        nick: 'kanban'
      })
      const agent = payload.agent
      const appId = uuidv4()
      state.hcAdmin.installApp({
        installed_app_id: appId,
        agent_key: base64.base64ToBytes(agent.agentPubKey),
        dnas
      }).then(app => {
        agent.cellData = app.cell_data
        state.hcAdmin.activateApp({ installed_app_id: appId })
        commit('updateAgent', agent)
      })
    },
    saveApplication ({ state, commit }, payload) {
      const conductorApp = payload
      state.db.conductorApplications.put(conductorApp)
      // if (conductorApp.entryHash) {
      //   state.hcClient
      //     .callZome({
      //       cap: null,
      //       cell_id: state.ledgerCellId,
      //       zome_name: 'ledger',
      //       fn_name: 'delete_organisations',
      //       provenance: state.agentPubKey,
      //       payload: conductorApp
      //     })
      // }
      // state.hcClient
      //   .callZome({
      //     cap: null,
      //     cell_id: state.ledgerCellId,
      //     zome_name: 'ledger',
      //     fn_name: 'create_organisations',
      //     provenance: state.agentPubKey,
      //     payload: conductorApp
      //   })
      //   .then(committedConsultant => {
      //     committedConsultant.entryHash = base64.bytesToBase64(committedConsultant.entryHash)
      //     state.db.organisationss.put(committedConsultant)
      //     commit('setConductorApplication', committedConsultant)
      //   })
    },
    fetchConductorApplications ({ state, commit }) {
      state.db.conductorApplications.toArray(all => {
        commit('setConductorApplications', all)
      })
    }
  },
  mutations: {
    setConductorApplication (state, payload) {
      const conductorApp = payload
      if (conductorApp !== undefined) state.conductorApp = conductorApp
    },
    setConductorApplications (state, payload) {
      state.conductorApplications = payload
    },
    updateAgent (state, payload) {
      state.agent = payload
    }
  },
  modules: {}
}
