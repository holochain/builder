import Vue from 'vue'
import Vuex from 'vuex'
import { v4 as uuidv4 } from 'uuid'
import * as base64 from 'byte-base64'
import Dexie from 'dexie'
import io from 'socket.io-client'
import { AdminWebsocket } from '@holochain/conductor-api'

const SOCKET_URL = 'ws://localhost:45678'
const HOLOCHAIN_ADMIN_SOCKET_URL = 'ws://localhost:26972'

Vue.use(Vuex)

export default {
  namespaced: true,
  state: {
    socket: {},
    hcAdmin: {},
    hcClient: {},
    appInterface: {},
    applicationName: '',
    refreshKey: 0,
    treeRefreshKey: 0,
    stdOutMessages: [],
    appServerMessages: [],
    conductorMessages: [],
    testDnaMessages: [],
    finished: false,
    treeItems: [],
    dnaPaths: [],
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
    },
    currentBranch: undefined,
    currentFiles: [],
    committedFiles: [],
    commits: [],
    fileTypes: {
      gitignore: 'mdi-git',
      editorconfig: 'mdi-code-brackets',
      browserslistrc: 'mdi-format-list-checks',
      gz: 'mdi-folder-zip-outline',
      zip: 'mdi-folder-zip-outline',
      rar: 'mdi-folder-zip-outline',
      htm: 'mdi-language-html5',
      html: 'mdi-language-html5',
      'eslintrc.js': 'mdi-language-javascript',
      js: 'mdi-language-javascript',
      ts: 'mdi-language-typescript',
      json: 'mdi-code-json',
      pdf: 'mdi-file-pdf',
      ico: 'mdi-file-image',
      svg: 'mdi-svg',
      png: 'mdi-file-image',
      jpg: 'mdi-file-image',
      jpeg: 'mdi-file-image',
      mp4: 'mdi-filmstrip',
      mkv: 'mdi-filmstrip',
      avi: 'mdi-filmstrip',
      wmv: 'mdi-filmstrip',
      mov: 'mdi-filmstrip',
      txt: 'mdi-file-document-outline',
      xls: 'mdi-file-excel',
      other: 'mdi-file-outline',
      nix: 'mdi-nix',
      rs: 'mdi-code-braces',
      md: 'mdi-language-markdown',
      yaml: 'mdi-file-settings-outline',
      toml: 'mdi-file-settings',
      vue: 'mdi-vuetify',
      lock: 'mdi-file-lock-outline',
      LICENSE: 'mdi-license'
    }
  },
  actions: {
    initialise ({ state, commit, dispatch }) {
      state.db = new Dexie('builder')
      state.db.version(1).stores({
        agents: 'uuid,name,parent',
        commits: 'uuid,parentBranch,branch,timestamp',
        currentFiles: '[parentDir+name],parentDir,parentBranch,branch',
        committedFiles: '[parentDir+name],parentDir,parentBranch,branch'
      })
      state.socket = io(SOCKET_URL)

      state.db.currentFiles.toArray(currentFiles => {
        commit('currentFiles', currentFiles)
      })
      state.db.committedFiles.toArray(committedFiles => {
        commit('committedFiles', committedFiles)
      })
      state.db.commits.toArray(commits => {
        commit('commits', commits)
        if (localStorage.getItem('commitUuid')) {
          const uuid = localStorage.getItem('commitUuid')
          state.db.commits.where({ uuid }).first(com => {
            const branchCommits = state.commits.filter(c => c.branch === com.branch)
            console.log(branchCommits)
            const currentBranch = {
              parentBranch: com.parentBranch,
              branch: com.branch,
              commits: branchCommits
            }
            commit('currentBranch', currentBranch)
          })
        } else {
          const currentBranch = {
            parentBranch: '/',
            name: 'main',
            commits: []
          }
          commit('currentBranch', currentBranch)
        }
      })

      state.socket.on('TERMINAL_STDOUT', data => {
        console.log('TERMINAL_STDOUT', data)
        commit('stdOutMessage', data)
      })
      state.socket.on('TERMINAL_ERROR', data => {
        console.log('TERMINAL_ERROR', data)
        commit('stdOutMessage', data)
      })
      state.socket.on('TERMINAL_EXIT', data => {
        console.log('TERMINAL_EXIT', data)
        commit('stdOutMessage', data)
      })

      // state.socket.on('ADD_MODULE_STDOUT', data => {
      //   console.log('ADD_MODULE_STDOUT', data)
      //   commit('stdOutMessage', data)
      // })
      // state.socket.on('ADD_MODULE_ERROR', data => {
      //   console.log('ADD_MODULE_ERROR', data)
      //   commit('stdOutMessage', data)
      // })
      // state.socket.on('ADD_MODULE_EXIT', data => {
      //   console.log('ADD_MODULE_EXIT', data)
      //   commit('socketFinished', true)
      // })

      state.socket.on('RECURSE_APPLICATION_FILES', file => {
        // console.log('RECURSE_APPLICATION_FILES', file)
        state.db.currentFiles.put(file)
      })
      state.socket.on('RECURSE_APPLICATION_FILES_ERROR', data => {
        console.log('RECURSE_APPLICATION_FILES_ERROR', data)
      })
      state.socket.on('RECURSE_APPLICATION_FILES_EXIT', () => {
        // console.log('RECURSE_APPLICATION_FILES_EXIT')
        state.db.currentFiles.toArray(currentFiles => {
          commit('currentFiles', currentFiles)
        })
        commit('incrementTreeRefreshKey')
        dispatch('getDnaPaths')
      })

      // state.socket.on('LINT_FILES_STDOUT', data => {
      //   console.log('LINT_FILES_STDOUT', data)
      //   commit('stdOutMessage', data)
      // })
      // state.socket.on('LINT_FILES_ERROR', data => {
      //   console.log('LINT_FILES_ERROR', data)
      //   commit('stdOutMessage', data)
      // })
      // state.socket.on('LINT_FILES_EXIT', data => {
      //   console.log('LINT_FILES_EXIT', data)
      //   commit('stdOutMessage', 'LINT_FILES_EXIT')
      //   commit('socketFinished', true)
      // })

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

      state.socket.on('CONDUCTOR_STDOUT', data => {
        console.log('CONDUCTOR_STDOUT', data)
        commit('conductorMessage', data)
        if (data.includes('Conductor ready')) {
          AdminWebsocket.connect(HOLOCHAIN_ADMIN_SOCKET_URL, 10000).then(admin => {
            state.hcAdmin = admin
            state.hcAdmin.attachAppInterface({ port: 0 }).then(appInterface => {
              state.hcClient.appInterface = appInterface
            })
          })
        }
      })
      state.socket.on('CONDUCTOR_ERROR', data => {
        console.log('CONDUCTOR_ERROR', data)
        commit('conductorMessage', data)
      })
      state.socket.on('CONDUCTOR_EXIT', data => {
        console.log('CONDUCTOR_EXIT', data)
        commit('conductorMessage', data)
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
        commit('socketFinished', true)
      })
    },
    getTreeRootFolders ({ state, commit }) {
      state.db.currentFiles.where({ parentDir: '/' }).toArray(entries => {
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
    getDnaPaths ({ state, commit }) {
      state.db.currentFiles.toArray(entries => {
        const dnaPaths = entries.filter(f => f.parentDir === `/${state.applicationName}/dna/`)
        commit('dnaPaths', dnaPaths)
      })
    },
    async createDirectory ({ state }, payload) {
      state.db.currentFiles.put({
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
      state.db.transaction('rw', state.db.currentFiles, async () => {
        await state.db.currentFiles.put({
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
    async createApplication ({ state, commit }, payload) {
      const name = payload.name
      const preset = payload.preset
      state.db.currentFiles.put({
        parentDir: '/',
        name,
        type: 'dir'
      })
      commit('setApplicationName', name)
      state.socket.emit('CREATE_APPLICATION', { name, preset })
    },
    async addModule ({ state }, payload) {
      console.log(payload)
      const name = payload.name
      const plugin = payload.plugin
      state.socket.emit('ADD_MODULE', { name, plugin })
    },
    async recurseApplicationFiles ({ state }, payload) {
      const name = 'testrepo' // payload.name
      state.db.currentFiles.clear().then(result => {
        console.log(result)
        state.db.currentFiles.put({
          parentDir: '/',
          name,
          type: 'dir'
        })
        state.socket.emit('RECURSE_APPLICATION_FILES', { name })
      })
    },
    commitChanges ({ state, getters, commit }, payload) {
      const changes = getters.changes
      const message = payload.commitMessage
      let newBranchCommit = false
      if (state.commits.length === 0) newBranchCommit = true
      const newCommit = {
        uuid: uuidv4(),
        branch: state.currentBranch.name,
        parentBranch: state.currentBranch.parentBranch,
        newBranchCommit,
        message,
        timestamp: Date.now(),
        newFiles: changes.newFiles,
        updatedFiles: changes.updatedFiles,
        deletedFiles: changes.deletedFiles
      }
      commit('addCommit', newCommit)
      localStorage.setItem('commitUuid', newCommit.uuid)
      state.db.commits.put(newCommit)
      state.db.committedFiles.clear()
      state.db.currentFiles.toArray(files => {
        state.db.committedFiles.bulkPut(files)
        commit('committedFiles', files)
      })
    },
    createBranch ({ state, commit }, payload) {
      const newCommit = {
        uuid: uuidv4(),
        branch: payload.name,
        parentBranch: `${state.currentBranch.parentBranch}${state.currentBranch.branch}/`,
        newBranchCommit: true,
        message: 'New Branch',
        timestamp: Date.now(),
        newFiles: state.currentFiles,
        updatedFiles: [],
        deletedFiles: []
      }
      commit('addCommit', newCommit)
      state.db.commits.put(newCommit)
      state.db.committedFiles.clear()
      state.db.currentFiles.toArray(files => {
        state.db.committedFiles.bulkPut(files)
        commit('committedFiles', files)
      })
      const currentBranch = {
        branch: newCommit.branch,
        parentBranch: newCommit.parentBranch,
        commits: newCommit
      }
      localStorage.setItem('commitUuid', newCommit.uuid)
      commit('currentBranch', currentBranch)
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
      const path = payload.path
      commit('clearTestDnaMessages')
      state.socket.emit('TEST_DNA', { path })
    },
    refreshFiles ({ state, commit }) {
      console.log('refreshFiles')
      state.openFiles.map(oF => {
        console.log(oF.parentDir, oF.name)
        state.db.currentFiles
          .where('[parentDir+name]')
          .equals([oF.parentDir, oF.name])
          .first()
          .then(file => {
            console.log(file)
            commit('setFile', file)
          })
      })
    },
    async startWebServer ({ state, commit }, payload) {
      const name = payload.name
      commit('clearAppServerMessages')
      state.socket.emit('START_WEB_SERVER', { name }, success => {
        console.log(success)
      })
    },
    async stopWebServer ({ state }) {
      state.socket.emit('STOP_WEB_SERVER')
    },
    async startConductor ({ state, commit }) {
      commit('clearConductorMessages')
      state.socket.emit('START_CONDUCTOR')
    },
    async stopConductor ({ state }) {
      state.socket.emit('STOP_CONDUCTOR')
    },
    async resetConductor ({ state, commit }) {
      state.socket.emit('RESET_CONDUCTOR')
      state.db.agents
        .where('parent')
        .equals(state.uuid)
        .toArray(agents => {
          agents.forEach(agent => {
            delete agent.agentPubKey
            delete agent.cellData
            state.db.agents.put(agent)
          })
        })
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
              state.db.currentFiles.put(saveFile)
              state.socket.emit('SAVE_FILE', saveFile)
              commit('openFileSaved', saveFile)
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
    generateAgentKey ({ state, commit }, payload) {
      const agent = payload.agent
      state.hcAdmin.generateAgentPubKey().then(agentPubKey => {
        console.log(agentPubKey)
        agent.agentPubKey = base64.bytesToBase64(agentPubKey)
        commit('updateAgent', agent)
        state.db.agents.put(agent)
      })
    },
    installDna ({ state, commit }, payload) {
      console.log(payload)
      const dnas = []
      payload.dnaPaths.forEach(dna => {
        dnas.push({
          path: `../../dev-apps${dna.parentDir}${dna.name}/${dna.name}.dna.gz`,
          nick: dna.name
        })
      })
      console.log(dnas)

      const agent = payload.agent
      const appId = uuidv4()
      state.hcAdmin.installApp({
        installed_app_id: appId,
        agent_key: base64.base64ToBytes(agent.agentPubKey),
        dnas
      }).then(app => {
        agent.cellData = app.cell_data
        state.hcAdmin.activateApp({ installed_app_id: appId })
        commit('updateAgent', agent)
        state.db.agents.put(agent)
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
  getters: {
    changes: state => {
      const newFiles = []
      const updatedFiles = []
      const deletedFiles = []
      state.currentFiles.forEach(file => {
        const lastCommitFile = state.committedFiles.find(
          f => `${f.parentDir}${f.name}` === `${file.parentDir}${file.name}`
        )
        if (lastCommitFile === undefined) {
          newFiles.push(file)
        } else {
          if (file.content !== lastCommitFile.content) {
            updatedFiles.push(file)
          }
        }
      })
      state.committedFiles.forEach(file => {
        const currentBranchFile = state.currentFiles.find(
          f => `${f.parentDir}${f.name}` === `${file.parentDir}${file.name}`
        )
        if (currentBranchFile === undefined) {
          deletedFiles.push(file)
        }
      })
      return {
        newFiles,
        updatedFiles,
        deletedFiles
      }
    },
    branches: state => {
      if (state.commits.length === 0) {
        return [
          {
            parentBranch: '/',
            branch: 'main',
            commits: []
          }
        ]
      } else {
        const newBranchCommits = state.commits.filter(commit => commit.newBranchCommit === true).sort((a, b) => a.timestamp > b.timestamp)
        return newBranchCommits.map(commit => {
          const branchCommits = state.commits.filter(c => c.branch === commit.branch)
          return {
            parentBranch: commit.parentBranch,
            branch: commit.branch,
            commits: branchCommits
          }
        })
      }
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
    currentBranch (state, payload) {
      state.currentBranch = payload
    },
    currentFiles (state, payload) {
      state.currentFiles = payload
    },
    committedFiles (state, payload) {
      state.committedFiles = payload
    },
    commits (state, payload) {
      state.commits = payload
    },
    addCommit (state, payload) {
      state.commits.push(payload)
      state.currentBranch.commits.push(payload)
    },
    incrementTreeRefreshKey (state) {
      state.treeRefreshKey++
    },
    dnaPaths (state, payload) {
      state.dnaPaths = payload
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
    clearConductorMessages (state) {
      state.conductorMessages = []
    },
    conductorMessage (state, payload) {
      state.conductorMessages.push(payload)
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
    socketFinished (state, payload) {
      state.finished = payload
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
      state.openFiles = state.openFiles.map(f =>
        f.key !== payload.key ? f : { ...f, ...payload }
      )
    },
    openFileSaved (state, payload) {
      payload.edited = false
      console.log(payload)
      state.openFiles = state.openFiles.map(f =>
        `${f.parentDir}${f.name}` !== `${payload.parentDir}${payload.name}` ? f : { ...f, ...payload }
      )
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
