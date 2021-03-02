import Vue from 'vue'
import Vuex from 'vuex'
import Dexie from 'dexie'
import * as base64 from 'byte-base64'
import { AppWebsocket } from '@holochain/conductor-api'

const HOLOCHAIN_CONDUCTOR_APP_INTERFACE_DOCKER_PORT = process.env.VUE_APP_HOLOCHAIN_CONDUCTOR_APP_INTERFACE_DOCKER_PORT

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
    hcClient: {},
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
      AppWebsocket.connect(`ws://localhost:${HOLOCHAIN_CONDUCTOR_APP_INTERFACE_DOCKER_PORT}`)
        .then(socket => {
          commit('hcClient', socket)
          if (localStorage.getItem('currentOrganisationUuid')) {
            const organisationUuid = localStorage.getItem('currentOrganisationUuid')
            if (localStorage.getItem(`${organisationUuid}-agentPubKey`)) commit('agentPubKey', base64.base64ToBytes(decodeURIComponent(localStorage.getItem(`${organisationUuid}-agentPubKey`))))
            if (localStorage.getItem(`${organisationUuid}-taggerCellId`)) {
              const taggerCellId = localStorage.getItem(`${organisationUuid}-taggerCellId`)
              if (taggerCellId) {
                commit('taggerCellId', base64.base64ToBytes(decodeURIComponent(taggerCellId)))
              }
            }
            dispatch('fetchTags')
          }
        })
        .catch(err => console.log('hcClient', err))
    },
    fetchTags ({ state, commit, dispatch }) {
      state.db.tags.toArray(tags => {
        if (tags !== undefined && tags !== null) commit('setTags', tags)
        if (state.taggerCellId !== '') {
          state.hcClient
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
            .catch(err => {
              console.log(err.data)
              if (err.data.data.includes('CellMissing')) dispatch('builderConductorAdmin/cellMissing', null, { root: true })
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
    holochainSaveTag ({ state, commit }, payload) {
      const tag = payload.tag
      if (tag.entryHash) {
        tag.entryHash = base64.base64ToBytes(tag.entryHash)
        state.hcClient
          .callZome({
            cap: null,
            cell_id: [state.taggerCellId, state.agentPubKey],
            zome_name: 'tagger',
            fn_name: 'delete_tag',
            provenance: state.agentPubKey,
            payload: tag
          })
      }
      state.hcClient
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
    migrateIndexDbToHolochain ({ state }) {
      batchSaveTags(state.hcClient, state.taggerCellId, state.agentPubKey, state.tags, 0)
    }
  },
  mutations: {
    hcClient (state, payload) {
      state.hcClient = payload
    },
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
