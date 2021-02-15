import Vue from 'vue'
import Vuex from 'vuex'
import * as base64 from 'byte-base64'
import Dexie from 'dexie'

Vue.use(Vuex)

function batchSaveCards (hcClient, builderKanbanCellId, agentPubKey, cards, cardIndex) {
  hcClient.callZome({
    cap: null,
    cell_id: [builderKanbanCellId, agentPubKey],
    zome_name: 'kanban',
    fn_name: 'create_card',
    provenance: agentPubKey,
    payload: cards[cardIndex]
  })
    .then(result => {
      console.log(result)
      cardIndex++
      if (cardIndex < cards.length) batchSaveCards(hcClient, builderKanbanCellId, agentPubKey, cards, cardIndex)
    })
    .catch(err => {
      console.log(err)
      cardIndex++
      if (cardIndex < cards.length) batchSaveCards(hcClient, builderKanbanCellId, agentPubKey, cards, cardIndex)
    })
}
export default {
  namespaced: true,
  state: {
    agentPubKey: '',
    builderKanbanCellId: '',
    db: {},
    hcClient: {},
    cards: [],
    treeItems: [],
    selectedColumn: {},
    migrate: false
  },
  actions: {
    async initialise ({ state, commit, dispatch }) {
      state.db = new Dexie('builderKanban')
      state.db.version(1).stores({
        cards: 'uuid,[parentColumn+name],parentColumn'
      })
      if (localStorage.getItem('agentPubKey')) commit('agentPubKey', base64.base64ToBytes(decodeURIComponent(localStorage.getItem('agentPubKey'))))
      if (localStorage.getItem('builderKanbanCellId')) {
        const builderKanbanCellId = localStorage.getItem('builderKanbanCellId')
        if (builderKanbanCellId) {
          commit('builderKanbanCellId', base64.base64ToBytes(decodeURIComponent(builderKanbanCellId)))
        }
      }
      dispatch('fetchCards')
    },
    async getTreeRootColumns ({ state, commit }, payload) {
      return new Promise(resolve => {
        state.db.cards.where({ parentColumn: payload }).toArray(entries => {
          const treeItems = entries.map(entry => {
            if (entry.cardType === 'column') {
              entry.children = []
            }
            return entry
          })
          commit('treeItems', treeItems)
          state.db.cards.get({ uuid: payload }).then(col => commit('setSelectedColumn', col))
          resolve()
        })
      })
    },
    fetchCards ({ rootState, state, commit }) {
      state.db.cards.toArray(cards => {
        commit('setCards', cards)
        // if (state.builderKanbanCellId !== '') {
        //   rootState.builderConductorAdmin.hcClient
        //     .callZome({
        //       cap: null,
        //       cell_id: [state.builderKanbanCellId, state.agentPubKey],
        //       zome_name: 'kanban',
        //       fn_name: 'list_cards',
        //       provenance: state.agentPubKey,
        //       payload: { parent: 'Cards' }
        //     })
        //     .then(result => {
        //       if (result.cards.length === 0 && cards.length > 0) {
        //         commit('setMigrate', true)
        //       } else {
        //         result.cards.forEach(card => {
        //           card.entryHash = base64.bytesToBase64(card.entryHash)
        //           state.db.cards.put(card)
        //         })
        //         commit('setCards', result.cards)
        //       }
        //     })
        // }
      })
    },
    saveCard ({ state, commit, dispatch }, payload) {
      const card = payload.card
      console.log('🚀 ~ file: builderKanban.store.js ~ line 99 ~ saveCard ~ card', card)
      state.db.cards.put(card).catch(err => console.log(err))
      if (payload.action === 'create') {
        commit('createCard', card)
      } else {
        commit('updateCard', card)
      }
      // dispatch('holochainSaveCard', { card })
    },
    holochainSaveCard ({ rootState, state, commit }, payload) {
      const card = payload.card
      if (card.entryHash) {
        card.entryHash = base64.base64ToBytes(card.entryHash)
        rootState.builderConductorAdmin.hcClient
          .callZome({
            cap: null,
            cell_id: [state.builderKanbanCellId, state.agentPubKey],
            zome_name: 'kanban',
            fn_name: 'delete_card',
            provenance: state.agentPubKey,
            payload: card
          })
      }
      rootState.builderConductorAdmin.hcClient
        .callZome({
          cap: null,
          cell_id: [state.builderKanbanCellId, state.agentPubKey],
          zome_name: 'kanban',
          fn_name: 'create_card',
          provenance: state.agentPubKey,
          payload: card
        })
        .then(committedEntry => {
          committedEntry.entryHash = base64.bytesToBase64(committedEntry.entryHash)
          state.db.cards.put(committedEntry)
          commit('updateCard', committedEntry)
        })
    },
    deleteCard ({ rootState, state, commit }, payload) {
      const card = payload.card
      state.db.cards.delete(card.uuid)
      card.entryHash = base64.base64ToBytes(card.entryHash)
      commit('deleteCard', card)
      rootState.builderConductorAdmin.hcClient
        .callZome({
          cap: null,
          cell_id: [state.builderKanbanCellId, state.agentPubKey],
          zome_name: 'kanban',
          fn_name: 'delete_card',
          provenance: state.agentPubKey,
          payload: card
        })
        .then(result => console.log(result))
    },
    migrateIndexDbToHolochain ({ rootState, state }) {
      batchSaveCards(rootState.builderConductorAdmin.hcClient, state.builderKanbanCellId, state.agentPubKey, state.cards, 0)
    }
  },
  mutations: {
    agentPubKey (state, payload) {
      state.agentPubKey = payload
    },
    builderKanbanCellId (state, payload) {
      state.builderKanbanCellId = payload
    },
    hcClient (state, payload) {
      state.hcClient = payload
    },
    setMigrate (state, payload) {
      state.migrate = payload
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
