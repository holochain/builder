import Vue from 'vue'
import Vuex from 'vuex'
import modules from './modules'
import Dexie from 'dexie'
import io from 'socket.io-client'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
  },
  mutations: {
  },
  actions: {
    initialiseStore ({ state }, payload) {
      state.db = new Dexie('db name, use app name normally')
      state.socket = io(payload.webSocketUrl)
      state.db.version(1).stores({
        examples: 'uuid,name' // add indexable fields
      })
    }
  },
  modules
})
