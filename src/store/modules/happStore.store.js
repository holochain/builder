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
        name: 'Project Management'
      },
      {
        id: 4,
        name: 'Social'
      }
    ],
    happs: [
      {
        category: 2,
        uuid: 'd28d96a7-8e0d-4fac-8c02-626366b2f7ad',
        name: 'Kanban',
        preview: require('../../assets/img/shop/recursive4.png'),
        description: 'Kanban is a Japanese manufacturing system in which the supply of components is regulated through the use of an instruction card sent along the production line. This kanban module is recursive meaning you can add columns to columns allowing you to keep all your projects in one place.',
        developerDescription: 'The Holochain app dev team\'s core focus is building high quality applications, modules and processes for Holo & Holochain. Always on the bleeding edge of Holochain the app dev team is continuously improving, automating & using their own applications.',
        screens: [
          require('@/assets/img/shop/recursive1.png'),
          require('@/assets/img/shop/recursive2.png'),
          require('@/assets/img/shop/recursive3.png')
        ],
        developer: 'Holochain',
        plugin: 'vue-cli-plugin-holochain-module-kanban'
      },
      {
        category: 1,
        uuid: '14ac700f-f7b8-4b64-bf28-b221568bb86b',
        name: 'Notes',
        preview: require('../../assets/img/shop/notes1.png'),
        description: 'Jot your ideas and notes down',
        developerDescription: 'The Holochain app dev team\'s core focus is building high quality applications, modules and processes for Holo & Holochain. Always on the bleeding edge of Holochain the app dev team is continuously improving, automating & using their own applications.',
        screens: [
          require('@/assets/img/shop/notes1.png'),
          require('@/assets/img/shop/notes2.png'),
          require('@/assets/img/shop/notes3.png')
        ],
        developer: 'Holochain',
        plugin: 'vue-cli-plugin-holochain-module-notes'
      },
      {
        category: 4,
        uuid: '499d811d-530c-4f95-8576-438ab7e0c1ea',
        name: 'Elemental Chat',
        price: '1000',
        preview: require('../../assets/img/shop/community.png'),
        route: '/elemental-chat',
        description: 'Instant messaging app with channels.',
        developerDescription: 'The Holochain app dev team\'s core focus is building high quality applications, modules and processes for Holo & Holochain. Always on the bleeding edge of Holochain the app dev team is continuously improving, automating & using their own applications.',
        screens: [
          require('@/assets/img/shop/elemental-chat1.png'),
          require('@/assets/img/shop/elemental-chat2.png'),
          require('@/assets/img/shop/elemental-chat3.png')
        ],
        developer: 'Holochain'
      },
      {
        category: 4,
        uuid: '1969c523-1fb0-476f-85b4-62ef0cab0819',
        name: 'Ledger',
        price: '1000',
        route: '/ledger-invoices',
        description: 'Ledger is an invoicing and expenses app designed for the individual consultant. Add how you want to get paid to the consultsant profile and then add clients. Record the work you are doing for a client as line items in an invoice. When you send the invocie to be paid simply drag it to the "Sent" column and when it\'s paid drag it to the "Paid" column.',
        developerDescription: 'The Holochain app dev team\'s core focus is building high quality applications, modules and processes for Holo & Holochain. Always on the bleeding edge of Holochain the app dev team is continuously improving, automating & using their own applications.',
        preview: require('@/assets/img/shop/ledger-preview.png'),
        screens: [
          require('@/assets/img/shop/ledger-client.png'),
          require('@/assets/img/shop/ledger-invoices.png'),
          require('@/assets/img/shop/ledger-expenses.png'),
          require('@/assets/img/shop/ledger-contacts.png'),
          require('@/assets/img/shop/ledger-profile.png')
        ],
        developer: 'Holochain',
        plugin: 'vue-cli-plugin-holochain-module-ledger'
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
