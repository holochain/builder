<template>
  <v-card width="100%" tile flat class="pa-0 ma-0">
    <v-system-bar window dark>
      <v-icon>mdi-source-repository</v-icon>
      Current Branch ->
      <v-combobox
        :value="currentBranch"
        :disabled="!readyToBranch"
        return-object
        :items="branches"
        item-text="branch"
        item-value="uuid"
        @change="changeBranch"
        hide-details
        dense
        flat
        solo-inverted
        class="pa-0 mt-0 ml-2"
      />
      <v-spacer></v-spacer>
      <v-icon @click="$emit('close')">
        mdi-close-box-outline
      </v-icon>
    </v-system-bar>
    <v-tabs
      v-model="fileshareTab"
      dark
      show-arrows
      height="40"
      ripple
    >
      <v-tabs-slider></v-tabs-slider>
      <v-tab>
        Branch Graph
        <v-icon @click="terminalTab = 1;lintFiles({ name: applicationName })">
          mdi-source-branch
        </v-icon>
      </v-tab>
      <v-tab-item key="graphTab">
        <v-card
          v-if="currentBranch"
          class="tab-card ma-0 pa-0"
          flat
          tile
          dark
        >
          <v-card
            :id="`gitgraphcard${treeRefreshKey}`"
            class="graph-container mb-2"
            :key="treeRefreshKey"
            dark
          >
          </v-card>
          <v-card-text class="pb-0">
            <v-text-field
              :disabled="!readyToBranch"
              class="title pb-0"
              v-model="newBranchName"
              label="New Branch Name"
              append-icon="mdi-source-branch"
              click:append="newBranch"
              @keydown.enter="newBranch"
              outlined
              dense
              persistent-hint
              :hint="branchHint"
            />
          </v-card-text>
        </v-card>
      </v-tab-item>
      <v-tab>
        Commits
        <v-icon>
          mdi-source-commit
        </v-icon>
      </v-tab>
      <v-tab-item key="commitsTab">
        <v-card
          v-if="currentBranch"
          width="100%"
          class="tab-card pa-0"
          dark
          flat
          tile
        >
          <v-card-title>Commits to {{ currentBranch.branch }} branch</v-card-title>
          <v-card-text>
            <v-expansion-panels>
              <v-expansion-panel
                v-for="(commit, index) in branchCommits"
                :key="index"
              >
                <v-expansion-panel-header disable-icon-rotate>
                    {{ commit.message }}
                  <template v-slot:actions>
                    <v-icon>mdi-details</v-icon>
                  </template>
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                  <v-card flat>
                    <v-row no-gutters class="commit-list fill-height">
                      <v-col cols="4">
                        <v-list dense dark>
                          <v-list-item-title class="text-center font-weight-bold">Added</v-list-item-title>
                          <v-list-item v-for="(file, index) in commit.newFiles" :key="index" class="pa-0 pl-1">
                            <v-list-item-icon>
                              <v-icon v-if="file.type === 'file'">
                                {{fileTypes[file.extension]}}
                              </v-icon>
                              <v-icon v-else>
                                mdi-folder-outline
                              </v-icon>
                            </v-list-item-icon>
                            <v-list-item-title>{{ fileName(file) }}</v-list-item-title>
                          </v-list-item>
                        </v-list>
                      </v-col>
                      <v-col cols="4">
                        <v-list dense dark>
                          <v-list-item-title class="text-center font-weight-bold">Updated</v-list-item-title>
                          <v-list-item v-for="(file, index) in commit.updatedFiles" :key="index" class="pa-0 pl-1">
                            <v-list-item-icon>
                              <v-icon v-if="file.type === 'file'">
                                {{fileTypes[file.extension]}}
                              </v-icon>
                              <v-icon v-else>
                                mdi-folder-outline
                              </v-icon>
                            </v-list-item-icon>
                            <v-list-item-title>{{ fileName(file) }}</v-list-item-title>
                          </v-list-item>
                        </v-list>
                      </v-col>
                      <v-col cols="4">
                        <v-list dense dark>
                          <v-list-item-title class="text-center font-weight-bold">Deleted</v-list-item-title>
                          <v-list-item v-for="(file, index) in commit.deletedFiles" :key="index" class="pa-0 pl-1">
                            <v-list-item-icon>
                              <v-icon v-if="file.type === 'file'">
                                {{fileTypes[file.extension]}}
                              </v-icon>
                              <v-icon v-else>
                                mdi-folder-outline
                              </v-icon>
                            </v-list-item-icon>
                            <v-list-item-title>{{ fileName(file) }}</v-list-item-title>
                          </v-list-item>
                        </v-list>
                      </v-col>
                    </v-row>
                    <v-card-actions>
                      <v-text-field
                        class="title"
                        v-model="newBranchName"
                        label="New Branch From This Commit"
                        append-icon="mdi-source-branch"
                        @click:append="newBranchFromCommit(commit)"
                        @keydown.enter="newBranchFromCommit(commit)"
                        outlined
                        dense
                      />
                    </v-card-actions>
                  </v-card>
                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-card-text>
        </v-card>
      </v-tab-item>
      <v-tab>
        Changes
        <v-icon>
          mdi-delta
        </v-icon>
      </v-tab>
      <v-tab-item key="changesTab">
        <v-card
          v-if="currentBranch"
          width="100%"
          class="tab-card pa-0"
          dark
          flat
          tile
        >
          <v-card-title v-if="initialCommit">
            Initial changes to {{ currentBranch.branch }} branch
            <v-spacer></v-spacer>
            <v-icon @click="uncommittedDetails = !uncommittedDetails">
              mdi-details
            </v-icon>
          </v-card-title>
          <v-card-title v-else class="pr-6">
            <span v-if="readyToBranch">No uncommitted changes to {{ currentBranch.branch }} branch</span><span v-else>Changes to {{ currentBranch.branch }} branch</span>
            <v-spacer></v-spacer>
            <v-icon @click="uncommittedDetails = !uncommittedDetails">
              mdi-details
            </v-icon>
          </v-card-title>
          <v-card-text>
            <v-row
              v-show="uncommittedDetails"
              justify="center"
              no-gutters
            >
              <v-col cols="4">
                <v-list dense dark>
                  <v-list-item-title class="text-center font-weight-bold">Added</v-list-item-title>
                  <v-list-item v-for="(file, index) in currentChanges.newFiles" :key="index" class="pa-0 pl-1">
                    <v-list-item-icon>
                      <v-icon v-if="file.type === 'file'">
                        {{fileTypes[file.extension]}}
                      </v-icon>
                      <v-icon v-else>
                        mdi-folder-outline
                      </v-icon>
                    </v-list-item-icon>
                    <v-list-item-title>{{ fileName(file) }}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-col>
              <v-col cols="4">
                <v-list dense dark>
                  <v-list-item-title class="text-center font-weight-bold">Updated</v-list-item-title>
                  <v-list-item v-for="(file, index) in currentChanges.updatedFiles" :key="index" class="pa-0 pl-1">
                    <v-list-item-icon>
                      <v-icon v-if="file.type === 'file'">
                        {{fileTypes[file.extension]}}
                      </v-icon>
                      <v-icon v-else>
                        mdi-folder-outline
                      </v-icon>
                    </v-list-item-icon>
                    <v-list-item-title>{{ fileName(file) }}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-col>
              <v-col cols="4">
                <v-list dense dark>
                  <v-list-item-title class="text-center font-weight-bold">Deleted</v-list-item-title>
                  <v-list-item v-for="(file, index) in currentChanges.deletedFiles" :key="index" class="pa-0 pl-1">
                    <v-list-item-icon class="mr-0">
                      <v-icon v-if="file.type === 'file'">
                        {{fileTypes[file.extension]}}
                      </v-icon>
                      <v-icon v-else>
                        mdi-folder-outline
                      </v-icon>
                    </v-list-item-icon>
                    <v-list-item-title>{{ fileName(file) }}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-text>
            <v-row height="100%" no-gutters>
              <v-col cols="12" class="pl-4 pr-4">
                <v-textarea
                  v-if="!readyToBranch"
                  v-model="commitMessage"
                  label="Commit Message"
                  append-icon="mdi-source-commit"
                  @click:append="commit"
                  @keydown.enter="commit"
                  outlined
                  dense
                  persistent-hint
                  :hint="`Commit changes to ${currentBranch.branch}`"
                />
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              v-if="commitMessage !== ''"
              color="action darken-1"
              text
              @click="commit"
            >
              Commit
            </v-btn>
            <v-btn
              v-if="readyToMerge && mergeMessage !== ''"
              color="action darken-1"
              text
              @click="merge"
            >
              Merge
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-tab-item>
      <v-tab>
        Merge
        <v-icon>
          mdi-source-merge
        </v-icon>
      </v-tab>
      <v-tab-item key="mergeTab">
        <v-card
          v-if="currentBranch"
          width="100%"
          class="tab-card pa-0"
          dark
          flat
          tile
        >
          <v-card-title class="pr-6">
            <span v-if="readyToMerge">Merge changes to {{ currentBranch.parentBranch }} branch</span>
            <v-spacer></v-spacer>
            <v-icon @click="unmergedDetails = !unmergedDetails">
              mdi-details
            </v-icon>
          </v-card-title>
          <v-card-text>
            <v-row
              v-show="unmergedDetails"
              justify="center"
              no-gutters
            >
              <v-col cols="4">
                <v-list dense dark>
                  <v-list-item-title class="text-center font-weight-bold">Add</v-list-item-title>
                  <v-list-item v-for="(file, index) in mergeChanges.mergedNewFiles" :key="index" class="pa-0 pl-1">
                    <v-list-item-icon>
                      <v-icon v-if="file.type === 'file'">
                        {{fileTypes[file.extension]}}
                      </v-icon>
                      <v-icon v-else>
                        mdi-folder-outline
                      </v-icon>
                    </v-list-item-icon>
                    <v-list-item-title>{{ fileName(file) }}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-col>
              <v-col cols="4">
                <v-list dense dark>
                  <v-list-item-title class="text-center font-weight-bold">Update</v-list-item-title>
                  <v-list-item v-for="(file, index) in mergeChanges.mergedUpdatedFiles" :key="index" class="pa-0 pl-1">
                    <v-list-item-icon>
                      <v-icon v-if="file.patchOk">
                        mdi-check-circle-outline
                      </v-icon>
                      <v-icon v-else color="warning">
                        mdi-folder-outline
                      </v-icon>
                    </v-list-item-icon>
                    <v-list-item-title>{{ fileName(file) }}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-col>
              <v-col cols="4">
                <v-list dense dark>
                  <v-list-item-title class="text-center font-weight-bold">Delete</v-list-item-title>
                  <v-list-item v-for="(file, index) in mergeChanges.mergedDeletedFiles" :key="index" class="pa-0 pl-1">
                    <v-list-item-icon class="mr-0">
                      <v-icon v-if="file.type === 'file'">
                        {{fileTypes[file.extension]}}
                      </v-icon>
                      <v-icon v-else>
                        mdi-folder-outline
                      </v-icon>
                    </v-list-item-icon>
                    <v-list-item-title>{{ fileName(file) }}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-text>
            <v-row height="100%" no-gutters>
              <v-col cols="12" class="pl-4 pr-4">
                <v-textarea
                  v-if="readyToMerge"
                  v-model="mergeMessage"
                  label="Merge Message"
                  append-icon="mdi-source-merge"
                  @click:append="merge"
                  @keydown.enter="merge"
                  outlined
                  dense
                  persistent-hint
                  :hint="mergeHint"
                />
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              v-if="readyToMerge && mergeMessage !== ''"
              color="action darken-1"
              text
              @click="merge"
            >
              Merge
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-tab-item>
    </v-tabs>
  </v-card>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex'
