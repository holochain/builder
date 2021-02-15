<template>
  <v-card class="mx-auto pa-1" width="350">
    <v-toolbar
      dense
      dark
      outlined
      class="darken-1">
      <v-toolbar-title class="title">{{ card.name }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-icon v-for="emoji in card.reactions" :key="emoji">
        {{ emoji }}
      </v-icon>
      <!-- <v-icon v-if="card.channelUuid" @click="openKanbanCardChat">
        mdi-comment-multiple-outline
      </v-icon>
      <v-icon
        v-else
        @click="openKanbanCardChat"
        @delete-kanban-card-checklist-item="() => {}"
      >
        mdi-comment-outline
      </v-icon> -->
    </v-toolbar>
    <v-card-text
      v-html="card.description"
      class="pl-1 pr-1"
    />
    <v-chip
      v-for="(tag, index) in card.tags"
      :key="index"
      class="ml-2 mb-2"
      :color="tag.color"
      label
      small
    >
      {{ tag.tagText }}
    </v-chip>
    <v-divider></v-divider>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn icon small @click="$emit('edit-card', card)">
        <v-icon>mdi-file-document-edit-outline</v-icon>
      </v-btn>
      <v-btn icon small color="warning" @click="$emit('delete-card', card)">
        <v-icon>mdi-delete-outline</v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  name: 'Card',
  props: ['card'],
  data () {
    return {
      details: false
    }
  }
}
</script>
