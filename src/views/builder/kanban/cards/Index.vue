<template>
  <section id="cards">
    <v-row no-gutters class="fill-height">
      <v-col>
        <split
          :key="cwHeight"
          :style="`height: ${cwHeight}px; width: 100%;`"
          :gutterSize="2"
        >
          <split-area :size="20">
            <v-toolbar dense dark>
              <builder-menu />
              <v-toolbar-title class="ml-2 mt-n1 mr-1 font-weight-black">Project Explorer</v-toolbar-title>
              <v-spacer></v-spacer>
              <v-icon v-if="!migrate" @click="$store.dispatch('builderKanban/fetchCards')" color="primary" dark class="pr-1">
                mdi-refresh
              </v-icon>
              <v-icon v-if="migrate" @click="$store.dispatch('builderKanban/migrateIndexDbToHolochain')" color="primary" dark class="pr-1">
                mdi-cog-transfer-outline
              </v-icon>
              <v-icon @click="addColumn" color="primary" dark>
                mdi-table-column-plus-after
              </v-icon>
            </v-toolbar>
            <card-tree
              key="cardTree"
              @column-selected="columnSelected"
              @card-selected="cardSelected"
              :height="cwHeight"
            />
          </split-area>
          <split-area :size="80" ref="columnsSplit">
            <v-sheet class="mx-auto fill-height" elevation="8">
              <column
                v-if="selectedColumn !== undefined"
                :column="selectedColumn"
                :key="`${selectedColumn.uuid}`"
                :isSelected="true"
                @edit-column="editColumn"
                @delete-column="deleteCol"
                @add-card="addCard"
                @edit-card="editCard"
                @edit-card-specs="editCard"
                @delete-card="deleteCd">
                <template v-slot:agent>
                  <agent />
                </template>
                <v-slide-group
                  v-model="model"
                  class="fill-height"
                >
                  <v-slide-item
                    v-for="column in columns"
                    :key="column.uuid"
                  >
                    <div class="pl-1">
                      <column
                        :minWidth="columnWidth"
                        :column="column"
                        :key="`${column.uuid}`"
                        @edit-column="editColumn"
                        @delete-column="deleteCol"
                        @add-card="addCard"
                        @edit-card="editCard"
                        @edit-card-specs="editCard"
                        @delete-card="deleteCd">
                      </column>
                    </div>
                  </v-slide-item>
                </v-slide-group>
              </column>
            </v-sheet>
          </split-area>
        </split>
      </v-col>
    </v-row>
    <v-navigation-drawer
      v-model="columnDrawerOpen"
      fixed
      dark
      class="overflow-visible pa-0"
      right
      :width="this.$vuetify.breakpoint.lgAndUp ? 600 : 400"
    >
      <template v-slot:prepend>
        <v-system-bar
          window
          dark
        >
          <v-icon>mdi-message</v-icon>
          <span>10 unread messages</span>
          <v-spacer></v-spacer>
          <v-icon @click="columnDrawerOpen = false">mdi-close</v-icon>
        </v-system-bar>
      </template>
      <v-card class="fill-height">
        <v-card-title>
          <span class="headline">Column Details</span>
          <v-spacer></v-spacer>
          Parent --> {{ parentColumnName }}
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row no-gutters>
              <v-col cols="12">
                <v-text-field
                  v-model="editingColumn.name"
                  label="Name"
                  autofocus
                  @keydown.enter="saveCol"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary darken-1"
            text
            @click="columnDrawerOpen = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary darken-1"
            text
            @click="saveCol"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-navigation-drawer>
    <v-navigation-drawer
      v-model="cardDrawerOpen"
      fixed
      dark
      class="overflow-visible pa-0"
      right
      :width="this.$vuetify.breakpoint.lgAndUp ? 700 : 500"
    >
      <v-card class="fill-height">
        <v-system-bar window dark>
          <v-icon>mdi-card-text-outline</v-icon>
          <span class="pl-1 pr-2">Column ({{ parentColumnName }})</span>
          <v-btn
            icon
            v-for="emoji in editingCard.reactions"
            :key="emoji"
            @click="removeReaction(emoji)">
            <v-icon>{{ emoji }}</v-icon>
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            icon
            small
            @click="openEmojiPicker()">
            <v-icon>mdi-emoticon-outline</v-icon>
          </v-btn>
          <v-btn
            icon
            small
            @click="cardDrawerOpen = false">
            <v-icon>mdi-close-box-outline</v-icon>
          </v-btn>
        </v-system-bar>
        <v-card-text>
          <v-row no-gutters>
            <v-col cols="12" class="pr-2 pl-2">
              <v-text-field
                v-model="editingCard.name"
                label="Name"
                dark
                dense
                autofocus
              ></v-text-field>
            </v-col>
            <v-col cols="12" class="pr-2 pl-2">
              <v-textarea
                v-model="editingCard.description"
                label="Description"
                rows="5"
                dark
                dense />
            </v-col>
            <v-col cols="12" class="pr-2 pl-2">
              <tagger
                :selectedTagUuids="selectedTagUuids"
                @tag="tag"
                class="pa-0" />
            </v-col>
            <v-col cols="12" class="pr-2 pl-2">
              <people-selector
                :selectedPeople="selectedPeople"
                @people-selected="peopleSelected"
              />
            </v-col>
          </v-row>
          <emoji-picker :isOpen="emojiPanel" @add-emoji="addEmoji" />
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary darken-1"
            text
            @click="cardDrawerOpen = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary darken-1"
            text
            @click="saveCd"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-navigation-drawer>
    <v-navigation-drawer
      v-model="specsDrawerOpen"
      fixed
      dark
      class="overflow-visible pa-0"
      right
      :width="this.$vuetify.breakpoint.lgAndUp ? 1000 : 800"
    >
      <v-card class="fill-height">
        <v-system-bar window dark>
          <v-icon>mdi-notebook-edit-outline</v-icon>
          <span class="pl-1 pr-2">Specs for {{ editingCard.name }}</span>
          <v-btn
            icon
            v-for="emoji in editingCard.reactions"
            :key="emoji"
            @click="removeReaction(emoji)">
            <v-icon>{{ emoji }}</v-icon>
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            icon
            small
            @click="openEmojiPicker()">
            <v-icon>mdi-emoticon-outline</v-icon>
          </v-btn>
          <v-btn
            icon
            small
            @click="specsDrawerOpen = false">
            <v-icon>mdi-close-box-outline</v-icon>
          </v-btn>
        </v-system-bar>
        <v-card-text class="specs">
          <blox :blox="specs" :fileTypes="fileTypes" @changed="updateSpecs"/>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary darken-1"
            text
            @click="cardDrawerOpen = false; specsDrawerOpen = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary darken-1"
            text
            @click="saveCd"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-navigation-drawer>
    <confirm-action-dialog
      :isOpen="deleteCardDialog"
      :message="`delete ${this.editingCard.name} from ${this.parentColumnName}`"
      @confirm="confirmDeleteCard"
      @cancel="cancelDeleteCard"
    />
    <confirm-action-dialog
      :isOpen="deleteColumnDialog"
      :message="`delete ${this.editingColumn.name} from ${this.parentColumnName}`"
      @confirm="confirmDeleteColumn"
      @cancel="cancelDeleteColumn"
    />
  </section>
