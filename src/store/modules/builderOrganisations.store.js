import Vue from 'vue'
import Vuex from 'vuex'
import { v4 as uuidv4 } from 'uuid'
import io from 'socket.io-client'
import Dexie from 'dexie'
import * as base64 from 'byte-base64'
import { AppWebsocket, AdminWebsocket } from '@holochain/conductor-api'

const HOLOCHAIN_CONDUCTOR_ADMIN_INTERFACE_DOCKER_PORT = process.env.VUE_APP_HOLOCHAIN_CONDUCTOR_ADMIN_INTERFACE_DOCKER_PORT
const HOLOCHAIN_CONDUCTOR_APP_INTERFACE_DOCKER_PORT = process.env.VUE_APP_HOLOCHAIN_CONDUCTOR_APP_INTERFACE_DOCKER_PORT

Vue.use(Vuex)

export default {
  namespaced: true,
  state: {
    socket: {},
    hcAdmin: {},
    hcClient: {},
    agent: {
      handle: 'Your Handle',
      avatar: '',
      cells: []
    },
    organisation: {
      uuid: uuidv4(),
      path: 'Organisations',
      name: '',
      email: '',
      billingContact: '',
      billingAddress: '',
      financialInstitution: '',
      bsb: '',
      account: ''
    },
    organisations: []
  },
  actions: {
    initialise ({ state, commit, dispatch }) {
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
      state.db = new Dexie('builderOrganisations')
      state.db.version(1).stores({
        organisations: 'uuid,name',
        agent: 'handle'
      })
      dispatch('fetchOrganisations')
      dispatch('fetchOrganisationMembers')
      state.socket = io(process.env.VUE_APP_SOCKET_URL)
      state.socket.on('CREATE_INVITE_PACKAGE_EXIT', data => {
        commit('setPackagePath', data)
      })
    },
    fetchOrganisationMembers ({ state }) {
      state.hcAdmin.requestAgentInfo({
        cell_id: null
      }).then(agents => {
        console.log(agents)
      })
    },
    saveOrganisation ({ state, commit }, payload) {
      const organisation = payload
      commit('addOrganisation', organisation)
      state.db.organisations.put(organisation)
    },
    fetchOrganisations ({ state, commit, dispatch }) {
      state.db.organisations.toArray(all => {
        console.log(all)
        if (all === undefined) {
          const organisationUuid = uuidv4()
          const newOrg = {
            uuid: organisationUuid,
            path: 'Organisations',
            name: 'personal',
            email: '',
            billingContact: '',
            billingAddress: '',
            financialInstitution: '',
            bsb: '',
            account: ''
          }
          all = [newOrg]
          dispatch('saveOrganisation', newOrg)
          commit('setOrganisation', newOrg)
          localStorage.setItem('currentOrganisationUuid', newOrg.uuid)
          dispatch('installDnas', { newOrg })
        }
        commit('setOrganisations', all)
      })
      const currentOrgUuid = localStorage.getItem('currentOrganisationUuid')
      if (currentOrgUuid !== undefined) {
        state.db.organisations.get({ uuid: currentOrgUuid }).then(org => {
          state.socket.emit('SET_ORGANISATION', organisation, (result) => {
            console.log(result)
          })
          commit('setOrganisation', org)
        })
      }
    },
    createInvitePackage ({ state }, payload) {
      const organisation = payload.organisation
      state.socket.emit('CREATE_INVITE_PACKAGE', organisation)
    },
    joinOrganisation ({ state, commit, dispatch }, payload) {
      const invite = payload
      var reader = new FileReader()
      var rawData = new ArrayBuffer()
      reader.onload = function (e) {
        rawData = e.target.result
        state.socket.emit('JOIN_ORGANISATION', { data: rawData }, (result) => {
          const organisation = result
          console.log(organisation)
          commit('addOrganisation', organisation)
          state.db.organisations.put(organisation)
          const dnas = []
          dnas.push({
            path: '../../builder-organisations/builder_kanban.dna.gz',
            nick: 'builderKanban'
          })
          dnas.push({
            path: '../../builder-organisations/tagger.dna.gz',
            nick: 'tagger'
          })
          dispatch('installDnas', { organisation, dnas })
        })
        console.log('Invite package read')
      }
      reader.readAsArrayBuffer(invite)
    },
    installDnas ({ state, commit }, payload) {
      const organisation = payload.organisation
      localStorage.setItem('currentOrganisationUuid', organisation.uuid)
      let dnas = []
      if (payload.dnas === undefined) {
        dnas.push({
          path: '../../builder/dna/builder_kanban/builder_kanban.dna.gz',
          nick: 'builderKanban'
        })
        dnas.push({
          path: '../../builder/dna/tagger/tagger.dna.gz',
          nick: 'tagger'
        })
      } else {
        dnas = payload.dnas
      }
      console.log(dnas)
      state.hcAdmin.generateAgentPubKey().then(agentPubKey => {
        localStorage.setItem(`${organisation.uuid}-agentPubKey`, `${encodeURIComponent(base64.bytesToBase64(agentPubKey))}`)
        const appId = organisation.uuid
        state.hcAdmin.installApp({
          installed_app_id: appId,
          agent_key: agentPubKey,
          dnas
        }).then(app => {
          console.log(app.cell_data)
          state.hcAdmin.activateApp({ installed_app_id: appId })
          const cellIds = []
          app.cell_data.forEach(cell => {
            cellIds[cell[1]] = `${encodeURIComponent(base64.bytesToBase64(cell[0][0]))}`
            localStorage.setItem(`${organisation.uuid}-${cell[1]}CellId`, `${encodeURIComponent(base64.bytesToBase64(cell[0][0]))}`)
          })
          agent.cellData = cellIds
          commit('updateAgent', agent)
          state.db.agent.put(agent)
          dispatch('fetchOrganisationMembers')
        })
      })
      const agent = state.agent
    },
    cellMissing ({ state, commit }) {
      const agent = state.agent
      localStorage.removeItem('agentPubKey')
      agent.cellData.forEach(cell => {
        localStorage.removeItem(`${cell[1]}CellId`)
      })
      delete agent.agentPubKey
      delete agent.cellData
      commit('updateAgent', agent)
      state.db.agent.put(agent)
    },
    saveAgent ({ state, commit }, payload) {
      const agent = payload.agent
      state.db.agent.put(agent).then(() => {
        commit('updateAgent', agent)
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
    },
    addOrganisation (state, payload) {
      const organisation = payload
      if (organisation !== undefined) state.organisation = organisation
      state.organisations.push(organisation)
    },
    setOrganisation (state, payload) {
      const organisation = payload
      if (organisation !== undefined) state.organisation = organisation
    },
    setOrganisations (state, payload) {
      state.organisations = payload
    },
    setPackagePath  (state, payload) {
      state.organisationPackagePath = payload
    }
  },
  modules: {}
}
