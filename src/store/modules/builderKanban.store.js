import Vue from 'vue'
import Vuex from 'vuex'
import * as base64 from 'byte-base64'
import Dexie from 'dexie'

Vue.use(Vuex)

function batchSaveCards (hcClient, builderKanbanCellId, agentPubKey, cards, cardIndex) {
  const cardToMigrate = { ...cards[cardIndex] }
  if (cardToMigrate.cardType === 'column') {
    cardToMigrate.cardData = ''
  } else {
    if (cardToMigrate.description === undefined) cardToMigrate.description = ''
    if (cardToMigrate.tags === undefined) cardToMigrate.tags = []
    if (cardToMigrate.reactions === undefined) cardToMigrate.reaction = []
    const cardData = {
      description: cardToMigrate.description,
      tags: cardToMigrate.tags,
      reactions: cardToMigrate.reactions
    }
    cardToMigrate.cardData = JSON.stringify(cardData)
  }
  hcClient.callZome({
    cap: null,
    cell_id: [builderKanbanCellId, agentPubKey],
    zome_name: 'builder_kanban',
    fn_name: 'create_card',
    provenance: agentPubKey,
    payload: cardToMigrate
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
    fetchCards ({ rootState, state, commit, dispatch }) {
      state.db.cards.toArray(cards => {
        commit('setCards', cards)
        if (state.builderKanbanCellId !== '') {
          rootState.builderConductorAdmin.hcClient
            .callZome({
              cap: null,
              cell_id: [state.builderKanbanCellId, state.agentPubKey],
              zome_name: 'builder_kanban',
              fn_name: 'list_cards',
              provenance: state.agentPubKey,
              payload: { parent: 'Cards' }
            })
            .then(result => {
              console.log(result)
              if (result.cards.length === 0 && cards.length > 0) {
                commit('setMigrate', true)
              } else {
                result.cards.forEach(committedEntry => {
                  committedEntry.entryHash = base64.bytesToBase64(committedEntry.entryHash)
                  if (committedEntry.cardType === 'card') {
                    const cardData = JSON.parse(committedEntry.cardData)
                    committedEntry.description = cardData.description
                    committedEntry.tags = cardData.tags
                    committedEntry.reactions = cardData.reactions
                    if (cardData.specs === undefined) cardData.specs = []
                    committedEntry.specs = cardData.specs
                  }
                  state.db.cards.put(committedEntry)
                })
                commit('setCards', result.cards)
              }
            })
            .catch(err => {
              console.log(err.data)
              if (err.data.data.includes('CellMissing')) dispatch('builderConductorAdmin/cellMissing', null, { root: true })
            })
        }
      })
    },
    saveCard ({ state, commit, dispatch }, payload) {
      const card = payload.card
      state.db.cards.put(card).catch(err => console.log(err))
      if (payload.action === 'create') {
        commit('createCard', card)
      } else {
        commit('updateCard', card)
      }
      dispatch('holochainSaveCard', { card })
    },
    holochainSaveCard ({ rootState, state, commit }, payload) {
      const card = payload.card
      if (card.cardType === 'column') {
        card.cardData = ''
      } else {
        const cardData = {
          description: card.description,
          tags: card.tags,
          reactions: card.reactions,
          specs: card.specs
        }
        card.cardData = JSON.stringify(cardData)
      }
      if (card.entryHash) {
        card.entryHash = base64.base64ToBytes(card.entryHash)
        rootState.builderConductorAdmin.hcClient
          .callZome({
            cap: null,
            cell_id: [state.builderKanbanCellId, state.agentPubKey],
            zome_name: 'builder_kanban',
            fn_name: 'delete_card',
            provenance: state.agentPubKey,
            payload: card
          })
      }
      rootState.builderConductorAdmin.hcClient
        .callZome({
          cap: null,
          cell_id: [state.builderKanbanCellId, state.agentPubKey],
          zome_name: 'builder_kanban',
          fn_name: 'create_card',
          provenance: state.agentPubKey,
          payload: card
        })
        .then(committedEntry => {
          committedEntry.entryHash = base64.bytesToBase64(committedEntry.entryHash)
          if (committedEntry.cardType === 'card') {
            const cardData = JSON.parse(committedEntry.cardData)
            committedEntry.description = cardData.description
            committedEntry.tags = cardData.tags
            committedEntry.reactions = cardData.reactions
            committedEntry.specs = cardData.specs
          }
          state.db.cards.put(committedEntry)
          commit('updateCard', committedEntry)
        })
    },
    deleteCard ({ rootState, state, commit }, payload) {
      const card = payload.card
      card.tags = JSON.stringify(card.tags)
      card.reactions = JSON.stringify(card.reactions)
      state.db.cards.delete(card.uuid)
      card.entryHash = base64.base64ToBytes(card.entryHash)
      commit('deleteCard', card)
      rootState.builderConductorAdmin.hcClient
        .callZome({
          cap: null,
          cell_id: [state.builderKanbanCellId, state.agentPubKey],
          zome_name: 'builder_kanban',
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
