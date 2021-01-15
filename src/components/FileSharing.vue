<template>
    <v-card height="100%" width="100%" tile flat class="pa-0 ma-0">
      <v-system-bar window dark>
        <v-icon>mdi-source-repository</v-icon>
        Current Branch ->
        <v-combobox
            :items="branches"
            item-text="branch"
            item-value="uuid"
            hide-details
            dense
            class="mt-0 ml-2"
          >
        </v-combobox>
        <v-spacer></v-spacer>
        <v-icon v-if="!showChanges" @click="showChanges = true"
          >mdi-source-commit</v-icon
        >
        <v-icon v-if="showChanges" @click="showBranchGraph"
          >mdi-source-branch</v-icon
        >
        <v-icon>mdi-sync</v-icon>
        <v-icon @click="$emit('close')"
          >mdi-close-box-outline</v-icon
        >
      </v-system-bar>
      <v-row no-gutters v-if="currentBranch">
        <v-col>
          <v-card
            v-if="!showChanges"
            class="ma-0 pl-2 pr-2 fill-height"
            flat
            tile
            dark
          >
            <v-card
              id="gitgraphcard"
              key="gitgraphcard"
              class="mx-0"
              height="86vh"
              dark
            >
            </v-card>
            <v-text-field
              :disabled="!readyToBranch"
              class="title"
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
          </v-card>
          <v-card
            v-if="showChanges"
            height="100%"
            width="100%"
            class="pa-2"
            dark
            flat
            tile
          >
            <v-card-text class="grow">
              <v-card-title>Commits to {{ currentBranch.branch }} branch</v-card-title>
              <v-expansion-panels>
                <v-expansion-panel
                  v-for="(commit, index) in commits"
                  :key="index"
                >
                  <v-expansion-panel-header disable-icon-rotate>
                    {{ commit.message }}
                    <template v-slot:actions>
                      <v-icon>mdi-details</v-icon>
                    </template>
                  </v-expansion-panel-header>
                  <v-expansion-panel-content>
                    <v-row no-gutters class="fill-height" justify="center">
                      <v-col cols="4">
                        <v-list dense dark>
                          <v-list-item-title class="text-center font-weight-bold">Added</v-list-item-title>
                          <v-list-item v-for="(file, index) in commit.newFiles" :key="index">
                            <v-list-item-icon>
                              <v-icon v-if="file.type === 'file'">
                                {{fileTypes[file.extension]}}
                              </v-icon>
                              <v-icon v-else>
                                mdi-folder-outline
                              </v-icon>
                            </v-list-item-icon>
                            <v-list-item-title>{{ file.name }}</v-list-item-title>
                          </v-list-item>
                        </v-list>
                      </v-col>
                      <v-col cols="4">
                        <v-list dense dark>
                          <v-list-item-title class="text-center font-weight-bold">Updated</v-list-item-title>
                          <v-list-item v-for="(file, index) in commit.updatedFiles" :key="index">
                            <v-list-item-icon>
                              <v-icon v-if="file.type === 'file'">
                                {{fileTypes[file.extension]}}
                              </v-icon>
                              <v-icon v-else>
                                mdi-folder-outline
                              </v-icon>
                            </v-list-item-icon>
                            <v-list-item-title>{{ `${file.parentDir}${file.name}` }}</v-list-item-title>
                          </v-list-item>
                        </v-list>
                      </v-col>
                      <v-col cols="4">
                        <v-list dense dark>
                          <v-list-item-title class="text-center font-weight-bold">Deleted</v-list-item-title>
                          <v-list-item v-for="(file, index) in commit.deletedFiles" :key="index">
                            <v-list-item-icon>
                              <v-icon v-if="file.type === 'file'">
                                {{fileTypes[file.extension]}}
                              </v-icon>
                              <v-icon v-else>
                                mdi-folder-outline
                              </v-icon>
                            </v-list-item-icon>
                            <v-list-item-title>{{ `${file.parentDir}${file.name}` }}</v-list-item-title>
                          </v-list-item>
                        </v-list>
                      </v-col>
                    </v-row>
                  </v-expansion-panel-content>
                </v-expansion-panel>
              </v-expansion-panels>
              <v-card-title v-if="initialCommit">
                Initial changes to {{ currentBranch.branch }} branch
                <v-spacer></v-spacer>
                <v-icon @click="uncommittedDetails = !uncommittedDetails">
                  mdi-details
                </v-icon>
              </v-card-title>
              <v-card-title v-else class="pr-6">
                Uncommitted changes to {{ currentBranch.branch }} branch
                <v-spacer></v-spacer>
                <v-icon @click="uncommittedDetails = !uncommittedDetails">
                  mdi-details
                </v-icon>
              </v-card-title>
              <v-row
                v-show="uncommittedDetails"
                class="mx-0 pl-5 pr-5"
                justify="center"
              >
                <v-col cols="4">
                  <v-list dense dark>
                    <v-list-item-title class="text-center font-weight-bold">Added</v-list-item-title>
                    <v-list-item v-for="(file, index) in changes.newFiles" :key="index">
                      <v-list-item-icon>
                        <v-icon v-if="file.type === 'file'">
                          {{fileTypes[file.extension]}}
                        </v-icon>
                        <v-icon v-else>
                          mdi-folder-outline
                        </v-icon>
                      </v-list-item-icon>
                      <v-list-item-title>{{ `${file.parentDir}${file.name}` }}</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-col>
                <v-col cols="4">
                  <v-list dense dark>
                    <v-list-item-title class="text-center font-weight-bold">Updated</v-list-item-title>
                    <v-list-item v-for="(file, index) in changes.updatedFiles" :key="index">
                      <v-list-item-icon>
                        <v-icon v-if="file.type === 'file'">
                          {{fileTypes[file.extension]}}
                        </v-icon>
                        <v-icon v-else>
                          mdi-folder-outline
                        </v-icon>
                      </v-list-item-icon>
                      <v-list-item-title>{{ `${file.parentDir}${file.name}` }}</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-col>
                <v-col cols="4">
                  <v-list dense dark>
                    <v-list-item-title class="text-center font-weight-bold">Deleted</v-list-item-title>
                    <v-list-item v-for="(file, index) in changes.deletedFiles" :key="index">
                      <v-list-item-icon>
                        <v-icon v-if="file.type === 'file'">
                          {{fileTypes[file.extension]}}
                        </v-icon>
                        <v-icon v-else>
                          mdi-folder-outline
                        </v-icon>
                      </v-list-item-icon>
                      <v-list-item-title>{{ `${file.parentDir}${file.name}` }}</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-col>
              </v-row>
            </v-card-text>
            <v-card-text>
              <v-row height="100%" no-gutters align="end" justify="center">
                <v-col cols="12">
                  <v-textarea
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
        </v-col>
      </v-row>
    </v-card>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { createGitgraph } from '@gitgraph/js'
