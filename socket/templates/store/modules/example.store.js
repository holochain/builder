import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex);

export default {
  namespaced: true,
  state: {
  },
  actions: {
    initialise ({ rootState, commit }) {
      rootState.socket.on('SOCKET_EMIT_EXAMPLE_STDOUT', data => {
        console.log('SOCKET_EMIT_EXAMPLE_STDOUT', data)
        commit('stdOutMessage', data)
      })
      rootState.socket.on('SOCKET_EMIT_EXAMPLE_ERROR', data => {
        console.log('SOCKET_EMIT_EXAMPLE_ERROR', data)
        commit('stdOutMessage', data)
      })
      rootState.socket.on('SOCKET_EMIT_EXAMPLE_EXIT', data => {
        console.log('SOCKET_EMIT_EXAMPLE_EXIT', data)
        commit('stdOutMessage', 'SOCKET_EMIT_EXAMPLE_EXIT')
      })
    },
    async exampleAction ({ rootState }, payload) {
      rootState.db.examples.put({
        uuid: payload.uuid,
        name: payload.name
      })
      // Name of emit, payload and optional callback
      // If no call back events in initialise used.
      rootState.socket.emit(
        'SOCKET_EMIT_EXAMPLE_TO_SERVER',
        {
          uuid: payload.uuid,
          name: payload.name
        },
        success => {
          console.log(success.path)
        }
      )
    }
  },
  mutations: {
    clearStdOutMessages (state) {
      state.stdOutMessages = []
    },
    stdOutMessage (state, payload) {
      state.stdOutMessages.push(payload)
    }
  },
  modules: {}
}
