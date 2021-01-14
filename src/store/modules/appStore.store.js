import Vue from 'vue'
import Vuex from 'vuex'
// import { v4 as uuidv4 } from 'uuid'
// import * as base64 from 'byte-base64'
import Dexie from 'dexie'

Vue.use(Vuex)

export default {
  namespaced: true,
  state: {
    socket: {},
    applicationItems: [
      { id: 49, name: 'Basic' },
      { id: 48, name: 'Single Page Scrolling' },
      { id: 97, name: 'Profile Sites' },
      { id: 101, name: 'Event Sites' },
      { id: 45, name: 'Community Portals' },
      { id: 46, name: 'Mobile Apps' }
    ],
    moduleItems: [
      {
        id: 1,
        name: 'Social Apps',
        children: [
          { id: 5, name: 'Messaging' },
          { id: 6, name: 'Reputation' },
          { id: 7, name: 'Events' }
        ]
      },
      {
        id: 2,
        name: 'Project Management',
        children: [
          { id: 9, name: 'Kanban' },
          { id: 4, name: 'Invoicing' }
        ]
      },
      {
        id: 12,
        name: 'Developer Tools',
        children: [
          { id: 27, name: ' Code Editors' },
          { id: 21, name: 'Source Control' }
        ]
      }
    ],
    products: [
      {
        category: 49,
        uuid: 'f9c8e8c2-b3b4-4d73-8790-e9c0b729c629',
        name: 'Simple',
        type: 'application',
        preview: require('../../assets/img/shop/Simple1.png'),
        description: 'Simple is a complete Holochain application that you can use as a starting point for your own app. Simple let\'s you create, update, list and delete Things. Get it? The Simple Things in life :) This app shows you how to interact with Holochain from a modern web app built with Vue.js and Vuetify. Simple also takes advantage of the IndexDB, available in all browsers and has a lot of storage, to speed up the experience for people using your app.',
        developerDescription: 'e-s-c-r\'s core focus is building high quality certified applications and modules for Holo & Holochain. Always on the bleeding edge of Holochain e-s-c-r is continuously improving, automating & using their own applications.',
        screens: [
          require('@/assets/img/shop/Simple1.png'),
          require('@/assets/img/shop/Simple2.png')
        ],
        developer: 'Eat Sleep Code Repeat',
        preset: 'holochain/vue-cli-preset-holochain-app-simple'
      },
      {
        category: 101,
        uuid: 'd28d96a7-8e0d-4fac-8c02-626366b2f7ad',
        name: 'Kanban',
        type: 'application',
        preview: require('../../assets/img/shop/recursive4.png'),
        description: 'This Vuetify web app, Columns & Cards, is setup to show you how easy it is to build a Holochain application. Columns & Cards is a starting point for, as you guessed, recursivecards apps that don\'t require a complicated navigation system or other fancy layouts. Columns & Cards shows you how to use Vue Router, Vuex and Holochain. It also shows you how to secure your routes and check to make sure the person using Columns & Cards has a Holochain Public Agent Key or has logged in to Holo. Columns & Cards also uses dexie.js to store information in the browser database, IndexDB. This speeds up your even more enabling you to retrieve data immediately from IndexDB and then let the data be updated by Holochain. This is known as the stale-while-revalidate (SWR) pattern. If your app needs more complicated layouts try the Holochain Kitchen Sink option.',
        developerDescription: 'e-s-c-r\'s core focus is building high quality certified applications and modules for Holo & Holochain. Always on the bleeding edge of Holochain e-s-c-r is continuously improving, automating & using their own applications.',
        screens: [
          require('@/assets/img/shop/recursive1.png'),
          require('@/assets/img/shop/recursive2.png'),
          require('@/assets/img/shop/recursive3.png')
        ],
        developer: 'Eat Sleep Code Repeat',
        plugin: 'vue-cli-plugin-holochain-recursive-cards'
      },
      {
        category: 97,
        uuid: '03231872-7341-4c78-92b8-38e7bbc58ec0',
        name: 'Professional',
        type: 'application',
        preview: require('../../assets/img/shop/profile-site3.png'),
        description: 'Use this as your starting point for building a modern, super fast & great looking profile site. Especially targeted at consultants and freelancers. You coud add modules such as "Ledger" or the kanban app and build a business as well.',
        developerDescription: 'e-s-c-r\'s core focus is building high quality certified applications and modules for Holo & Holochain. Always on the bleeding edge of Holochain e-s-c-r is continuously improving, automating & using their own applications.',
        screens: [
          require('@/assets/img/shop/profile-site2.png'),
          require('@/assets/img/shop/profile-site1.png'),
          require('@/assets/img/shop/profile-site3.png'),
          require('@/assets/img/shop/profile-site4.png')
        ],
        developer: 'Eat Sleep Code Repeat',
        preset: 'vue-cli-preset-holochain-app-professional-profile'
      },
      {
        category: 97,
        uuid: '3ee09d43-d7fd-4f64-b489-7f4dad7b540d',
        name: 'Performer',
        type: 'application',
        preview: require('../../assets/img/shop/performer-profile1.png'),
        description: 'The Performer Profile Site includes photos & music tools and sice most performers would like to cultivate a following there are modules for communicating with others who have registered. You can design your own forms you\'d like your fans to fill out as well as invite people to become part of your community.',
        developerDescription: 'e-s-c-r\'s core focus is building high quality certified applications and modules for Holo & Holochain. Always on the bleeding edge of Holochain e-s-c-r is continuously improving, automating & using their own applications.',
        screens: [
          require('@/assets/img/shop/performer-profile1.png'),
          require('@/assets/img/shop/performer-profile2.png'),
          require('@/assets/img/shop/performer-profile3.png')
        ],
        developer: 'Eat Sleep Code Repeat',
        plugin: 'vue-cli-plugin-holochain-app-performer-profile'
      },
      {
        category: 5,
        uuid: '499d811d-530c-4f95-8576-438ab7e0c1ea',
        name: 'El Chato',
        type: 'module',
        price: '1000',
        preview: require('../../assets/img/shop/community.png'),
        route: '/elemental-chat',
        description: 'Instant messaging app with channels.',
        developerDescription: 'e-s-c-r\'s core focus is building high quality certified applications and modules for Holo & Holochain. Always on the bleeding edge of Holochain e-s-c-r is continuously improving, automating & using their own applications.',
        screens: [
          require('@/assets/img/shop/elemental-chat1.png'),
          require('@/assets/img/shop/elemental-chat2.png'),
          require('@/assets/img/shop/elemental-chat3.png')
        ],
        developer: 'Eat Sleep Code Repeat',
        plugin: 'vue-cli-plugin-holochain-module-elemental-chat'
      },
      {
        category: 5,
        uuid: '312ee3cf-79c1-4151-9f5a-43d2e87204eb',
        name: 'Kizuna',
        type: 'module',
        price: '4000',
        preview: require('../../assets/img/shop/kizuna.png'),
        developer: 'Kizuna Inc'
      },
      {
        category: 27,
        uuid: 'ae916269-b80f-49fa-b759-c45502486793',
        name: 'Builder',
        type: 'module',
        price: '1000',
        route: '/builder',
        description: 'Builder IDE is a Code Editor with a set of menu items for quickly creating your very own Holo Applications. Choose from a range of base projects that are complete functioning Holo apps to get you started. Then add extra functionality with complete modules. You can also add new layouts, views & entry types. Builder also comes with its own Developer Holochain conductor where you can add Demo Agents and install your new DNA for each Agent. You can also lint your files and run DNA tests right from the menu.',
        developerDescription: 'e-s-c-r\'s core focus is building high quality certified applications and modules for Holo & Holochain. Always on the bleeding edge of Holochain e-s-c-r is continuously improving, automating & using their own applications.',
        preview: require('@/assets/img/shop/builder1.png'),
        screens: [
          require('@/assets/img/shop/builder1.png'),
          require('@/assets/img/shop/builder2.png'),
          require('@/assets/img/shop/builder3.png'),
          require('@/assets/img/shop/builder5.png')
        ],
        developer: 'Eat Sleep Code Repeat',
        plugin: 'vue-cli-plugin-holochain-module-builder'
      },
      {
        category: 4,
        uuid: '1969c523-1fb0-476f-85b4-62ef0cab0819',
        name: 'Ledger',
        type: 'module',
        price: '1000',
        route: '/ledger-invoices',
        description: 'Ledger is an invoicing and expenses app designed for the individual consultant. Add how you want to get paid to the consultsant profile and then add clients. Record the work you are doing for a client as line items in an invoice. When you send the invocie to be paid simply drag it to the "Sent" column and when it\'s paid drag it to the "Paid" column.',
        developerDescription: 'e-s-c-r\'s core focus is building high quality certified applications and modules for Holo & Holochain. Always on the bleeding edge of Holochain e-s-c-r is continuously improving, automating & using their own applications.',
        preview: require('@/assets/img/shop/ledger-preview.png'),
        screens: [
          require('@/assets/img/shop/ledger-client.png'),
          require('@/assets/img/shop/ledger-invoices.png'),
          require('@/assets/img/shop/ledger-expenses.png'),
          require('@/assets/img/shop/ledger-contacts.png'),
          require('@/assets/img/shop/ledger-profile.png')
        ],
        developer: 'Eat Sleep Code Repeat',
        plugin: 'vue-cli-plugin-holochain-module-ledger'
      }
    ]
  },
  actions: {
    initialise ({ state, commit }) {
      state.db = new Dexie('appStore')
      state.db.version(1).stores({
        products: 'uuid,[branch+name],branch'
      })
    }
  },
  mutations: {
    setApplicationName (state, payload) {
      state.applicationName = payload
    },
    filterItems (state, payload) {
      state.filterItems = payload
    },
    products (state, payload) {
      state.products = payload
    }
  },
  modules: {}
}
