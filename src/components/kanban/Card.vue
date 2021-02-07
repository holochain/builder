<template>
  <v-card class="mx-auto pa-1" width="250">
    <v-img
      :src="card.preview"
      width="246px">
    </v-img>
    <v-card-title>{{card.name}}</v-card-title>
    <v-divider></v-divider>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn text @click="$emit('edit-card', card)">
        Edit
      </v-btn>
      <v-btn text @click="$emit('delete-card', card)">
        Delete
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  name: 'Card',
  props: ['card']
}
</script>
