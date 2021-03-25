import Vue from 'vue'
import Vuex from 'vuex'
// import { v4 as uuidv4 } from 'uuid'
// import * as base64 from 'byte-base64'
// import Dexie from 'dexie'

Vue.use(Vuex)

export default {
  namespaced: true,
  state: {
    happCategories: [
      {
        id: 1,
        name: 'General'
      },
      {
        id: 2,
        name: 'Social'
      },
      {
        id: 3,
        name: 'Project Management'
      },
      {
        id: 4,
        name: 'Developer'
      }
    ],
    happs: [
      {
        category: 4,
        uuid: 'ae916269-b80f-49fa-b759-c45502486793',
        name: 'Builder',
        route: '/builder/organisations',
        preview: require('@/assets/img/shop/builder1.png')
      }
    ]
  },
  actions: {
    initialise ({ state, commit }) {
    }
  },
  mutations: {
    filterItems (state, payload) {
      state.filterItems = payload
    },
    happs (state, payload) {
      state.happs = payload
    }
  },
  modules: {}
}
