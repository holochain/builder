import Vue from 'vue'
import Vuex from 'vuex'
import Dexie from 'dexie'
import * as base64 from 'byte-base64'

Vue.use(Vuex)

function batchSaveTags (hcClient, taggerCellId, agentPubKey, tags, tagIndex) {
  const tagToMigrate = { ...tags[tagIndex] }
  tagToMigrate.parent = 'Tags'
  hcClient.callZome({
    cap: null,
    cell_id: [taggerCellId, agentPubKey],
    zome_name: 'tagger',
    fn_name: 'create_tag',
    provenance: agentPubKey,
    payload: tagToMigrate
  })
    .then(result => {
      console.log(result)
      tagIndex++
      if (tagIndex < tags.length) batchSaveTags(hcClient, taggerCellId, agentPubKey, tags, tagIndex)
    })
    .catch(err => {
      console.log(err)
      tagIndex++
      if (tagIndex < tags.length) batchSaveTags(hcClient, taggerCellId, agentPubKey, tags, tagIndex)
    })
}

export default {
  namespaced: true,
  state: {
    agentPubKey: '',
    taggerCellId: '',
    tags: [],
    migrate: false
  },
  actions: {
    initialise ({ state, commit, dispatch }) {
      state.db = new Dexie('tagger')
      state.db.version(1).stores({
        tags: 'uuid,tagText'
      })
      if (localStorage.getItem('agentPubKey')) commit('agentPubKey', base64.base64ToBytes(decodeURIComponent(localStorage.getItem('agentPubKey'))))
      if (localStorage.getItem('taggerCellId')) {
        const taggerCellId = localStorage.getItem('taggerCellId')
        if (taggerCellId) {
          commit('taggerCellId', base64.base64ToBytes(decodeURIComponent(taggerCellId)))
        }
      }
      dispatch('fetchTags')
    },
    fetchTags ({ rootState, state, commit }) {
      state.db.tags.toArray(tags => {
        if (tags !== undefined && tags !== null) commit('setTags', tags)
        if (state.taggerCellId !== '') {
          rootState.builderConductorAdmin.hcClient
            .callZome({
              cap: null,
              cell_id: [state.taggerCellId, state.agentPubKey],
              zome_name: 'tagger',
              fn_name: 'list_tags',
              provenance: state.agentPubKey,
              payload: { parent: 'Tags' }
            })
            .then(result => {
              if (result.tags.length === 0 && tags.length > 0) {
                commit('setMigrate', true)
              } else {
                result.tags.forEach(tag => {
                  tag.entryHash = base64.bytesToBase64(tag.entryHash)
                  state.db.tags.put(tag)
                })
                commit('setTags', result.tags)
              }
            })
        }
      })
    },
    createTag ({ state, commit, dispatch }, payload) {
      const tag = payload.tag
      tag.parent = 'Tags'
      state.db.tags.put(tag)
      commit('createTag', tag)
      dispatch('holochainSaveTag', { tag })
    },
    updateTag ({ state, commit, dispatch }, payload) {
      const tag = payload.tag
      state.db.tags.put(tag)
      commit('updateTag', tag)
      dispatch('holochainSaveTag', { tag })
    },
    holochainSaveTag ({ rootState, state, commit }, payload) {
      const tag = payload.tag
      if (tag.entryHash) {
        tag.entryHash = base64.base64ToBytes(tag.entryHash)
        rootState.builderConductorAdmin.hcClient
          .callZome({
            cap: null,
            cell_id: [state.taggerCellId, state.agentPubKey],
            zome_name: 'tagger',
            fn_name: 'delete_tag',
            provenance: state.agentPubKey,
            payload: tag
          })
      }
      rootState.builderConductorAdmin.hcClient
        .callZome({
          cap: null,
          cell_id: [state.taggerCellId, state.agentPubKey],
          zome_name: 'tagger',
          fn_name: 'create_tag',
          provenance: state.agentPubKey,
          payload: tag
        })
        .then(committedEntry => {
          committedEntry.entryHash = base64.bytesToBase64(committedEntry.entryHash)
          state.db.tags.put(committedEntry)
          commit('updateTag', committedEntry)
        })
    },
    migrateIndexDbToHolochain ({ rootState, state }) {
      batchSaveTags(rootState.builderConductorAdmin.hcClient, state.taggerCellId, state.agentPubKey, state.tags, 0)
    }
  },
  mutations: {
    agentPubKey (state, payload) {
      state.agentPubKey = payload
    },
    taggerCellId (state, payload) {
      state.taggerCellId = payload
    },
    setMigrate (state, payload) {
      state.migrate = payload
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