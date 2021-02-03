import Vue from 'vue'
import Vuex from 'vuex'
import { v4 as uuidv4 } from 'uuid'
import * as base64 from 'byte-base64'
import Dexie from 'dexie'
import io from 'socket.io-client'
import { AdminWebsocket } from '@holochain/conductor-api'
import DiffMatchPatch from 'diff-match-patch'

const SOCKET_URL = 'ws://localhost:45678'
const HOLOCHAIN_ADMIN_SOCKET_DOCKER_URL = 'ws://localhost:26971'
const HOLOCHAIN_APP_INTERFACE_PORT = 11381
const HOLOCHAIN_APP_INTERFACE_DOCKER_PORT = 11380

Vue.use(Vuex)

export default {
  namespaced: true,
  state: {
    socket: {},
    hcAdmin: {},
    hcClient: {},
    appInterface: {},
    applicationName: '',
    applications: [],
    plugins: [],
    refreshKey: 0,
    treeRefreshKey: 0,
    stdOutMessages: [],
    appServerMessages: [],
    appServerRunning: false,
    conductorMessages: [],
    conductorRunning: false,
    testDnaMessages: [],
    finished: false,
    treeItems: [],
    dnaPaths: [],
    dnaEntryTypes: [],
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
    currentChanges: {
      newFiles: [],
      updatedFiles: [],
      deletedFiles: []
    },
    committedFiles: [],
    commits: [],
    mergeChanges: {
      mergedNewFiles: [],
      mergedUpdatedFiles: [],
      mergedDeletedFiles: []
    },
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
    initialise ({ state, commit, getters, dispatch }) {
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
        commit('setCommits', commits)
        if (localStorage.getItem('commitUuid')) {
          const uuid = localStorage.getItem('commitUuid')
          state.db.commits.where({ uuid }).first(com => {
            if (com.parentBranch === undefined) {
              const currentBranch = {
                parentBranch: '/',
                branch: 'main',
                uuid: ''
              }
              commit('setCurrentBranch', currentBranch)
            } else {
              const currentBranch = {
                parentBranch: com.parentBranch,
                branch: com.branch,
                uuid
              }
              commit('setCurrentBranch', currentBranch)
            }
          })
        } else {
          const currentBranch = {
            parentBranch: '/',
            branch: 'main',
            uuid: ''
          }
          commit('setCurrentBranch', currentBranch)
        }
      })

      state.socket.on('TERMINAL_STDOUT', data => {
        // console.log('TERMINAL_STDOUT', data)
        commit('stdOutMessage', data)
      })
      state.socket.on('TERMINAL_ERROR', data => {
        // console.log('TERMINAL_ERROR', data)
        commit('stdOutMessage', data)
      })
      state.socket.on('TERMINAL_EXIT', data => {
        // console.log('TERMINAL_EXIT', data)
        commit('stdOutMessage', data)
      })

      state.socket.on('GET_STATUS', file => {
        commit('stdOutMessage', `${file.parentDir}${file.name}`)
        if (file.parentDir === `/${state.applicationName}/commits/`) {
          const savedCommit = JSON.parse(file.content)
          state.db.commits.put(savedCommit)
        } else {
          state.db.currentFiles.put(file)
        }
      })
      state.socket.on('GET_STATUS_ERROR', data => {
        console.log('GET_STATUS_ERROR', data)
      })
      state.socket.on('GET_STATUS_EXIT', () => {
        console.log('GET_STATUS_EXIT')
        state.db.currentFiles.toArray(currentFiles => {
          commit('currentFiles', currentFiles)
          const branchCommits = getters.branchCommits
          if (branchCommits[0]) {
            localStorage.setItem('commitUuid', branchCommits[0].uuid)
          } else {
            localStorage.removeItem('commitUuid')
          }
          state.db.committedFiles.clear()
          commit('committedFiles', [])
          let branchFiles = []
          branchCommits.forEach(bc => {
            bc.newFiles.forEach(file => {
              const keyFile = { ...file, key: `${file.parentDir}${file.name}` }
              branchFiles.push(keyFile)
            })
            bc.updatedFiles.forEach(update => {
              const fileToUpdate = branchFiles.find(file => file.key === `${update.parentDir}${update.name}`)
              const dmp = new DiffMatchPatch()
              const patches = dmp.patch_fromText(update.patch)
              const result = dmp.patch_apply(patches, fileToUpdate.content)
              fileToUpdate.content = result[0]
            })
            bc.deletedFiles.forEach(deleteFile => {
              branchFiles = branchFiles.filter(file => file.key !== `${deleteFile.parentDir}${deleteFile.name}`)
            })
          })
          branchFiles.forEach(file => delete file.key)
          state.db.committedFiles.bulkPut(branchFiles)
          commit('committedFiles', branchFiles)
          commit('incrementTreeRefreshKey')
          commit('stdOutMessage', 'GET_STATUS calculating changes')
          dispatch('getDnaPaths')
          dispatch('getCurrentChanges')
          dispatch('getMergeTargetChanges')
        })
      })

      state.socket.on('LINT_FILES_EXIT', data => {
        console.log('LINT_FILES_EXIT', data)
        commit('stdOutMessage', 'LINT_FILES_EXIT')
        dispatch('refreshOpenFiles')
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

      state.socket.emit('IS_CONDUCTOR_RUNNING')
      state.socket.on('CONDUCTOR_RUNNING', data => {
        if (data) {
          commit('conductorRunning', true)
          AdminWebsocket.connect(HOLOCHAIN_ADMIN_SOCKET_DOCKER_URL, 10000).then(admin => {
            state.hcAdmin = admin
            state.hcClient.port = HOLOCHAIN_APP_INTERFACE_DOCKER_PORT
          })
          commit('conductorMessage', 'Reconnected')
        } else {
          commit('conductorRunning', false)
        }
      })
      state.socket.on('CONDUCTOR_STDOUT', data => {
        console.log('CONDUCTOR_STDOUT', data)
        if (data.includes('Conductor ready')) {
          commit('conductorRunning', true)
          AdminWebsocket.connect(HOLOCHAIN_ADMIN_SOCKET_DOCKER_URL, 10000).then(admin => {
            state.hcAdmin = admin
            console.log('🚀 ~ file: builder.store.js ~ line 212 ~ AdminWebsocket.connect ~ admin', admin)
            state.hcAdmin.attachAppInterface({ port: HOLOCHAIN_APP_INTERFACE_PORT }).then(() => {
              state.hcClient.port = HOLOCHAIN_APP_INTERFACE_DOCKER_PORT
            })
          })
        }
        commit('conductorMessage', data)
      })
      state.socket.on('CONDUCTOR_ERROR', data => {
        console.log('CONDUCTOR_ERROR', data)
        commit('conductorMessage', data)
        commit('conductorRunning', false)
      })
      state.socket.on('CONDUCTOR_EXIT', data => {
        console.log('CONDUCTOR_EXIT', data)
        commit('conductorRunning', false)
        commit('conductorMessage', 'CONDUCTOR_EXIT')
      })
      state.socket.on('CONDUCTOR_CLOSE', data => {
        console.log('CONDUCTOR_CLOSE', data)
        commit('conductorMessage', 'CONDUCTOR_CLOSE')
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
    getDnaEntryTypes ({ state, commit }) {
      state.db.currentFiles.toArray(entries => {
        entries.filter(f => f.parentDir === `/${state.applicationName}/dna/`).forEach(dnaPath => {
          const types = entries.filter(f => f.parentDir === `${dnaPath.parentDir}${dnaPath.name}/zomes/${dnaPath.name}/src/entries/`)
          types.forEach(et => {
            et.testPath = `/${state.applicationName}/dna/${et.parentDir.split('/')[3]}/tests/src/`
          })
          commit('setDnaEntryTypes', types)
        })
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
      state.db.currentFiles.clear().then(() => {
        state.db.currentFiles.put({
          parentDir: '/',
          name,
          type: 'dir'
        })
      })
      const name = payload.name
      const entryTypeToDuplicate = payload.entryTypeToDuplicate
      const newName = payload.newName
      state.socket.emit('RENAME_ENTRY_TYPE', { name, entryTypeToDuplicate, newName })
    },
    async duplicateEntryType ({ state }, payload) {
      const name = payload.name
      const entryTypeToDuplicate = payload.entryTypeToDuplicate
      const newName = payload.newName
      state.socket.emit('DUPLICATE_ENTRY_TYPE', { name, entryTypeToDuplicate, newName })
    },
    async createApplication ({ state, commit }, payload) {
      console.log(payload)
      const name = payload.name
      const preset = payload.preset
      state.db.committedFiles.clear()
      state.db.commits.clear()
      state.db.currentFiles.clear().then(() => {
        state.db.currentFiles.put({
          parentDir: '/',
          name,
          type: 'dir'
        })
        commit('setApplicationName', name)
        state.socket.emit('CREATE_APPLICATION', { name, preset })
      })
    },
    async createAppPluginFromTemplate ({ state, rootState, commit }, payload) {
      const applicationName = payload.name
      const product = payload.product
      console.log(rootState)
      const name = `vue-cli-plugin-${rootState.builderOrganisations.organisation.name}-app-${state.applicationName}`
      state.db.committedFiles.clear()
      state.db.commits.clear()
      state.db.currentFiles.clear().then(() => {
        state.db.currentFiles.put({
          parentDir: '/',
          name,
          type: 'dir'
        })
        commit('setApplicationName', name)
        state.socket.emit('CREATE_APP_PLUGIN', { applicationName, name, product })
      })
    },
    async createModulePluginFromTemplate ({ state, rootState, commit }, payload) {
      const applicationName = payload.name
      const product = payload.product
      console.log(rootState)
      const name = `vue-cli-plugin-${rootState.builderOrganisations.organisation.name}-module-${state.applicationName}`
      state.db.committedFiles.clear()
      state.db.commits.clear()
      state.db.currentFiles.clear().then(() => {
        state.db.currentFiles.put({
          parentDir: '/',
          name,
          type: 'dir'
        })
        commit('setApplicationName', name)
        state.socket.emit('CREATE_MODULE_PLUGIN', { applicationName, name, product })
      })
    },
    publishPlugin ({ state }, payload) {
      const name = payload.name
      state.socket.emit('PUBLISH_PLUGIN', { name })
    },
    async addModule ({ state }, payload) {
      const name = payload.name
      const plugin = payload.plugin
      state.socket.emit('ADD_MODULE', { name, plugin })
    },
    async reinstallNodeModules ({ state }, payload) {
      const name = payload.name
      state.socket.emit('REINSTALL_NODE_MODULES', { name })
    },
    getApplications ({ state, rootState, commit }) {
      const name = rootState.builderOrganisations.name
      state.socket.emit('GET_APPLICATIONS', { name }, (entries) => {
        commit('setApplications', entries)
      })
    },
    getPlugins ({ state, rootState, commit }) {
      const name = rootState.builderOrganisations.name
      state.socket.emit('GET_PLUGINS', { name }, (entries) => {
        console.log(entries)
        commit('setPlugins', entries)
      })
    },
    clearCommits ({ state, commit }) {
      state.db.commits.clear()
        .then(() => {
          commit('setCommits', [])
        })
      state.db.committedFiles.clear()
        .then(() => {
          commit('committedFiles', [])
        })
    },
    getStatus ({ state }, payload) {
      const name = payload.name
      state.db.currentFiles.clear().then(() => {
        state.db.currentFiles.put({
          parentDir: '/',
          name,
          type: 'dir'
        })
        state.socket.emit('GET_STATUS', { name })
      })
    },
    getCurrentChanges ({ state, commit }) {
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
            const dmp = new DiffMatchPatch()
            const patches = dmp.patch_make(lastCommitFile.content, file.content)
            const patch = dmp.patch_toText(patches)
            const update = { ...file }
            delete update.content
            update.patch = patch
            updatedFiles.push(update)
          }
        }
      })
      state.committedFiles.forEach(file => {
        const currentBranchFile = state.currentFiles.find(
          f => `${f.parentDir}${f.name}` === `${file.parentDir}${file.name}`
        )
        if (currentBranchFile === undefined) {
          delete file.content
          deletedFiles.push(file)
        }
      })
      commit('setCurrentChanges', {
        newFiles,
        updatedFiles,
        deletedFiles
      })
      commit('stdOutMessage', 'GET_STATUS finished calculating changes')
    },
    commitChanges ({ state, commit, dispatch }, payload) {
      const changes = state.currentChanges
      const message = payload.commitMessage
      const author = payload.author
      let type = 'commit'
      if (state.commits.length === 0) type = 'branch'
      const newCommit = {
        uuid: uuidv4(),
        branch: state.currentBranch.branch,
        parentBranch: state.currentBranch.parentBranch,
        type,
        message,
        author,
        timestamp: Date.now(),
        newFiles: changes.newFiles,
        updatedFiles: changes.updatedFiles,
        deletedFiles: changes.deletedFiles
      }
      state.socket.emit('COMMIT_CHANGES', { application: state.applicationName, commit: JSON.stringify(newCommit) })

      commit('addCommit', newCommit)
      localStorage.setItem('commitUuid', newCommit.uuid)
      state.db.commits.put(newCommit)
      state.db.committedFiles.clear()
      state.db.currentFiles.toArray(files => {
        state.db.committedFiles.bulkPut(files)
        commit('committedFiles', files)
      })
      commit('setCurrentChanges', {
        newFiles: [],
        updatedFiles: [],
        deletedFiles: []
      })
      dispatch('getMergeTargetChanges')
    },
    createBranch ({ state, commit }, payload) {
      const author = payload.author
      const newCommit = {
        uuid: uuidv4(),
        branch: payload.name,
        parentBranch: `${state.currentBranch.parentBranch}${state.currentBranch.branch}/`,
        type: 'branch',
        message: `New Branch ${payload.name}`,
        author,
        timestamp: Date.now(),
        newFiles: state.currentFiles,
        updatedFiles: [],
        deletedFiles: []
      }
      const currentBranch = {
        branch: newCommit.branch,
        parentBranch: newCommit.parentBranch,
        uuid: newCommit.uuid
      }
      localStorage.setItem('commitUuid', newCommit.uuid)
      commit('setCurrentBranch', currentBranch)
      commit('addCommit', newCommit)
      state.db.commits.put(newCommit)
      state.db.committedFiles.clear()
      state.db.currentFiles.toArray(files => {
        state.db.committedFiles.bulkPut(files)
        commit('committedFiles', files)
      })
    },
    changeBranch ({ state, commit, getters }, payload) {
      const currentBranch = payload
      localStorage.setItem('commitUuid', currentBranch.uuid)
      commit('setCurrentBranch', currentBranch)
      const branchCommits = getters.branchCommits
      state.db.currentFiles.clear()
      state.db.committedFiles.clear()
      commit('currentFiles', [])
      commit('committedFiles', [])
      let branchFiles = []
      branchCommits.forEach(bc => {
        bc.newFiles.forEach(file => {
          const keyFile = { ...file, key: `${file.parentDir}${file.name}` }
          branchFiles.push(keyFile)
        })
        bc.updatedFiles.forEach(update => {
          const fileToUpdate = branchFiles.find(file => file.key === `${update.parentDir}${update.name}`)
          const dmp = new DiffMatchPatch()
          const patches = dmp.patch_fromText(update.patch)
          const result = dmp.patch_apply(patches, fileToUpdate.content)
          fileToUpdate.content = result[0]
        })
        bc.deletedFiles.forEach(deleteFile => {
          branchFiles = branchFiles.filter(file => file.key !== `${deleteFile.parentDir}${deleteFile.name}`)
        })
      })
      branchFiles.forEach(file => delete file.key)
      state.db.currentFiles.bulkPut(branchFiles)
      state.db.committedFiles.bulkPut(branchFiles)
      commit('currentFiles', branchFiles)
      commit('committedFiles', branchFiles)
      state.socket.emit('CHANGE_BRANCH', { name: state.applicationName, files: branchFiles })
      commit('incrementTreeRefreshKey')
    },
    getMergeTargetChanges ({ state, commit }) {
      if (state.currentBranch === undefined) return
      const parentBranches = state.currentBranch.parentBranch.split('/')
      const mergeTargetBranch = parentBranches[parentBranches.length - 2]
      if (mergeTargetBranch === '') return
      const newFiles = []
      const updatedFiles = []
      const deletedFiles = []
      // get aggregated changes to current branch
      const firstCommit = state.commits.filter(commit => commit.branch === state.currentBranch.branch).find(commit => commit.type === 'branch')
      state.currentFiles.forEach(file => {
        file.key = `${file.parentDir}${file.name}`
        const firstCommitFile = firstCommit.newFiles.find(
          f => `${f.parentDir}${f.name}` === file.key
        )
        if (firstCommitFile === undefined) {
          newFiles.push(file)
        } else {
          if (file.content !== firstCommitFile.content) {
            const dmp = new DiffMatchPatch()
            const patches = dmp.patch_make(firstCommitFile.content, file.content)
            const patch = dmp.patch_toText(patches)
            const update = { ...file }
            delete update.content
            update.patch = patch
            updatedFiles.push(update)
          }
        }
      })
      firstCommit.newFiles.forEach(file => {
        const currentBranchFile = state.currentFiles.find(
          f => `${f.parentDir}${f.name}` === `${file.parentDir}${file.name}`
        )
        if (currentBranchFile === undefined) {
          file.key = `${file.parentDir}${file.name}`
          delete file.content
          deletedFiles.push(file)
        }
      })
      // get target branch
      const mergeTargetBranchCommits = state.commits.filter(commit => commit.branch === mergeTargetBranch).sort((a, b) => a.timestamp > b.timestamp)
      let mergeTargetBranchFiles = []
      mergeTargetBranchCommits.forEach(bc => {
        bc.newFiles.forEach(file => {
          const keyFile = { ...file, key: `${file.parentDir}${file.name}` }
          mergeTargetBranchFiles.push(keyFile)
        })
        bc.updatedFiles.forEach(update => {
          const fileToUpdate = mergeTargetBranchFiles.find(file => file.key === `${update.parentDir}${update.name}`)
          const dmp = new DiffMatchPatch()
          const patches = dmp.patch_fromText(update.patch)
          const result = dmp.patch_apply(patches, fileToUpdate.content)
          fileToUpdate.content = result[0]
        })
        bc.deletedFiles.forEach(deleteFile => {
          mergeTargetBranchFiles = mergeTargetBranchFiles.filter(file => file.key !== `${deleteFile.parentDir}${deleteFile.name}`)
        })
      })
      // test changes to merge target
      const mergedNewFiles = []
      const mergedUpdatedFiles = []
      let mergedDeletedFiles = []
      newFiles.forEach(newFile => {
        // check if newFile has been added to target branch
        const mergeFile = mergeTargetBranchFiles.find(
          f => `${f.parentDir}${f.name}` === newFile.key
        )
        if (mergeFile === undefined) {
          mergedNewFiles.push(newFile)
        } else {
          if (newFile.content !== mergeFile.content) {
            updatedFiles.push(newFile)
          }
        }
      })
      updatedFiles.forEach(updatedFile => {
        const mergeFile = mergeTargetBranchFiles.find(
          f => `${f.parentDir}${f.name}` === updatedFile.key
        )
        if (mergeFile === undefined) {
          mergedDeletedFiles.push(updatedFile)
        } else {
          if (updatedFile.content !== mergeFile.content) {
            const dmp = new DiffMatchPatch()
            const patches = dmp.patch_fromText(updatedFile.patch)
            const result = dmp.patch_apply(patches, mergeFile.content)
            mergeFile.content = result[0]
            mergeFile.patchOk = result[1]
            mergedUpdatedFiles.push(mergeFile)
          }
        }
      })
      mergedDeletedFiles = deletedFiles
      commit('setMergeChanges', {
        mergedNewFiles,
        mergedUpdatedFiles,
        mergedDeletedFiles
      })
      commit('stdOutMessage', 'GET_STATUS finished calculating merge')
    },
    mergeBranch ({ state, commit, dispatch }, payload) {
      const message = payload.mergeMessage
      const author = payload.author
      const type = 'merge'
      const parentBranches = state.currentBranch.parentBranch.split('/')
      const mergeTargetBranch = parentBranches[parentBranches.length - 2]
      const newCommit = {
        uuid: uuidv4(),
        branch: mergeTargetBranch,
        parentBranch: `${state.currentBranch.parentBranch}${state.currentBranch.branch}`,
        type,
        message,
        author,
        timestamp: Date.now(),
        newFiles: state.mergeChanges.mergedNewFiles,
        updatedFiles: state.mergeChanges.mergedUpdatedFiles,
        deletedFiles: state.mergeChanges.mergedDeletedFiles
      }
      commit('addCommit', newCommit)
      localStorage.setItem('commitUuid', newCommit.uuid)
      state.db.commits.put(newCommit)
      let targetBranch = {
        parentBranch: '/',
        branch: 'main',
        uuid: newCommit.uuid
      }
      if (mergeTargetBranch !== 'main') {
        const targetBranchName = parentBranches[parentBranches.length - 4]
        targetBranch = state.commits.filter(commit => commit.type === 'branch').find(commit => commit.branch === targetBranchName)
      }
      commit('setMergeChanges', {
        mergedNewFiles: [],
        mergedUpdatedFiles: [],
        mergedDeletedFiles: []
      })
      dispatch('changeBranch', targetBranch)
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
    refreshOpenFiles ({ state, commit }) {
      console.log('refreshOpenFiles')
      state.openFiles.map(oF => {
        state.db.currentFiles
          .where('[parentDir+name]')
          .equals([oF.parentDir, oF.name])
          .first()
          .then(file => {
            console.log(file)
            commit('updateOpenFile', file)
          })
      })
    },
    async startWebServer ({ state, commit }, payload) {
      const name = payload.name
      commit('clearAppServerMessages')
      commit('appServerMessage', 'START_WEB_SERVER')
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
    async resetConductor ({ state, commit }) {
      state.socket.emit('RESET_CONDUCTOR')
      state.db.agents
        .where('parent')
        .equals(state.conductor.uuid)
        .toArray(agents => {
          agents.forEach(agent => {
            delete agent.agentPubKey
            delete agent.cellData
            state.db.agents.put(agent)
          })
          commit('setAgents', agents)
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
      const webPartType = payload.webPartType
      const template = payload.template
      const name = payload.name
      const webPartName = payload.webPartName
      state.socket.emit('CLONE_WEB_PART', { webPartType, template, name, webPartName })
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
    saveOpenImage ({ state, commit }, payload) {
      console.log(payload)
      const file = payload.file
      const fileToUpload = payload.fileToUpload
      var reader = new FileReader()
      var rawData = new ArrayBuffer()
      reader.onload = function (e) {
        rawData = e.target.result
        state.socket.emit('SAVE_UPLOADED_IMAGE', {
          name: file.name,
          parentDir: file.parentDir,
          data: rawData
        }, (result) => {
          console.log(result)
          const updatedImageFile = {
            parentDir: result.parentDir,
            name: result.name,
            content: result.content,
            encoding: result.encoding,
            extension: result.extension,
            type: 'file'
          }
          state.db.currentFiles.put(updatedImageFile)
          commit('updateOpenFile', updatedImageFile)
        })
        console.log('Image content read.')
      }
      reader.readAsArrayBuffer(fileToUpload)
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
    installDna ({ state, rootState, commit }, payload) {
      console.log(payload)
      const dnas = []
      payload.dnaPaths.forEach(dna => {
        dnas.push({
          path: `../../builder-organisations/${rootState.builderOrganisations.organisation.name}/applications/${dna.parentDir}${dna.name}/${dna.name}.dna.gz`,
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
    branches: state => {
      if (state.commits.length === 0) {
        return [
          {
            parentBranch: '/',
            branch: 'main',
            uuid: ''
          }
        ]
      } else {
        const branchCommits = state.commits.filter(commit => commit.type === 'branch').sort((a, b) => a.timestamp > b.timestamp)
        return branchCommits.map(bc => (
          {
            parentBranch: bc.parentBranch,
            branch: bc.branch,
            uuid: bc.uuid
          }
        ))
      }
    },
    branchCommits: state => {
      return state.commits.filter(commit => commit.branch === state.currentBranch.branch).sort((a, b) => a.timestamp > b.timestamp)
    }
  },
  mutations: {
    setApplications (state, payload) {
      state.applications = payload
    },
    setApplicationName (state, payload) {
      state.applicationName = payload
    },
    setPlugins (state, payload) {
      state.plugins = payload
    },
    treeItems (state, payload) {
      state.treeItems = payload
      if (payload.length > 0) state.applicationName = payload[0].name
    },
    setCurrentBranch (state, payload) {
      state.currentBranch = payload
    },
    currentFiles (state, payload) {
      state.currentFiles = payload
    },
    addCurrentFiles (state, payload) {
      payload.forEach(file => state.currentFiles.push(file))
    },
    updateCurrentFile (state, payload) {
      state.currentFiles = state.currentFiles.map(file =>
        `${file.parentDir}/${file.name}` !==
        `${payload.parentDir}/${payload.name}`
          ? file
          : { ...file, ...payload }
      )
    },
    setCurrentChanges (state, payload) {
      state.currentChanges = payload
    },
    committedFiles (state, payload) {
      state.committedFiles = payload
    },
    setCommits (state, payload) {
      state.commits = payload
    },
    addCommit (state, payload) {
      state.commits.push(payload)
    },
    setMergeChanges (state, payload) {
      state.mergeChanges = payload
    },
    incrementTreeRefreshKey (state) {
      state.treeRefreshKey++
    },
    dnaPaths (state, payload) {
      state.dnaPaths = payload
    },
    setDnaEntryTypes (state, payload) {
      state.dnaEntryTypes = payload
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
      if (payload === 'START_WEB_SERVER') state.appServerRunning = true
      if (payload === 'SERVE_WEB_APP_EXIT') state.appServerRunning = false
    },
    clearConductorMessages (state) {
      state.conductorMessages = []
    },
    conductorMessage (state, payload) {
      state.conductorMessages.push(payload)
    },
    conductorRunning (state, payload) {
      state.conductorRunning = payload
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
    updateOpenFile (state, payload) {
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
    closeOpenFiles (state) {
      state.openFiles = []
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
