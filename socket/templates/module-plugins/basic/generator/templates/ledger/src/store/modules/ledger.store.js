import Vue from 'vue'
import Vuex from 'vuex'
import * as base64 from 'byte-base64'
import Dexie from 'dexie'
import { AppWebsocket } from '@holochain/conductor-api'
import { v4 as uuidv4 } from 'uuid'

Vue.use(Vuex)

export default {
  namespaced: true,
  state: {
    agentPubKey: '',
    base64AgentPubKey: '',
    ledgerCellId: '',
    hcClient: {},
    consultantProfile: {
      uuid: uuidv4(),
      path: 'Consultants',
      name: '',
      email: '',
      agentPubKey: '',
      billingContact: '',
      billingAddress: '',
      financialInstitution: '',
      bsb: '',
      account: ''
    },
    clients: [],
    invoices: []
  },
  actions: {
    initialise ({ state, commit, dispatch }) {
      commit('base64AgentPubKey', localStorage.getItem('agentPubKey'))
      commit('agentPubKey', base64.base64ToBytes(localStorage.getItem('agentPubKey')))
      commit('ledgerCellId', [base64.base64ToBytes(localStorage.getItem('ledgerCellId')), base64.base64ToBytes(localStorage.getItem('agentPubKey'))])
      state.db = new Dexie('ledger')
      state.db.version(1).stores({
        consultants: 'uuid,base64AgentPubKey',
        clients: 'uuid',
        invoices: 'uuid'
      })
      state.db.open().catch(function (e) {
        console.error('Open failed: ' + e)
      })
      AppWebsocket.connect(`ws://localhost:${localStorage.getItem('port')}`)
        .then(socket => {
          commit('hcClient', socket)
          dispatch('fetchConsultantProfile')
          dispatch('fetchClients')
          dispatch('fetchInvoices')
        })
      state.db.consultants
        .where('base64AgentPubKey')
        .equals(state.base64AgentPubKey)
        .first()
        .then(consultantProfile => {
          if (consultantProfile !== undefined) commit('setConsultantProfile', consultantProfile)
        })
    },
    saveConsultantProfile ({ state, commit }, payload) {
      const consultantProfile = payload
      consultantProfile.base64AgentPubKey = state.base64AgentPubKey
      commit('setConsultantProfile', consultantProfile)
      state.db.consultants.put(consultantProfile)
      if (consultantProfile.entryHash) {
        consultantProfile.entryHash = base64.base64ToBytes(consultantProfile.entryHash)
        state.hcClient
          .callZome({
            cap: null,
            cell_id: state.ledgerCellId,
            zome_name: 'ledger',
            fn_name: 'delete_consultant',
            provenance: state.agentPubKey,
            payload: consultantProfile
          })
      }
      state.hcClient
        .callZome({
          cap: null,
          cell_id: state.ledgerCellId,
          zome_name: 'ledger',
          fn_name: 'create_consultant',
          provenance: state.agentPubKey,
          payload: consultantProfile
        })
        .then(committedConsultant => {
          committedConsultant.entryHash = base64.bytesToBase64(committedConsultant.entryHash)
          state.db.consultants.put(committedConsultant)
          commit('setConsultantProfile', committedConsultant)
        })
    },
    fetchClients ({ state, commit }) {
      state.db.clients.toArray(clients => {
        commit('setClients', clients)
        state.hcClient
          .callZome({
            cap: null,
            cell_id: state.ledgerCellId,
            zome_name: 'ledger',
            fn_name: 'list_clients',
            provenance: state.agentPubKey,
            payload: { path: 'Clients' }
          })
          .then(result => {
            state.db.clients.clear().then(() => {
              result.clients.forEach(client => {
                client.entryHash = base64.bytesToBase64(client.entryHash)
                state.db.clients.put(client)
              })
            })
            commit('setClients', result.clients)
          })
      })
    },
    saveClient ({ state, commit, dispatch }, payload) {
      const client = { ...payload.client, path: 'Clients' }
      state.db.clients.put(client)
      if (payload.action === 'create') {
        commit('createClient', client)
      } else {
        commit('updateClient', client)
      }
      if (client.entryHash) {
        client.entryHash = base64.base64ToBytes(client.entryHash)
        state.hcClient
          .callZome({
            cap: null,
            cell_id: state.ledgerCellId,
            zome_name: 'ledger',
            fn_name: 'delete_client',
            provenance: state.agentPubKey,
            payload: client
          })
      }
      state.hcClient
        .callZome({
          cap: null,
          cell_id: state.ledgerCellId,
          zome_name: 'ledger',
          fn_name: 'create_client',
          provenance: state.agentPubKey,
          payload: client
        })
        .then(committedClient => {
          committedClient.entryHash = base64.bytesToBase64(committedClient.entryHash)
          state.db.clients.put(committedClient)
          commit('updateClient', committedClient)
        })
    },
    deleteClient ({ state, commit }, payload) {
      const client = payload.client
      state.db.clients.delete(client.uuid)
      commit('deleteClient', client)
      client.entryHash = base64.base64ToBytes(client.entryHash)
      state.hcClient
        .callZome({
          cap: null,
          cell_id: state.ledgerCellId,
          zome_name: 'ledger',
          fn_name: 'delete_client',
          provenance: state.agentPubKey,
          payload: client
        })
    },
    fetchConsultantProfile ({ state, commit }) {
      state.db.consultants.where('base64AgentPubKey').equals(state.base64AgentPubKey).first()
        .then(consultantProfile => { commit('setConsultantProfile', consultantProfile) })
      state.hcClient
        .callZome({
          cap: null,
          cell_id: state.ledgerCellId,
          zome_name: 'ledger',
          fn_name: 'list_consultants',
          provenance: state.agentPubKey,
          payload: { path: 'Consultants' }
        })
        .then(result => {
          const consultant = result.consultants.find(c => c.base64AgentPubKey === state.base64AgentPubKey)
          if (consultant !== undefined) {
            consultant.entryHash = base64.bytesToBase64(consultant.entryHash)
            commit('setConsultantProfile', consultant)
          }
        })
    },
    fetchInvoices ({ state, commit }) {
      state.db.invoices.toArray(invoices => {
        commit('setInvoices', invoices)
        state.hcClient
          .callZome({
            cap: null,
            cell_id: state.ledgerCellId,
            zome_name: 'ledger',
            fn_name: 'list_invoices',
            provenance: state.agentPubKey,
            payload: { path: 'Invoices' }
          })
          .then(result => {
            state.db.invoices.clear().then(() => {
              result.invoices.forEach(invoice => {
                invoice.entryHash = base64.bytesToBase64(invoice.entryHash)
                state.db.invoices.put(invoice)
              })
            })
            commit('setInvoices', result.invoices)
          })
      })
    },
    saveInvoice ({ state, commit, dispatch }, payload) {
      const invoice = { ...payload.invoice, path: 'Invoices' }
      state.db.invoices.put(invoice)
      if (payload.action === 'create') {
        commit('createInvoice', invoice)
      } else {
        commit('updateInvoice', invoice)
      }
      if (invoice.entryHash) {
        invoice.entryHash = base64.bytesToBase64(invoice.entryHash)
        state.hcClient
          .callZome({
            cap: null,
            cell_id: state.ledgerCellId,
            zome_name: 'ledger',
            fn_name: 'delete_invoice',
            provenance: state.agentPubKey,
            payload: invoice
          })
      }
      state.hcClient
        .callZome({
          cap: null,
          cell_id: state.ledgerCellId,
          zome_name: 'ledger',
          fn_name: 'create_invoice',
          provenance: state.agentPubKey,
          payload: invoice
        })
        .then(committedInvoice => {
          committedInvoice.entryHash = base64.bytesToBase64(committedInvoice.entryHash)
          state.db.invoices.put(committedInvoice)
          commit('updateInvoice', committedInvoice)
        })
    },
    deleteInvoice ({ state, commit }, payload) {
      const invoice = payload.invoice
      state.db.invoices.delete(invoice.uuid)
      commit('deleteInvoice', invoice)
      invoice.entryHash = base64.base64ToBytes(invoice.entryHash)
      state.hcClient
        .callZome({
          cap: null,
          cell_id: state.ledgerCellId,
          zome_name: 'ledger',
          fn_name: 'delete_invoice',
          provenance: state.agentPubKey,
          payload: invoice
        })
    }
  },
  mutations: {
    base64AgentPubKey (state, payload) {
      if (payload !== undefined) state.base64AgentPubKey = payload
    },
    agentPubKey (state, payload) {
      state.agentPubKey = payload
    },
    ledgerCellId (state, payload) {
      state.ledgerCellId = payload
    },
    hcClient (state, payload) {
      state.hcClient = payload
    },
    setConsultantProfile (state, payload) {
      const consultantProfile = payload
      if (consultantProfile !== undefined) state.consultantProfile = consultantProfile
    },
    setClients (state, payload) {
      const clients = payload
      state.clients = clients
    },
    createClient (state, payload) {
      state.clients.splice(0, 0, payload)
    },
    updateClient (state, payload) {
      state.clients = state.clients.map(client =>
        client.uuid !== payload.uuid ? client : { ...client, ...payload }
      )
    },
    deleteClient (state, payload) {
      state.clients = state.clients.filter(c => c.uuid !== payload.uuid)
    },
    setInvoices (state, payload) {
      const invoices = payload
      state.invoices = invoices.sort((a, b) => a.timestamp < b.timestamp)
    },
    createInvoice (state, payload) {
      state.invoices.push(payload)
    },
    updateInvoice (state, payload) {
      state.invoices = state.invoices.map(invoice =>
        invoice.uuid !== payload.uuid ? invoice : { ...invoice, ...payload }
      )
    },
    deleteInvoice (state, payload) {
      state.invoices = state.invoices.filter(c => c.uuid !== payload.uuid)
    }
  },
  modules: {}
}
