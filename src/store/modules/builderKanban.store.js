import Vue from 'vue'
import Vuex from 'vuex'
// import * as base64 from 'byte-base64'
import Dexie from 'dexie'

Vue.use(Vuex)

export default {
  namespaced: true,
  state: {
    agentPubKey: '',
    kanbanCellId: '',
    db: {},
    hcClient: {},
    cards: [],
    treeItems: [],
    selectedColumn: {}
  },
  actions: {
    async initialise ({ rootState, state, commit, dispatch }) {
      state.db = new Dexie('kanban')
      state.db.version(1).stores({
        cards: 'uuid,[parentColumn+name],parentColumn'
      })
      state.db.open().catch(function (e) {
        console.error('Open failed: ' + e)
      })
      // commit('hcClient', rootState.conductorAdmin.hcClient)
      dispatch('fetchCards')
      // commit('agentPubKey', base64.base64ToBytes(decodeURIComponent(localStorage.getItem('agentPubKey'))))
      // commit('kanbanCellId', base64.base64ToBytes(decodeURIComponent(localStorage.getItem('kanbanCellId'))))
    },
    async getTreeRootColumns ({ state, commit }) {
      return new Promise(resolve => {
        state.db.cards.where({ parentColumn: 'root' }).toArray(entries => {
          const treeItems = entries.map(entry => {
            if (entry.cardType === 'column') {
              entry.children = []
            }
            return entry
          })
          commit('treeItems', treeItems)
          resolve()
        })
      })
    },
    fetchCards ({ state, commit }) {
      state.db.cards.toArray(cards => {
        cards = cards.sort((a, b) => a.order < b.order)
        commit('setCards', cards)
        // state.hcClient
        //   .callZome({
        //     cap: null,
        //     cell_id: [state.kanbanCellId, state.agentPubKey],
        //     zome_name: 'kanban',
        //     fn_name: 'list_cards',
        //     provenance: state.agentPubKey,
        //     payload: { parent: 'Cards' }
        //   })
        //   .then(result => {
        //     result.cards.forEach(card => {
        //       state.db.cards.put(card)
        //     })
        //     commit('setCards', result.cards)
        //   })
      })
    },
    saveCard ({ state, commit, dispatch }, payload) {
      const card = payload.card
      console.log('🚀 ~ file: kanban.store.js ~ line 73 ~ saveCard ~ card', card)
      state.db.cards.put(card)
      if (payload.action === 'create') {
        commit('createCard', card)
      } else {
        commit('updateCard', card)
      }
      // dispatch('holochainSaveCard', { card })
    },
    holochainSaveCard ({ state, commit }, payload) {
      const card = payload.card
      if (card.entryHash) {
        state.hcClient
          .callZome({
            cap: null,
            cell_id: [state.kanbanCellId, state.agentPubKey],
            zome_name: 'kanban',
            fn_name: 'delete_card',
            provenance: state.agentPubKey,
            payload: card
          })
      }
      state.hcClient
        .callZome({
          cap: null,
          cell_id: [state.kanbanCellId, state.agentPubKey],
          zome_name: 'kanban',
          fn_name: 'create_card',
          provenance: state.agentPubKey,
          payload: card
        })
        .then(committedEntry => {
          state.db.cards.put(committedEntry)
          commit('updateCard', committedEntry)
        })
    },
    deleteCard ({ state, commit }, payload) {
      const card = payload.card
      state.db.cards.delete(card.uuid)
      commit('deleteCard', card)
      // state.hcClient
      //   .callZome({
      //     cap: null,
      //     cell_id: [state.kanbanCellId, state.agentPubKey],
      //     zome_name: 'kanban',
      //     fn_name: 'delete_card',
      //     provenance: state.agentPubKey,
      //     payload: card
      //   })
      //   .then(result => console.log(result))
    }
  },
  mutations: {
    agentPubKey (state, payload) {
      state.agentPubKey = payload
    },
    kanbanCellId (state, payload) {
      state.kanbanCellId = payload
    },
    hcClient (state, payload) {
      state.hcClient = payload
    },
    treeItems (state, payload) {
      state.treeItems = payload
    },
    setSelectedColumn (state, payload) {
      state.selectedColumn = payload
    },
    setCards (state, payload) {
      state.cards = payload
    },
    createCard (state, payload) {
      state.cards.push(payload)
    },
    updateCard (state, payload) {
      state.cards = state.cards.map(card =>
        card.uuid !== payload.uuid ? card : { ...card, ...payload }
      )
    },
    deleteCard (state, payload) {
      state.cards = state.cards.filter(c => c.uuid !== payload.uuid)
    }
  },
  modules: {}
}
