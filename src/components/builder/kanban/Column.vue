<template>
  <section id="column">
    <v-card :width="minWidth" min-width="250" :color="isSelected ? 'grey darken-3' : 'grey lighten-1'" :class="isSelected ? 'pt-0' : 'pt-1'">
      <v-toolbar dense dark class="ml-1 mr-1">
        <v-toolbar-title>
          {{column.name}}
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon small color="primary" @click="$emit('edit-column', column)">
          <v-icon>mdi-folder-edit-outline</v-icon>
        </v-btn>
        <v-btn icon small color="primary" @click="$emit('add-card', column, colCards.length)">
          <v-icon>mdi-card-plus-outline</v-icon>
        </v-btn>
        <v-btn icon small color="primary" @click="$emit('delete-column', column)">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
        <slot name="agent">
        </slot>
      </v-toolbar>
      <v-row
        no-gutters
        class="fill-height"
        align="start"
        justify="start">
        <v-col :cols="12 - colsSlot">
          <draggable
            v-if="!isSelected && colColumns.length > 0"
            :key="`draggableCols${column.uuid}`"
            v-model="colColumns"
            :animation="200"
            ghost-class="ghost"
            group="kanban-column"
            width="100%"
            :class="isSelected ? 'column-selected' : 'column pa-0 list-group'"
            style="overflow: auto;"
          >
            <v-col v-for="card in colColumns" :key="`${card.uuid}`" class="pa-1">
              <card :card="card" :minWidth="minWidth"/>
            </v-col>
          </draggable>
          <draggable
            v-else
            :key="`draggableCards${column.uuid}`"
            v-model="colCards"
            :animation="200"
            ghost-class="ghost"
            group="kanban-column"
            width="100%"
            :class="isSelected ? 'column-selected' : 'column pa-0 list-group'"
            style="overflow: auto;"
          >
            <v-col v-for="card in colCards" :key="`${card.uuid}`" class="pa-1">
              <card :card="card" :minWidth="minWidth" @edit-card="$emit('edit-card', card, column, 'edit')" @delete-card="$emit('delete-card', card, column)" @edit-card-specs="$emit('edit-card', card, column, 'specs')"/>
            </v-col>
          </draggable>
        </v-col>
        <v-col :cols="colsSlot">
          <slot></slot>
        </v-col>
      </v-row>
    </v-card>
  </section>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import draggable from 'vuedraggable'
export default {
  name: 'Column',
  components: {
    draggable,
    Card: () => import('./Card.vue')
  },
  props: ['column', 'isSelected', 'minWidth'],
  data () {
    return {}
  },
  computed: {
    ...mapState('builderKanban', ['cards']),
    colCards: {
      get () {
        return this.cards
          .filter(card => card.cardType === 'card')
          .filter(card => card.parentColumn === this.column.uuid)
          .sort((a, b) => a.order - b.order)
      },
      set (cards) {
        const reorderedCards = cards.map((card, index) => ({
          ...card,
          order: index
        }))
        reorderedCards.forEach(card => {
          card.parentColumn = this.column.uuid
          this.saveCard({ card, action: 'update' })
        })
      }
    },
    colColumns: {
      get () {
        const colCols = this.cards
          .filter(card => card.cardType === 'column')
          .filter(card => card.parentColumn === this.column.uuid)
          .sort((a, b) => a.order - b.order)
        return colCols
      },
      set (cols) {
        console.log(cols)
        const reorderedCols = cols.map((col, index) => ({
          ...col,
          order: index
        }))
        reorderedCols.forEach(col => {
          col.parentColumn = this.column.uuid
          this.saveCard({ card: col, action: 'update' })
        })
      }
    },
    colsSlot () {
      if (this.isSelected && this.colCards.length > 0) return 9
      return 12
    }
  },
  methods: {
    ...mapActions('builderKanban', ['saveCard'])
  }
}
</script>
<style scoped>
.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}
.list-group:empty {
    padding:3rem;
    text-align:center;
}

.list-group:empty:before {
    content: 'Drop cards here';
}
.column-selected {
  box-sizing: border-box;
  overflow-y: auto;
  height: calc(100vh - 48px);
}
.column {
  box-sizing: border-box;
  overflow-y: auto;
  height: calc(100vh - 103px);
}
</style>