import { createGitgraph } from '@gitgraph/js'
export default {
  name: 'FileSharing',
  props: [],
  data () {
    return {
      showChanges: false,
      author: 'Philip Beadle',
      newBranchName: '',
      commitMessage: '',
      mergeMessage: '',
      uncommittedDetails: false,
      unmergedDetails: false,
      fileshareTab: null
    }
  },
  computed: {
    ...mapState('builder', ['currentBranch', 'currentFiles', 'currentChanges', 'committedFiles', 'commits', 'mergeChanges', 'fileTypes', 'treeRefreshKey']),
    ...mapGetters('builder', ['branchCommits']),
    branches () {
      return this.$store.getters['builder/branches']
    },
    initialCommit () {
      if (this.commits.length === 0) return true
      return false
    },
    readyToBranch () {
      if (
        this.currentChanges.newFiles
          .concat(this.currentChanges.updatedFiles)
          .concat(this.currentChanges.deletedFiles).length === 0
      ) {
        return true
      } else {
        return false
      }
    },
    readyToMerge () {
      if (this.currentBranch.branch === 'main') return false
      if (
        this.currentChanges.newFiles
          .concat(this.currentChanges.updatedFiles)
          .concat(this.currentChanges.deletedFiles).length === 0
      ) {
        return true
      } else {
        return false
      }
    },
    mergeHint () {
      if (this.readyToMerge) { return `Ready to merge ${this.currentBranch.branch} into ${this.currentBranch.parentBranch}` }
      return 'Cannot merge with uncommitted changes.'
    },
    branchHint () {
      if (this.readyToBranch) { return `Ready to create a new branch from ${this.currentBranch.branch}` }
      return 'Cannot branch with uncommitted changes.'
    }
  },
  methods: {
    ...mapActions('builder', ['commitChanges', 'createBranch', 'mergeBranch', 'changeBranch']),
    fileName (file) {
      let filePath = `${file.parentDir}${file.name}`
      if (filePath.length > 30) {
        filePath = `...${filePath.slice(-27)}`
      }
      return filePath
    },
    getFormattedTimestamp (timestamp) {
      const commitDate = new Date(timestamp)
      return `${commitDate.getFullYear()}.${(commitDate.getMonth() + 1)}.${commitDate.getDate()}:${commitDate.getHours()}:${commitDate.getMinutes()}`
    },
    showBranchGraph () {
      process.nextTick(() => {
        const graphContainer = document.getElementById(`gitgraphcard${this.treeRefreshKey}`)
        const gitgraph = createGitgraph(graphContainer)
        console.log('🚀 ~ file: FileSharing.vue ~ line 484 ~ process.nextTick ~ gitgraph', gitgraph)
        let graphBranch
        if (this.commits.length === 0) {
          graphBranch = gitgraph
            .branch('main')
            .commit({
              subject: `New Repository - ${this.author} - ${this.getFormattedTimestamp(Date.now())}`,
              style: {
                message: {
                  displayHash: false,
                  displayAuthor: false
                }
              }
            })
        } else {
          this.commits.sort((a, b) => a.timestamp - b.timestamp).forEach(commit => {
            const parentBranchParts = commit.parentBranch.split('/')
            const parentBranchName = parentBranchParts[parentBranchParts.length - 2]
            if (commit.type === 'branch') {
              if (commit.branch === 'main') {
                graphBranch = gitgraph
                  .branch('main')
                  .commit({
                    subject: `New Repository - ${commit.author} - ${this.getFormattedTimestamp(commit.timestamp)}`,
                    style: {
                      message: {
                        displayHash: false,
                        displayAuthor: false
                      }
                    }
                  })
              } else {
                graphBranch = gitgraph
                  .branch(parentBranchName)
                  .branch(commit.branch)
                  .commit({
                    subject: `Branched ${commit.branch} from ${parentBranchName} - ${commit.author} - ${this.getFormattedTimestamp(commit.timestamp)}`,
                    style: {
                      message: {
                        displayHash: false,
                        displayAuthor: false
                      }
                    }
                  })
              }
            } else if (commit.type === 'commit') {
              graphBranch.commit({
                subject: `${commit.message.substring(0, 50)} - ${commit.author} - ${this.getFormattedTimestamp(commit.timestamp)}`,
                style: {
                  message: {
                    displayHash: false,
                    displayAuthor: false
                  }
                }
              })
            } else {
              gitgraph.branch(parentBranchName).merge({
                branch: graphBranch,
                fastForward: false,
                commitOptions: {
                  subject: `${commit.message} - ${commit.author} - ${this.getFormattedTimestamp(commit.timestamp)}`,
                  style: {
                    message: {
                      displayHash: false,
                      displayAuthor: false
                    }
                  }
                }
              })
            }
          })
        }
      })
    },
    newBranch () {
      this.createBranch({ name: this.newBranchName, author: this.author })
      this.newBranchName = ''
    },
    newBranchFromCommit (commit) {
      console.log(commit)
      // this.createBranch({ name: this.newBranchName })
      this.newBranchName = ''
    },
    commit () {
      if (this.commitMessage !== '') {
        this.commitChanges({ commitMessage: this.commitMessage, author: this.author })
        this.commitMessage = ''
      }
    },
    merge () {
      if (this.mergeMessage !== '') {
        this.mergeBranch({ mergeMessage: this.mergeMessage, author: this.author })
        this.mergeMessage = ''
      }
    }
  },
  watch: {
    currentBranch () {
      this.showBranchGraph()
    },
    treeRefreshKey () {
      this.showBranchGraph()
    }
  }
}
</script>
<style scoped>
.tab-card {
  box-sizing: border-box;
  overflow-y: auto;
  height: calc(100vh - 71px);
}
.graph-container {
  box-sizing: border-box;
  overflow-y: auto;
  height: 78vh;
}
.commit-list {
  box-sizing: border-box;
  overflow-y: auto;
  height: 80vh;
}
ul {
  list-style-type: none;
}
.foreignObject {
  padding-top: 3px;
  display: block;
  overflow: hidden;
  overflow-x: hidden;
  overflow-y: hidden;
}
</style>
