<template>
  <section id="cards">
    <v-row no-gutters class="fill-height">
      <v-col>
        <split
          :key="cwHeight"
          :style="`height: ${cwHeight}px; width: 100%;`"
          :gutterSize="2"
        >
          <split-area :size="22">
            <v-toolbar dense dark>
              <v-toolbar-title>Project Explorer</v-toolbar-title>
              <v-spacer></v-spacer>
              <v-icon @click="$store.dispatch('builderKanban/fetchCards')" color="primary" dark class="pr-1">
                mdi-refresh
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
          <split-area :size="78">
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
                @delete-card="deleteCd">
                <template v-slot:agent>
                  <agent />
                </template>
                <v-slide-group
                  v-model="model"
                  class="pa-1 fill-height"
                  show-arrows
                >
                  <v-slide-item
                    v-for="column in columns"
                    :key="column.uuid"
                  >
                    <div class="pa-1">
                      <column
                      :column="column"
                      :key="`${column.uuid}`"
                      @edit-column="editColumn"
                      @delete-column="deleteCol"
                      @add-card="addCard"
                      @edit-card="editCard"
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
      :width="this.$vuetify.breakpoint.lgAndUp ? 500 : 400"
    >
      <v-card>
        <v-system-bar window dark>
          <v-icon>mdi-message</v-icon>
          <span>10 unread messages</span>
          <v-spacer></v-spacer>
          <v-icon @click="cardDrawerOpen = false">mdi-close</v-icon>
        </v-system-bar>
        <v-card-title>
          <span class="headline">Card Details</span>
          <v-spacer></v-spacer>
          Column --> {{ parentColumnName }}
        </v-card-title>
        <v-row no-gutters>
          <v-col cols="12" class="pr-2 pl-2">
            <v-text-field
              v-model="editingCard.name"
              label="Name"
              dark
              dense
              autofocus
              @keydown.enter="saveCd"
            ></v-text-field>
          </v-col>
          <v-col cols="12" class="pr-2 pl-2">
            <span>Image</span>
              <v-image-input
                v-model="editingCard.preview"
                :image-quality="1"
                clearable
                image-format="jpeg,png"
                :image-width="100"
                :image-height="100"
                dark
                image-min-scaling="contain"
                class="ml-15 pl-10 mt-5 mb-n3"
              />
          </v-col>
        </v-row>
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
import VImageInput from 'vuetify-image-input/a-la-carte'
export default {
  name: 'Cards',
  components: {
    VImageInput,
    Agent: () => import('@/components/Agent.vue'),
    Column: () => import('@/components/builder/kanban/Column.vue'),
    CardTree: () => import('@/components/builder/kanban/CardTree.vue'),
    ConfirmActionDialog: () =>
      import('@/components/ConfirmActionDialog.vue')
  },
  data: () => ({
    model: null,
    columnDrawerOpen: false,
    cardDrawerOpen: false,
    deleteCardDialog: false,
    deleteColumnDialog: false,
    cwHeight: 700,
    selectedTreeItem: {},
    parentColumnName: '',
    editingColumn: {
      uuid: uuidv4(),
      name: '',
      parentColumn: 'root',
      children: [],
      cardType: 'column',
      preview: '',
      parent: 'Cards',
      order: 0
    },
    editingCard: {
      uuid: uuidv4(),
      name: '',
      preview: '',
      parentColumn: '',
      cardType: 'card',
      parent: 'Cards',
      order: 0
    },
    action: 'create',
    select: [],
    items: [
      'Profile',
      'Idea',
      'Music Player',
      'Video Player',
      'Tags'
    ]
  }),
  computed: {
    ...mapState('builderKanban', ['treeItems', 'selectedColumn', 'cards']),
    columns () {
      return this.cards
        .filter(card => card.cardType === 'column')
        .filter(card => card.parentColumn === this.selectedColumn.uuid)
        .sort((a, b) => a.order < b.order)
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
    addCard (column) {
      this.parentColumnName = column.name
      this.editingCard = {
        uuid: uuidv4(),
        name: '',
        preview: '',
        parentColumn: column.uuid,
        cardType: 'card',
        parent: 'Cards',
        order: 0
      }
      this.action = 'create'
      this.cardDrawerOpen = true
    },
    editCard (card, column) {
      this.parentColumnName = column.name
      this.editingCard = { ...card }
      this.action = 'update'
      this.cardDrawerOpen = true
    },
    deleteCd (card, column) {
      this.parentColumnName = column.name
      this.editingCard = { ...card }
      this.action = 'delete'
      this.deleteCardDialog = true
    },
    saveCd () {
      this.saveCard({ card: this.editingCard, action: this.action })
      this.cardDrawerOpen = false
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
    }
  },
  mounted () {
    this.setCodeWindowHeight()
    this.$store.dispatch('builderKanban/initialise')
  }
}
</script>
