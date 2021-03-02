import Vue from 'vue'
import Vuex from 'vuex'
import { v4 as uuidv4 } from 'uuid'
import io from 'socket.io-client'
import Dexie from 'dexie'

Vue.use(Vuex)

export default {
  namespaced: true,
  state: {
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
      state.db = new Dexie('builderOrganisations')
      state.db.version(2).stores({
        organisations: 'uuid,name'
      })
      dispatch('fetchOrganisations')
      state.socket = io(process.env.VUE_APP_SOCKET_URL)
      state.socket.on('CREATE_INVITE_PACKAGE_EXIT', data => {
        commit('setPackagePath', data)
      })
    },
    saveOrganisation ({ state, commit }, payload) {
      const organisation = payload
      commit('addOrganisation', organisation)
      state.db.organisations.put(organisation)
      // if (organisation.entryHash) {
      //   state.hcClient
      //     .callZome({
      //       cap: null,
      //       cell_id: state.ledgerCellId,
      //       zome_name: 'ledger',
      //       fn_name: 'delete_organisations',
      //       provenance: state.agentPubKey,
      //       payload: organisation
      //     })
      // }
      // state.hcClient
      //   .callZome({
      //     cap: null,
      //     cell_id: state.ledgerCellId,
      //     zome_name: 'ledger',
      //     fn_name: 'create_organisations',
      //     provenance: state.agentPubKey,
      //     payload: organisation
      //   })
      //   .then(committedConsultant => {
      //     committedConsultant.entryHash = base64.bytesToBase64(committedConsultant.entryHash)
      //     state.db.organisationss.put(committedConsultant)
      //     commit('setOrganisation', committedConsultant)
      //   })
    },
    fetchOrganisations ({ state, commit }) {
      state.db.organisations.toArray(all => {
        commit('setOrganisations', all)
      })
      const currentOrgUuid = localStorage.getItem('currentOrganisationUuid')
      if (currentOrgUuid !== undefined) {
        state.db.organisations.get({ uuid: currentOrgUuid }).then(org => {
          commit('setOrganisation', org)
        })
      }
    },
    createInvitePackage ({ state }, payload) {
      const organisation = payload.organisation
      state.socket.emit('CREATE_INVITE_PACKAGE', organisation)
    },
    joinOrganisation ({ state, commit }, payload) {
      const invite = payload
      console.log(state)
      var reader = new FileReader()
      var rawData = new ArrayBuffer()
      reader.onload = function (e) {
        rawData = e.target.result
        state.socket.emit('JOIN_ORGANISATION', { data: rawData }, (result) => {
          console.log(result)
          const organisation = result.newOrg
          console.log(organisation)
          commit('addOrganisation', organisation)
          state.db.organisations.put(organisation)
        })
        console.log('Invite package read')
      }
      reader.readAsArrayBuffer(invite)
    }
  },
  mutations: {
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
