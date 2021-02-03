import Vue from 'vue'
import Vuex from 'vuex'
import { v4 as uuidv4 } from 'uuid'
// import * as base64 from 'byte-base64'
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
    initialise ({ state, dispatch }) {
      state.db = new Dexie('builderOrganisations')
      state.db.version(1).stores({
        organisations: 'uuid,name',
        currentOrganisation: 'uuid,name'
      })
      dispatch('fetchOrganisations')
      state.db.currentOrganisation.toArray(org => {
        state.organisation = org[0]
      })
    },
    saveOrganisation ({ state, commit }, payload) {
      const organisation = payload
      console.log('🚀 ~ file: builderOrganisations.store.js ~ line 35 ~ saveOrganisation ~ organisation', organisation)
      commit('setOrganisation', organisation)
      state.db.organisations.put(organisation)
      state.db.currentOrganisation.clear()
        .then(() => state.db.currentOrganisation.put(organisation))
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
    }
  },
  mutations: {
    setOrganisation (state, payload) {
      const organisation = payload
      if (organisation !== undefined) state.organisation = organisation
    },
    setOrganisations (state, payload) {
      state.organisations = payload
    }
  },
  modules: {}
}