</template>

<script>
import { v4 as uuidv4 } from 'uuid'
import { mapState, mapActions, mapMutations } from 'vuex'
export default {
  name: 'Cards',
  components: {
    Agent: () => import('@/components/Agent.vue'),
    BuilderMenu: () => import('@/layouts/builder/BuilderMenu.vue'),
    Column: () => import('@/components/builder/kanban/Column.vue'),
    CardTree: () => import('@/components/builder/kanban/CardTree.vue'),
    ConfirmActionDialog: () => import('@/components/ConfirmActionDialog.vue'),
    EmojiPicker: () => import('@/components/core/EmojiPicker.vue'),
    Blox: () => import('@/components/blox/Blox.vue'),
    Tagger: () => import('@/components/tags/Tagger.vue'),
    PeopleSelector: () => import('@/components/core/PeopleSelector.vue')
  },
  data: () => ({
    model: null,
    columnDrawerOpen: false,
    cardDrawerOpen: false,
    specsDrawerOpen: false,
    deleteCardDialog: false,
    deleteColumnDialog: false,
    cwHeight: 700,
    emojiPanel: false,
    selectedTreeItem: {},
    columnWidth: 400,
    parentColumnName: '',
    editingColumn: {
      uuid: uuidv4(),
      name: '',
      parentColumn: 'root',
      children: [],
      cardType: 'column',
      parent: 'Cards',
      order: 0
    },
    editingCard: {
      uuid: uuidv4(),
      name: '',
      description: '',
      reactions: [],
      tags: [],
      parentColumn: '',
      cardType: 'card',
      parent: 'Cards',
      order: 0
    },
    selectedTagUuids: [],
    selectedPeople: [],
    action: 'create',
    select: [],
    items: [
      'Profile',
      'Idea',
      'Music Player',
      'Video Player',
      'Tags'
    ],
    specs: []
  }),
  computed: {
    ...mapState('builderKanban', ['treeItems', 'selectedColumn', 'cards', 'migrate']),
    ...mapState('builderDeveloper', ['fileTypes']),
    columns () {
      return this.cards
        .filter(card => card.cardType === 'column')
        .filter(card => card.parentColumn === this.selectedColumn.uuid)
        .sort((a, b) => a.order - b.order)
    }
  },
  methods: {
    ...mapActions('builderKanban', ['saveCard', 'deleteCard']),
    ...mapMutations('builderKanban', ['setSelectedColumn']),
    addRootColumn () {
      this.editingColumn.parentColumn = 'root'
      this.parentColumnName = 'Root'
      this.columnDrawerOpen = true
    },
    addColumn () {
      this.editingColumn = {
        uuid: uuidv4(),
        name: '',
        parentColumn: 'root',
        children: [],
        cardType: 'column',
        preview: '',
        parent: 'Cards',
        order: 0
      }
      if (this.selectedColumn.parentColumn) {
        this.editingColumn.parentColumn = this.selectedColumn.uuid
      }
      this.parentColumnName = this.selectedColumn.name
      this.columnDrawerOpen = true
    },
    editColumn (column) {
      if (column.parentColumn === 'root') {
        this.parentColumnName = 'root'
      } else {
        const parentColumn = this.cards.find(card => card.uuid === column.parentColumn)
        this.parentColumnName = parentColumn.name
      }
      this.editingColumn = { ...column }
      this.action = 'update'
      this.columnDrawerOpen = true
    },
    deleteCol (column) {
      const parentColumn = this.cards.find(card => card.uuid === column.parentColumn)
      this.parentColumnName = parentColumn.name
      this.editingColumn = { ...column }
      this.action = 'delete'
      this.deleteColumnDialog = true
    },
    addCard (column, length) {
      this.parentColumnName = column.name
      this.editingCard = {
        uuid: uuidv4(),
        name: '',
        description: '',
        reactions: [],
        tags: [],
        specs: [],
        parentColumn: column.uuid,
        cardType: 'card',
        parent: 'Cards',
        order: length
      }
      this.action = 'create'
      this.cardDrawerOpen = true
    },
    editCard (card, column, drawer) {
      this.parentColumnName = column.name
      this.editingCard = { ...card }
      if (card.description === undefined) this.editingCard.description = ''
      if (card.reactions === undefined) this.editingCard.reactions = []
      if (card.tags === undefined) this.editingCard.tags = []
      if (card.specs === undefined) this.editingCard.specs = []
      if (card.assignees === undefined) this.editingCard.assignees = []
      this.selectedTagUuids = this.editingCard.tags
      this.selectedPeople = this.editingCard.assignees
      this.specs = this.editingCard.specs
      this.action = 'update'
      console.log('🚀 ~', this.editingCard.specs)
      switch (drawer) {
        case 'edit':
          this.cardDrawerOpen = true
          break
        case 'specs':
          this.specsDrawerOpen = true
          break
      }
    },
    deleteCd (card, column) {
      this.parentColumnName = column.name
      this.editingCard = { ...card }
      this.action = 'delete'
      this.deleteCardDialog = true
    },
    saveCd () {
      this.editingCard.tags = this.selectedTagUuids
      this.editingCard.assignees = this.selectedPeople
      this.editingCard.specs = this.specs
      console.log('🚀 ', this.editingCard)
      this.saveCard({ card: this.editingCard, action: this.action })
      this.cardDrawerOpen = false
      this.specsDrawerOpen = false
    },
    setCodeWindowHeight () {
      this.cwHeight = this.$el.clientHeight
    },
    columnSelected (column) {
      this.selectedTreeItem = column
      this.setSelectedColumn(column)
    },
    cardSelected (card) {
      // this.setSelectedColumn(card)
    },
    saveCol () {
      if (this.editingColumn.order === undefined) {
        this.editingColumn.order = this.selectedColumn.children.length + 1
      }
      this.saveCard({ card: this.editingColumn, action: this.action })
      if (this.action === 'create') {
        if (this.selectedTreeItem.children) {
          this.selectedTreeItem.children.push(this.editingColumn)
        } else {
          this.treeItems.push(this.editingColumn)
        }
      } else {
        if (this.selectedTreeItem.children) {
          this.selectedTreeItem.children = this.selectedTreeItem.children.map(column =>
            column.uuid !== this.editingColumn.uuid ? column : { ...column, ...this.editingColumn }
          )
        } else {
          this.treeItems = this.treeItems.map(column =>
            column.uuid !== this.editingColumn.uuid ? column : { ...column, ...this.editingColumn }
          )
        }
      }
      this.columnDrawerOpen = false
    },
    confirmDeleteCard () {
      this.deleteCard({ card: this.editingCard })
      this.deleteCardDialog = false
    },
    cancelDeleteCard () {
      this.deleteCardDialog = false
    },
    confirmDeleteColumn () {
      this.deleteCard({ card: this.editingColumn })
      this.deleteColumnDialog = false
    },
    cancelDeleteColumn () {
      this.deleteColumnDialog = false
    },
    openEmojiPicker () {
      this.emojiPanel = true
    },
    addEmoji (emoji) {
      this.editingCard.reactions.push(emoji.value)
      this.emojiPanel = false
    },
    removeReaction (emoji) {
      this.editingCard.reactions = this.editingCard.reactions.filter(r => r !== emoji)
    },
    tag (selectedTagUuids) {
      this.editingCard.tags = selectedTagUuids
      this.selectedTagUuids = selectedTagUuids
    },
    peopleSelected (people) {
      this.editingCard.assignees = people
    },
    updateSpecs (specs) {
      console.log(specs)
      this.specs = specs
    }
  },
  mounted () {
    this.setCodeWindowHeight()
    const that = this
    that.$nextTick(() => {
      this.columnWidth = this.$refs.columnsSplit.$el.clientWidth / 3.05
    })
    this.$store.dispatch('builderKanban/initialise')
  }
}
</script>
<style scoped>
.specs {
  box-sizing: border-box;
  overflow-y: auto;
  height: calc(100vh - 83px);
}
</style>
