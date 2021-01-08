import Vue from 'vue'
import Vuex from 'vuex'
import { v4 as uuidv4 } from 'uuid'
import * as base64 from 'byte-base64'
import Dexie from 'dexie'
import io from 'socket.io-client'

const SOCKET_URL = 'ws://localhost:45678'

Vue.use(Vuex)

export default {
  namespaced: true,
  state: {
    socket: {},
    applicationName: '',
    refreshKey: 0,
    stdOutMessages: [],
    appServerMessages: [],
    socketServerMessages: [],
    testDnaMessages: [],
    demoMessages: [
      'STDOUT: ✨  Creating project in /Users/philipbeadle/holochain-2020/conductor-admin/server/dev-apps/chat.',
      'STDOUT: ⚙️  Installing CLI plugins. This might take a while...',
      'STDOUT: info No lockfile found.',
      'STDOUT: [1/4] Resolving packages...',
      'STDOUT: ✨  Creating project in /Users/philipbeadle/holochain-2020/conductor-admin/server/dev-apps/chat.',
      'STDOUT: ⚙️  Installing CLI plugins. This might take a while...',
      'STDOUT: info No lockfile found.',
      'STDOUT: ✨  Creating project in /Users/philipbeadle/holochain-2020/conductor-admin/server/dev-apps/chat.',
      'STDOUT: ⚙️  Installing CLI plugins. This might take a while...',
      'STDOUT: info No lockfile found.'
    ],
    showRefresh: false,
    treeItems: [],
    openFiles: [],
    selectedTab: -1,
    openFile: {},
    dnaTemplates: [],
    webPartTemplates: [],
    agents: {},
    agent: {
      handle: '',
      avatar: ''
    },
    conductor: {
      uuid: '2deb6610-911c-4cfc-b3c4-d89af573fa58',
      name: "Phil's Developer Conductor"
    }
  },
  actions: {
    initialise ({ state, commit }) {
      state.db = new Dexie('holochain')
      state.db.version(1).stores({
        agents: 'uuid,name,parent',
        files: '[parentDir+name],parentDir'
      })
      state.socket = io(SOCKET_URL)

      state.socket.on('CREATE_APLICATION_STDOUT', data => {
        console.log('CREATE_APLICATION_STDOUT', data)
        commit('stdOutMessage', data)
      })
      state.socket.on('CREATE_APLICATION_ERROR', data => {
        console.log('CREATE_APLICATION_ERROR', data)
        commit('stdOutMessage', data)
      })
      state.socket.on('CREATE_APLICATION_EXIT', data => {
        console.log('CREATE_APLICATION_EXIT', data)
        commit('showRefresh')
      })
      state.socket.on('RECURSE_APPLICATION_FILES', file => {
        console.log('RECURSE_APPLICATION_FILES', file)
        state.db.files.put(file)
      })
      state.socket.on('RECURSE_APPLICATION_FILES_ERROR', data => {
        console.log('RECURSE_APPLICATION_FILES_ERROR', data)
      })
      state.socket.on('RECURSE_APPLICATION_FILES_EXIT', data => {
        console.log('RECURSE_APPLICATION_FILES_EXIT', data)
      })

      state.socket.on('LINT_FILES_STDOUT', data => {
        console.log('LINT_FILES_STDOUT', data)
        commit('stdOutMessage', data)
      })
      state.socket.on('LINT_FILES_ERROR', data => {
        console.log('LINT_FILES_ERROR', data)
        commit('stdOutMessage', data)
      })
      state.socket.on('LINT_FILES_EXIT', data => {
        console.log('LINT_FILES_EXIT', data)
        commit('stdOutMessage', 'LINT_FILES_EXIT')
      })

      state.socket.on('SERVE_WEB_APP_STDOUT', data => {
        console.log('SERVE_WEB_APP_STDOUT', data)
        commit('appServerMessage', data)
      })
      state.socket.on('SERVE_WEB_APP_ERROR', data => {
        console.log('SERVE_WEB_APP_ERROR', data)
        commit('appServerMessage', data)
      })
      state.socket.on('SERVE_WEB_APP_EXIT', data => {
        console.log('SERVE_WEB_APP_EXIT', data)
        commit('appServerMessage', 'SERVE_WEB_APP_EXIT')
      })

      state.socket.on('SOCKET_SERVER_STDOUT', data => {
        console.log('SOCKET_SERVER_STDOUT', data)
        commit('socketServerMessage', data)
      })
      state.socket.on('SOCKET_SERVER_ERROR', data => {
        console.log('SOCKET_SERVER_ERROR', data)
        commit('socketServerMessage', data)
      })
      state.socket.on('SOCKET_SERVER_EXIT', data => {
        console.log('SOCKET_SERVER_EXIT', data)
        commit('socketServerMessage', 'SOCKET_SERVER_EXIT')
      })

      state.socket.on('TEST_DNA_STDOUT', data => {
        console.log('TEST_DNA_STDOUT', data)
        commit('testDnaMessage', data)
      })
      state.socket.on('TEST_DNA_ERROR', data => {
        console.log('TEST_DNA_ERROR', data)
        commit('testDnaMessage', data)
      })
      state.socket.on('TEST_DNA_EXIT', data => {
        console.log('TEST_DNA_EXIT', data)
        commit('testDnaMessage', 'TEST_DNA_EXIT')
      })
    },
    getTreeRootFolders ({ state, commit }) {
      state.db.files.where({ parentDir: '/' }).toArray(entries => {
        const treeItems = entries.map(entry => {
          entry.key = `${entry.parentDir}${entry.name}`
          if (entry.type === 'dir') {
            entry.children = []
          }
          return entry
        })
        commit('treeItems', treeItems)
      })
    },
    async createDirectory ({ state }, payload) {
      state.db.files.put({
        parentDir: payload.parentDir,
        name: payload.name,
        type: 'dir'
      })
      // state.socket.emit(
      //   'CREATE_DIRECTORY',
      //   { path: `${payload.parentDir}/${payload.name}` },
      //   success => {
      //     console.log(success.path)
      //   }
      // )
    },
    async createFile ({ state }, payload) {
      console.log(payload)
      state.db.transaction('rw', state.db.files, async () => {
        await state.db.files.put({
          parentDir: payload.parentDir,
          name: payload.filename,
          type: 'file'
        })
      })
      // state.socket.emit(
      //   'CREATE_FILE',
      //   { path: `${payload.parentDir}/${payload.name}` },
      //   success => {
      //     console.log(success)
      //   }
      // )
    },
    async renameEntryType ({ state }, payload) {
      // const name = payload.name
      // const oldName = payload.oldName
      // const newName = payload.newName
      // state.socket.emit(
      //   'RENAME_ENTRY_TYPE',
      //   { name, oldName, newName },
      //   success => {
      //     console.log(success)
      //   }
      // )
    },
    async duplicateEntryType ({ state }, payload) {
      // const name = payload.name
      // const oldName = payload.oldName
      // const newName = payload.newName
      // state.socket.emit(
      //   'DUPLICATE_ENTRY_TYPE',
      //   { name, oldName, newName },
      //   success => {
      //     console.log(success)
      //   }
      // )
    },
    async createApplication ({ state }, payload) {
      const name = payload.name
      const plugin = payload.plugin
      state.db.files.put({
        parentDir: '/',
        name,
        type: 'dir'
      })
      state.socket.emit('CREATE_APPLICATION', { name, plugin })
    },
    async recurseApplicationFiles ({ state }, payload) {
      const name = payload.name
      state.db.files.put({
        parentDir: '/',
        name,
        type: 'dir'
      })
      state.socket.emit('RECURSE_APPLICATION_FILES', { name })
    },
    async lintFiles ({ state, dispatch, commit }, payload) {
      const name = payload.name
      console.log(name)
      commit('clearStdOutMessages')
      state.socket.emit('LINT_FILES', { name }, success => {
        console.log(success)
        dispatch('refreshFiles')
      })
    },
    async testDna ({ state, commit }, payload) {
      const name = payload.name
      commit('clearTestDnaMessages')
      state.socket.emit('TEST_DNA', { name })
    },
    async installDna ({ state, commit }, payload) {
      const agent = payload.agent
      state.db.agents.get(agent.uuid).then((agent) => {
        console.log(agent)
      })
      const agentPubKey = await state.hcClient.admin.generateAgentPubKey()
      agent.agentPubKey = base64.bytesToBase64(agentPubKey)
      console.log(agentPubKey)
      console.log(agent.agentPubKey)
      const APP_ID = uuidv4()
      const app = await state.hcClient.admin.installApp({
        app_id: APP_ID,
        agent_key: agentPubKey,
        dnas: [
          {
            path: '/Users/philipbeadle/holochain-2020/dev-apps/ledger/dna/ledger.dna.gz',
            nick: 'Ledger'
          }
        ]
      })
      agent.cellId = base64.bytesToBase64(app.cell_data[0][0][0])
      console.log(app.cell_data[0][0][0])
      state.hcClient.admin.activateApp({ app_id: APP_ID })
      agent.appInterface = await state.hcClient.admin.attachAppInterface({ port: 0 })
      commit('updateAgent', agent)
      state.db.agents.put(agent)
    },
    refreshFiles ({ state, commit }) {
      console.log('refreshFiles')
      state.openFiles.map(oF => {
        console.log(oF.parentDir, oF.name)
        state.db.files
          .where('[parentDir+name]')
          .equals([oF.parentDir, oF.name])
          .first()
          .then(file => {
            console.log(file)
            commit('setFile', file)
          })
      })
    },
    openFileEdited ({ state, commit }, payload) {
      console.log({
        parentDir: payload.parentDir,
        name: payload.name
      })
      state.db.files
        .where('[parentDir+name]')
        .equals([payload.parentDir, payload.name])
        .first()
        .then(file =>
          commit('openFileEdited', payload.content !== file.content)
        )
    },
    async serveWebApp ({ state, commit }, payload) {
      const name = payload.name
      commit('clearAppServerMessages')
      state.socket.emit('SERVE_WEB_APP', { name }, success => {
        console.log(success)
      })
    },
    async socketServer ({ state, commit }, payload) {
      const name = payload.name
      console.log(name)
      commit('clearSocketServerMessages')
      // state.socket.emit('SOCKET_SERVER', { name }, success => {
      //   console.log(success)
      // })
    },
    async getTemplates ({ commit, state }) {
      console.log('GET_TEMPLATES')
      // state.socket.emit('GET_TEMPLATES', {}, templates => {
      //   commit('dnaTemplates', templates)
      // })
    },
    async cloneDna ({ state, dispatch }, payload) {
      // const template = payload.template
      // const name = payload.name
      // state.socket.emit('CLONE_DNA', { template, name }, message => {
      //   console.log(message)
      //   dispatch('recurseApplicationFiles', { name })
      // })
    },
    async cloneDevConductor ({ state, dispatch }, payload) {
      // const name = payload.name
      // state.socket.emit('CLONE_DEV_CONDUCTOR', { name }, message => {
      //   console.log(message)
      //   dispatch('recurseApplicationFiles', { name })
      // })
    },
    async cloneSocket ({ state, dispatch }, payload) {
      // const name = payload.name
      // state.socket.emit('CLONE_SOCKET', { name }, message => {
      //   console.log(message)
      //   dispatch('recurseApplicationFiles', { name })
      // })
    },
    async getWebPartTemplates ({ commit, state }, payload) {
      commit('webPartTemplates', [])
      const webPartType = payload.webPartType
      console.log('GET_WEB_PART_TEMPLATES', payload)
      state.socket.emit('GET_WEB_PART_TEMPLATES', { webPartType }, templates => {
        commit('webPartTemplates', templates)
      })
    },
    async cloneWebPart ({ state, dispatch }, payload) {
      // const webPartType = payload.webPartType
      // const template = payload.template
      // const name = payload.name
      // const webPartName = payload.webPartName
      console.log(payload)
      // state.socket.emit(
      //   'CLONE_WEB_PART',
      //   { webPartType, template, name, webPartName },
      //   message => {
      //     console.log(message)
      //     dispatch('recurseApplicationFiles', { name })
      //   }
      // )
    },
    openFile ({ state, commit }, payload) {
      const alreadyOpenTab = state.openFiles.findIndex(
        file =>
          `${file.parentDir}/${file.name}` ===
          `${payload.parentDir}/${payload.name}`
      )
      if (alreadyOpenTab === -1) {
        commit('pushOpenFiles', payload)
        const opts = {
          tabSize: 2,
          keyMap: 'sublime',
          mode: 'javascript',
          theme: 'base16-dark',
          readOnly: false,
          lineNumbers: true,
          line: true,
          lineWrapping: true,
          extraKeys: {
            'Cmd-S': function (instance) {
              const saveFile = {
                parentDir: payload.parentDir,
                name: payload.name,
                type: 'file',
                extension: payload.extension,
                encoding: payload.encoding,
                content: instance.getValue()
              }
              payload.content = instance.getValue()
              state.db.files.put(saveFile)
              // state.socket.emit('SAVE_FILE', saveFile)
            }
          }
        }
        switch (payload.extension) {
          case 'png':
          case 'jpg':
          case 'jpeg':
          case 'gif':
            opts.mode = 'image'
            break
          case 'rs':
            opts.mode = 'rust'
            break
          case 'yaml':
          case 'json':
          case 'nix':
          case 'code':
            opts.mode = 'javascript'
            opts.json = true
            break
          case 'js':
            opts.mode = 'javascript'
            opts.json = false
            break
          case 'md':
            opts.mode = 'markdown'
            opts.lineNumbers = false
            break
          case 'vue':
            opts.mode = 'vue'
            break
        }
        payload.options = opts
        payload.edited = false
        commit('openFile', payload)
        commit('selectedTab', state.openFiles.length - 1)
      } else {
        commit('openFile', state.openFiles[alreadyOpenTab])
        commit('selectedTab', alreadyOpenTab)
      }
    },
    fetchAgents ({ state, commit }, payload) {
      const conductor = { ...payload }
      state.db.agents
        .where('parent')
        .equals(conductor.uuid)
        .toArray(agents => {
          commit('setAgents', agents)
        })
      //  fetch from holochain in parallel to dexie
      //  .then(projects => {
      //    state.db.projects.bulkPut(projects).then(() => {
      //      commit("setProjects", projects);
      //    });
      //  });
    },
    async saveAgent ({ state, commit }, payload) {
      const agent = { ...payload.agent, parent: payload.conductor.uuid }
      state.db.agents.put(agent).then(() => {
        if (payload.action === 'create') {
          commit('createAgent', agent)
          console.log('createAgent', agent)
        } else {
          commit('updateAgent', agent)
        }
      })
    },
    deleteAgent ({ state, commit }, payload) {
      const agent = { ...payload }
      state.db.agents.delete(agent.uuid).then(() => {
        commit('deleteAgent', agent)
      })
    },
    setAgent ({ state, commit }, payload) {
      state.db.agents
        .get(payload)
        .then(agent => {
          state.db.agentApplications
            .where('agent')
            .equals(agent.uuid)
            .toArray(applications => {
              agent.agentApplications = applications
              commit('setAgentApplications', applications)
              commit('setAgent', agent)
            })
        })
        .catch(err => console.log(err))
    }
  },
  mutations: {
    setApplicationName (state, payload) {
      state.applicationName = payload
    },
    treeItems (state, payload) {
      state.treeItems = payload
      if (payload.length > 0) state.applicationName = payload[0].name
    },
    clearStdOutMessages (state) {
      state.stdOutMessages = []
    },
    stdOutMessage (state, payload) {
      state.stdOutMessages.push(payload)
    },
    clearAppServerMessages (state) {
      state.appServerMessages = []
    },
    appServerMessage (state, payload) {
      state.appServerMessages.push(payload)
    },
    clearSocketServerMessages (state) {
      state.socketServerMessages = []
    },
    socketServerMessage (state, payload) {
      state.socketServerMessages.push(payload)
    },
    clearTestDnaMessages (state) {
      state.testDnaMessages = []
    },
    testDnaMessage (state, payload) {
      state.testDnaMessages.push(payload)
    },
    dnaTemplates (state, payload) {
      state.dnaTemplates = payload
    },
    webPartTemplates (state, payload) {
      state.webPartTemplates = payload
    },
    showRefresh (state) {
      state.showRefresh = true
    },
    setFile (state, payload) {
      state.openFiles = state.openFiles.map(file =>
        `${file.parentDir}/${file.name}` !==
        `${payload.parentDir}/${payload.name}`
          ? file
          : { ...file, ...payload }
      )
      state.refreshKey++
    },
    selectedTab (state, payload) {
      state.selectedTab = payload
    },
    openFile (state, payload) {
      state.openFile = payload
    },
    pushOpenFiles (state, payload) {
      state.openFiles.push(payload)
    },
    setSelectedTab (state, payload) {
      state.selectedTab = payload
      state.openFile = state.openFiles[payload]
    },
    closeFile (state, payload) {
      state.openFiles = state.openFiles.filter(
        file =>
          `${file.parentDir}/${file.name}` !==
          `${payload.parentDir}/${payload.name}`
      )
    },
    openFileEdited (state, payload) {
      state.openFile.edited = payload
    },
    setAgents (state, payload) {
      state.agents = payload
    },
    createAgent (state, payload) {
      state.agents.push(payload)
    },
    updateAgent (state, payload) {
      state.agents = state.agents.map(a =>
        a.uuid !== payload.uuid ? a : { ...a, ...payload }
      )
    },
    deleteAgent (state, payload) {
      state.agents = state.agents.filter(a => a.uuid !== payload.uuid)
    },
    setAgent (state, payload) {
      state.agent = payload
    }
  },
  modules: {}
}
