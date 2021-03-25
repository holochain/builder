import Vue from 'vue'
import Vuex from 'vuex'
import { v4 as uuidv4 } from 'uuid'
import io from 'socket.io-client'
import Dexie from 'dexie'
import * as base64 from 'byte-base64'
import { AppWebsocket, AdminWebsocket } from '@holochain/conductor-api'

const PRODUCTION_CONDUCTOR_ADMIN_INTERFACE_DOCKER_PORT = process.env.VUE_APP_PRODUCTION_CONDUCTOR_ADMIN_INTERFACE_DOCKER_PORT
const PRODUCTION_CONDUCTOR_APP_INTERFACE_DOCKER_PORT = process.env.VUE_APP_PRODUCTION_CONDUCTOR_APP_INTERFACE_DOCKER_PORT

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
      AdminWebsocket.connect(`ws://localhost:${PRODUCTION_CONDUCTOR_ADMIN_INTERFACE_DOCKER_PORT}`)
        .then(socket => {
          commit('hcAdmin', socket)
          dispatch('fetchOrganisationMembers')
        })
        .catch(err => console.log('hcAdmin', err))
      AppWebsocket.connect(`ws://localhost:${PRODUCTION_CONDUCTOR_APP_INTERFACE_DOCKER_PORT}`)
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
      state.socket = io(process.env.VUE_APP_SOCKET_URL)
    },
    fetchOrganisationMembers ({ state }) {
      state.hcAdmin.requestAgentInfo({ cell_id: null }).then(agents => {
        console.log(agents)
      })
    },
    saveOrganisation ({ state, commit, dispatch }, payload) {
      const organisation = payload.organisation
      const action = payload.action
      localStorage.setItem('currentOrganisationUuid', organisation.uuid)
      if (action === 'create') {
        commit('addOrganisation', organisation)
        state.socket.emit('CREATE_INVITE_PACKAGE', organisation, (happPath) => {
          console.log(happPath)
          dispatch('installDnas', { organisation, happPath })
        })
      } else {
        commit('updateOrganisation', organisation)
      }
      state.db.organisations.put(organisation)
    },
    changeOrganisation ({ state }, payload) {
      const organisation = payload
      localStorage.setItem('currentOrganisationUuid', organisation.uuid)
      state.socket.emit('SET_ORGANISATION', organisation, (result) => {
        console.log(result)
      })
    },
    fetchOrganisations ({ state, commit, dispatch }) {
      state.db.organisations.toArray(allOrganisations => {
        if (allOrganisations.length === 0) {
          const organisationUuid = uuidv4()
          const organisation = {
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
          allOrganisations = [organisation]
          dispatch('saveOrganisation', { organisation, action: 'create' })
        } else {
          const currentOrgUuid = localStorage.getItem('currentOrganisationUuid')
          if (currentOrgUuid !== undefined) {
            state.db.organisations.get({ uuid: currentOrgUuid }).then(org => {
              if (org !== null) {
                state.socket.emit('SET_ORGANISATION', org, (result) => {
                  console.log(result)
                })
                commit('setOrganisation', org)
              }
            })
          } else {
            const org = allOrganisations[0]
            state.socket.emit('SET_ORGANISATION', org, (result) => {
              console.log(result)
            })
            localStorage.setItem('currentOrganisationUuid', org.uuid)
            commit('setOrganisation', org)
          }
        }
        commit('setOrganisations', allOrganisations)
      })
    },
    joinOrganisation ({ state, commit, dispatch }, payload) {
      const invite = payload
      var reader = new FileReader()
      var rawData = new ArrayBuffer()
      reader.onload = function (e) {
        rawData = e.target.result
        state.socket.emit('JOIN_ORGANISATION', { data: rawData }, (result) => {
          const organisation = result.organisation
          const happPath = result.happPath
          console.log(result)
          commit('addOrganisation', organisation)
          state.db.organisations.put(organisation)
          localStorage.setItem('currentOrganisationUuid', organisation.uuid)
          dispatch('installDnas', { organisation, happPath })
        })
        console.log('Invite package read')
      }
      reader.readAsArrayBuffer(invite)
    },
    installDnas ({ state, commit, dispatch }, payload) {
      const organisation = payload.organisation
      localStorage.setItem('currentOrganisationUuid', organisation.uuid)
      let happPath = '/Users/philipbeadle/holochain/builder/dna/builder.happ'
      if (payload.happPath !== undefined) {
        happPath = payload.happPath
      }
      console.log(happPath)
      state.hcAdmin.generateAgentPubKey().then(agentPubKey => {
        localStorage.setItem(`${organisation.uuid}-agentPubKey`, `${encodeURIComponent(base64.bytesToBase64(agentPubKey))}`)
        const appId = organisation.uuid
        state.hcAdmin.installAppBundle({
          installed_app_id: appId,
          agent_key: agentPubKey,
          path: happPath,
          membrane_proofs: {}
        }).then(app => {
          console.log(app)
          Object.keys(app.slots).forEach(key => {
            console.log(`${key}CellId`, encodeURIComponent(base64.bytesToBase64(app.slots[key].base_cell_id[0])))
            localStorage.setItem(`${organisation.uuid}-${key}CellId`, encodeURIComponent(base64.bytesToBase64(app.slots[key].base_cell_id[0])))
          })
          state.hcAdmin.activateApp({ installed_app_id: appId })
          const card = {
            uuid: organisation.uuid,
            name: organisation.name,
            parentColumn: 'root',
            cardType: 'column',
            parent: 'Cards',
            order: 0
          }
          dispatch('builderKanban/saveCard', { card, action: 'create' }, { root: true })
        }).catch(err => { console.log(err) })
        // agent.cellData = cellIds
        // commit('updateAgent', agent)
        // state.db.agent.put(agent)
        // dispatch('fetchOrganisationMembers')
      })
    },
    cellMissing () {
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
    updateOrganisation (state, payload) {
      state.organisations = state.organisations.map(org =>
        org.uuid !== payload.uuid ? org : { ...org, ...payload }
      )
      state.organisation = payload
    },
    setPackagePath  (state, payload) {
      state.organisationPackagePath = payload
    }
  },
  modules: {}
}
