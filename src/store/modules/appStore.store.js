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
          { id: 6, name: 'Profile' },
          { id: 5, name: 'Messaging' },
          { id: 7, name: 'Events' }
        ]
      },
      {
        id: 2,
        name: 'Project Management'
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
    cliPluginAppItems: [
      { id: 491, name: 'Basic' }
    ],
    cliPluginModuleItems: [
      { id: 749, name: 'Basic' }
    ],
    products: [
      {
        category: 49,
        uuid: 'f9c8e8c2-b3b4-4d73-8790-e9c0b729c629',
        name: 'Simple',
        type: 'application',
        preview: require('../../assets/img/shop/Simple1.png'),
        description: 'Simple is a complete Holochain application that you can use as a starting point for your own app. Simple let\'s you create, update, list and delete Things. Get it? The Simple Things in life :) This app shows you how to interact with Holochain from a modern web app built with Vue.js and Vuetify. Simple also takes advantage of the IndexDB, available in all browsers and has a lot of storage, to speed up the experience for people using your app. You can also use Simple as a shell app and install Holochain Modules to create your own app.',
        developerDescription: 'The Holochain app dev team\'s core focus is building high quality applications, modules and processes for Holo & Holochain. Always on the bleeding edge of Holochain the app dev team is continuously improving, automating & using their own applications.',
        screens: [
          require('@/assets/img/shop/Simple1.png'),
          require('@/assets/img/shop/Simple2.png')
        ],
        developer: 'Holochain',
        preset: {
          useConfigFiles: true,
          plugins: {
            '@vue/cli-plugin-babel': {},
            '@vue/cli-plugin-pwa': {},
            '@vue/cli-plugin-router': {
              historyMode: true
            },
            '@vue/cli-plugin-vuex': {},
            '@vue/cli-plugin-eslint': {
              config: 'standard',
              lintOn: [
                'save',
                'commit'
              ]
            },
            '@vue/cli-plugin-unit-mocha': {},
            '@vue/cli-plugin-e2e-cypress': {},
            'vue-cli-plugin-vuetify': {
              preset: 'configure',
              replaceComponents: true,
              iconFont: 'mdi',
              installFonts: true,
              locale: 'en',
              useAlaCarte: false,
              useCustomProperties: false,
              usePolyfill: false,
              useTheme: true
            },
            'vue-cli-plugin-holochain-app-simple': {}
          },
          vueVersion: '2',
          cssPreprocessor: 'dart-sass'
        }
      },
      {
        category: 49,
        uuid: '03231872-7341-4c78-92b8-38e7bbc58ec0',
        name: 'Shell',
        type: 'application',
        preview: require('../../assets/img/shop/basic-shell.png'),
        description: 'Use this super basic shell as your starting point.',
        developerDescription: 'The Holochain app dev team\'s core focus is building high quality applications, modules and processes for Holo & Holochain. Always on the bleeding edge of Holochain the app dev team is continuously improving, automating & using their own applications.',
        screens: [
          require('@/assets/img/shop/basic-shell.png')
        ],
        developer: 'Holochain',
        preset: {
          useConfigFiles: true,
          plugins: {
            '@vue/cli-plugin-babel': {},
            '@vue/cli-plugin-pwa': {},
            '@vue/cli-plugin-router': {
              historyMode: true
            },
            '@vue/cli-plugin-vuex': {},
            '@vue/cli-plugin-eslint': {
              config: 'standard',
              lintOn: [
                'save',
                'commit'
              ]
            },
            '@vue/cli-plugin-unit-mocha': {},
            '@vue/cli-plugin-e2e-cypress': {},
            'vue-cli-plugin-vuetify': {
              preset: 'configure',
              replaceComponents: true,
              iconFont: 'mdi',
              installFonts: true,
              locale: 'en',
              useAlaCarte: false,
              useCustomProperties: false,
              usePolyfill: false,
              useTheme: true
            },
            'vue-cli-plugin-holochain-app-shell': {}
          },
          vueVersion: 2,
          cssPreprocessor: 'dart-sass'
        }
      },
      {
        category: 2,
        uuid: 'd28d96a7-8e0d-4fac-8c02-626366b2f7ad',
        name: 'Kanban',
        type: 'application',
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
        category: 6,
        uuid: '03231872-7341-4c78-92b8-38e7bbc58ec0',
        name: 'Professional',
        type: 'module',
        preview: require('../../assets/img/shop/profile-site1.png'),
        description: 'Your profile information as a modern, super fast & great looking profile site. Especially targeted at consultants and freelancers. You coud add modules such as "Ledger" or the kanban app and build a business as well.',
        developerDescription: 'The Holochain app dev team\'s core focus is building high quality applications, modules and processes for Holo & Holochain. Always on the bleeding edge of Holochain the app dev team is continuously improving, automating & using their own applications.',
        screens: [
          require('@/assets/img/shop/profile-site1.png'),
          require('@/assets/img/shop/profile-site2.png'),
          require('@/assets/img/shop/profile-site3.png'),
          require('@/assets/img/shop/profile-site4.png'),
          require('@/assets/img/shop/profile-site5.png')
        ],
        developer: 'Holochain',
        plugin: 'vue-cli-plugin-holochain-module-professional-profile'
      },
      {
        category: 97,
        uuid: '3ee09d43-d7fd-4f64-b489-7f4dad7b540d',
        name: 'Performer',
        type: 'application',
        preview: require('../../assets/img/shop/performer-profile1.png'),
        description: 'The Performer Profile Site includes photos & music tools and sice most performers would like to cultivate a following there are modules for communicating with others who have registered. You can design your own forms you\'d like your fans to fill out as well as invite people to become part of your community.',
        developerDescription: 'The Holochain app dev team\'s core focus is building high quality applications, modules and processes for Holo & Holochain. Always on the bleeding edge of Holochain the app dev team is continuously improving, automating & using their own applications.',
        screens: [
          require('@/assets/img/shop/performer-profile1.png'),
          require('@/assets/img/shop/performer-profile2.png'),
          require('@/assets/img/shop/performer-profile3.png')
        ],
        developer: 'Holochain'
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
        developerDescription: 'The Holochain app dev team\'s core focus is building high quality applications, modules and processes for Holo & Holochain. Always on the bleeding edge of Holochain the app dev team is continuously improving, automating & using their own applications.',
        screens: [
          require('@/assets/img/shop/elemental-chat1.png'),
          require('@/assets/img/shop/elemental-chat2.png'),
          require('@/assets/img/shop/elemental-chat3.png')
        ],
        developer: 'Holochain'
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
        developerDescription: 'The Holochain app dev team\'s core focus is building high quality applications, modules and processes for Holo & Holochain. Always on the bleeding edge of Holochain the app dev team is continuously improving, automating & using their own applications.',
        preview: require('@/assets/img/shop/builder1.png'),
        screens: [
          require('@/assets/img/shop/builder1.png'),
          require('@/assets/img/shop/builder2.png'),
          require('@/assets/img/shop/builder3.png'),
          require('@/assets/img/shop/builder5.png')
        ],
        developer: 'Holochain'
      },
      {
        category: 2,
        uuid: '1969c523-1fb0-476f-85b4-62ef0cab0819',
        name: 'Ledger',
        type: 'module',
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
      },
      {
        category: 491,
        uuid: '7d3d60ab-ac36-49fc-b882-f47d16ca7949',
        name: 'Basic',
        type: 'app-plugin',
        price: '1000',
        description: 'A basic setup for publishing vue-cli-plugins. This app-plugin type creates a full website overwriting the App.vue.',
        developerDescription: 'The Holochain app dev team\'s core focus is building high quality applications, modules and processes for Holo & Holochain. Always on the bleeding edge of Holochain the app dev team is continuously improving, automating & using their own applications.',
        preview: require('@/assets/img/shop/basic-app-plugin-template1.png'),
        screens: [
          require('@/assets/img/shop/basic-app-plugin-template1.png'),
          require('@/assets/img/shop/basic-app-plugin-template2.png')
        ],
        developer: 'Holochain',
        template: 'basic'
      },
      {
        category: 555,
        uuid: 'a54f24d7-d908-4824-ad40-d21dfb6b8474',
        name: 'Basic',
        type: 'module-plugin',
        price: '1000',
        description: 'A basic setup for publishing vue-cli-plugins. This module-plugin needs to be installed into an existing app.',
        developerDescription: 'The Holochain app dev team\'s core focus is building high quality applications, modules and processes for Holo & Holochain. Always on the bleeding edge of Holochain the app dev team is continuously improving, automating & using their own applications.',
        preview: require('@/assets/img/shop/basic-module-plugin-template1.png'),
        screens: [
          require('@/assets/img/shop/basic-module-plugin-template1.png'),
          require('@/assets/img/shop/basic-module-plugin-template2.png')
        ],
        developer: 'Holochain',
        template: 'basic'
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
