import Vue from 'vue'
import Vuex from 'vuex'
import Dexie from 'dexie'
import * as base64 from 'byte-base64'

Vue.use(Vuex)

export default {
  namespaced: true,
  state: {
    agentPubKey: '',
    taggerCellId: '',
    tags: []
  },
  actions: {
    initialise ({ state, commit, dispatch }) {
      state.db = new Dexie('tagger')
      state.db.version(1).stores({
        tags: 'uuid,tagText'
      })
      if (localStorage.getItem('agentPubKey')) commit('agentPubKey', base64.base64ToBytes(decodeURIComponent(localStorage.getItem('agentPubKey'))))
      if (localStorage.getItem('tagsCellId')) {
        const taggerCellId = localStorage.getItem('taggerCellId')
        if (taggerCellId) {
          commit('taggerCellId', base64.base64ToBytes(decodeURIComponent(taggerCellId)))
        }
      }
      dispatch('fetchTags')
    },
    fetchTags ({ state, commit }) {
      state.db.tags.toArray(tags => {
        if (tags !== undefined && tags !== null) commit('setTags', tags)
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
    createTag ({ state, commit }, payload) {
      const tag = payload.tag
      state.db.tags.put(tag)
      commit('createTag', tag)
      // dispatch('holochainSaveCard', { tag })
    },
    updateTag ({ state, commit }, payload) {
      const tag = payload.tag
      state.db.tags.put(tag)
      commit('updateTag', tag)
      // dispatch('holochainSaveCard', { tag })
    }
  },
  mutations: {
    agentPubKey (state, payload) {
      state.agentPubKey = payload
    },
    taggerCellId (state, payload) {
      state.taggerCellId = payload
    },
    setTags (state, payload) {
      state.tags = payload
    },
    createTag (state, payload) {
      state.tags.push(payload)
    },
    updateTag (state, payload) {
      state.tags = state.tags.map(t =>
        t.uuid !== payload.uuid ? t : { ...t, ...payload }
      )
    }
  },
  modules: {}
}