export default {
  name: 'FileSharing',
  props: [],
  data () {
    return {
      showChanges: false,
      newBranchName: '',
      commitMessage: '',
      mergeMessage: '',
      uncommittedDetails: false
    }
  },
  computed: {
    ...mapState('builder', ['currentBranch', 'currentFiles', 'committedFiles', 'commits', 'fileTypes']),
    branches () {
      return this.$store.getters['builder/branches']
    },
    initialCommit () {
      if (this.commits.length === 0) return true
      return false
    },
    changes () {
      return this.$store.getters['builder/changes']
    },
    readyToMerge () {
      if (this.currentBranch.branch === 'main') return false
      const changes = this.$store.getters['builder/changes']
      if (
        changes.newFiles
          .concat(changes.updatedFiles)
          .concat(changes.deletedFiles).length === 0
      ) {
        return true
      } else {
        return false
      }
    },
    readyToBranch () {
      const changes = this.$store.getters['builder/changes']
      if (
        changes.newFiles
          .concat(changes.updatedFiles)
          .concat(changes.deletedFiles).length === 0
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
    ...mapActions('builder', ['commitChanges', 'createBranch']),
    showBranchGraph () {
      this.showChanges = false
      process.nextTick(() => {
        this.graphContainer = document.getElementById('gitgraphcard')
        this.gitgraph = createGitgraph(this.graphContainer, {
          mode: 'compact'
        })
        this.branches.forEach(b => {
          const parentBranchParts = b.parentBranch.split('/')
          const parentBranchName = parentBranchParts[parentBranchParts.length - 2]
          if (b.branch === 'main') {
            const graphBranch = this.gitgraph
              .branch(b.branch)
              .commit('New repository')
            b.commits.forEach(c => {
              graphBranch.commit(c.message)
            })
          } else {
            const graphBranch = this.gitgraph
              .branch(parentBranchName)
              .branch(b.branch)
              .commit(`Branched ${b.branch} from ${parentBranchName}`)
            b.commits.forEach(c => {
              graphBranch.commit(c.message)
            })
            if (b.merge) {
              this.gitgraph
                .branch(parentBranchName)
                .merge(graphBranch, this.mergeMessage)
            }
          }
        })
      })
    },
    newBranch () {
      // In Holochain link all currentFiles to new branch path
      this.createBranch({ name: this.newBranchName })
      this.newBranchName = ''
    },
    commit () {
      if (this.commitMessage !== '') {
        this.commitChanges({ commitMessage: this.commitMessage })
        this.commitMessage = ''
      }
    },
    merge () {
      if (this.mergeMessage !== '') {
        this.mergeChanges({ mergeMessage: this.mergeMessage })
        this.mergeMessage = ''
      }
    }
  },
  watch: {
    currentBranch () {
      this.showBranchGraph()
    }
  }
}
</script>
