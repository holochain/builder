import Vue from 'vue'
import Vuex from 'vuex'
import * as base64 from 'byte-base64'
import Dexie from 'dexie'
import { AppWebsocket } from '@holochain/conductor-api'

const HOLOCHAIN_CONDUCTOR_APP_INTERFACE_DOCKER_PORT = process.env.VUE_APP_HOLOCHAIN_CONDUCTOR_APP_INTERFACE_DOCKER_PORT

Vue.use(Vuex)

function getAgentPubKey () {
  const organisationUuid = localStorage.getItem('currentOrganisationUuid')
  const agentPubKey = base64.base64ToBytes(decodeURIComponent(localStorage.getItem(`${organisationUuid}-agentPubKey`)))
  if (agentPubKey) return agentPubKey
  return ''
}
function getCellId () {
  const organisationUuid = localStorage.getItem('currentOrganisationUuid')
  const agentPubKey = base64.base64ToBytes(decodeURIComponent(localStorage.getItem(`${organisationUuid}-agentPubKey`)))
  console.log(`${organisationUuid}-builder_kanbanCellId`)
  console.log(localStorage.getItem(`${organisationUuid}-builder_kanbanCellId`))
  const cellId = base64.base64ToBytes(decodeURIComponent(localStorage.getItem(`${organisationUuid}-builder_kanbanCellId`)))
  console.log([cellId, agentPubKey])
  if (cellId) return [cellId, agentPubKey]
  return ''
}
function batchSaveCards (hcClient, builderKanbanCellId, agentPubKey, cards, cardIndex) {
  const cardToMigrate = { ...cards[cardIndex] }
  if (cardToMigrate.cardType === 'column') {
    cardToMigrate.cardData = ''
  } else {
    if (cardToMigrate.description === undefined) cardToMigrate.description = ''
    if (cardToMigrate.tags === undefined) cardToMigrate.tags = []
    if (cardToMigrate.reactions === undefined) cardToMigrate.reaction = []
    if (cardToMigrate.specs === undefined) cardToMigrate.specs = []
    const cardData = {
      description: cardToMigrate.description,
      tags: cardToMigrate.tags,
      reactions: cardToMigrate.reactions,
      specs: cardToMigrate.specs
    }
    cardToMigrate.cardData = JSON.stringify(cardData)
  }
  hcClient.callZome({
    cap: null,
    cell_id: builderKanbanCellId,
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
    initialise ({ state, commit }) {
      state.db = new Dexie('builderKanban')
      state.db.version(1).stores({
        cards: 'uuid,[parentColumn+name],parentColumn'
      })
      AppWebsocket.connect(`ws://localhost:${HOLOCHAIN_CONDUCTOR_APP_INTERFACE_DOCKER_PORT}`)
        .then(socket => {
          commit('hcClient', socket)
        })
        .catch(err => console.log('hcClient', err))
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
    fetchCards ({ state, commit, dispatch }) {
      state.db.cards.toArray(cards => {
        commit('setCards', cards)
        if (getCellId() !== '') {
          state.hcClient
            .callZome({
              cap: null,
              cell_id: getCellId(),
              zome_name: 'builder_kanban',
              fn_name: 'list_cards',
              provenance: getAgentPubKey(),
              payload: { parent: 'Cards' }
            })
            .then(result => {
              console.log('🚀 result', result)
              state.db.cards.where('parentColumn').equals(localStorage.getItem('currentOrganisationUuid')).toArray(migrateCards => {
                console.log(migrateCards)
                if (result.cards.length === 1 && migrateCards.length > 0) {
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
            })
            .catch(err => {
              console.log(err.data)
              if (err.data.data.includes('CellMissing')) dispatch('builderOrganisations/cellMissing', null, { root: true })
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
    holochainSaveCard ({ state, commit }, payload) {
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
        state.hcClient
          .callZome({
            cap: null,
            cell_id: getCellId(),
            zome_name: 'builder_kanban',
            fn_name: 'delete_card',
            provenance: getAgentPubKey(),
            payload: card
          })
      }
      state.hcClient
        .callZome({
          cap: null,
          cell_id: getCellId(),
          zome_name: 'builder_kanban',
          fn_name: 'create_card',
          provenance: getAgentPubKey(),
          payload: card
        })
        .then(committedEntry => {
          console.log(committedEntry)
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
    deleteCard ({ state, commit }, payload) {
      const card = payload.card
      card.tags = JSON.stringify(card.tags)
      card.reactions = JSON.stringify(card.reactions)
      state.db.cards.delete(card.uuid)
      card.entryHash = base64.base64ToBytes(card.entryHash)
      commit('deleteCard', card)
      state.hcClient
        .callZome({
          cap: null,
          cell_id: getCellId(),
          zome_name: 'builder_kanban',
          fn_name: 'delete_card',
          provenance: getAgentPubKey(),
          payload: card
        })
        .then(result => console.log(result))
    },
    migrateIndexDbToHolochain ({ state }) {
      batchSaveCards(state.hcClient, getCellId(), getAgentPubKey(), state.cards, 0)
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
