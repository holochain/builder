<template>
  <section id="column">
    <v-card min-width='250' :color="isSelected ? 'grey darken-3' : 'grey lighten-1'">
      <v-toolbar dense dark>
        <v-toolbar-title>
          {{column.name}}
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon small color="primary" @click="$emit('edit-column', column)">
          <v-icon>mdi-folder-edit-outline</v-icon>
        </v-btn>
        <v-btn icon small color="primary" @click="$emit('add-card', column)">
          <v-icon>mdi-card-plus-outline</v-icon>
        </v-btn>
        <v-btn icon small color="primary" @click="$emit('delete-column', column)">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
        <agent />
      </v-toolbar>
      <v-row
        no-gutters
        class="fill-height"
        align="start"
        justify="start">
        <v-col :cols="12 - colsSlot">
        <draggable
          :key="`draggable${column.uuid}`"
          v-model="colCards"
          :animation="200"
          ghost-class="ghost"
          group="kanban-column"
          width="100%"
          :class="isSelected ? 'column-selected' : 'column pa-0'"
          style="overflow: auto;"
        >
          <v-col v-for="card in colCards" :key="`${card.uuid}`" class="pa-1">
            <card :card="card" @edit-card="$emit('edit-card', card, column)" @delete-card="$emit('delete-card', card, column)"/>
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
    Agent: () => import('@/components/Agent.vue'),
    draggable,
    Card: () => import('./Card.vue')
  },
  props: ['column', 'isSelected'],
  data () {
    return {}
  },
  computed: {
    ...mapState('kanban', ['cards']),
    colCards: {
      get () {
        return this.cards
          .filter(card => card.cardType === 'card')
          .filter(card => card.parentColumn === this.column.uuid)
          .sort((a, b) => a.order < b.order)
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
    colsSlot () {
      if (this.isSelected && this.colCards.length > 0) return 9
      return 12
    }
  },
  methods: {
    ...mapActions('kanban', ['saveCard'])
  }
}
</script>
<style scoped>
.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}
.column-selected {
  box-sizing: border-box;
  overflow-y: auto;
  height: calc(100vh - 46px);
}
.column {
  box-sizing: border-box;
  overflow-y: auto;
  height: calc(100vh - 111px);
}
</style>
