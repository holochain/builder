<template>
<v-card
    class="mx-auto"
    tile
  >
    <v-card-title>{{heading}}</v-card-title>
    <v-list dense>
      <v-list-item-group
        color="primary"
      >
        <v-list-item
          v-for="(file, i) in files"
          :key="i"
        >
          <v-list-item-icon>
            <v-icon>{{ fileTypes[file.extension] }}</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title v-text="`${file.parentDir}${file.name}`"></v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list-item-group>
    </v-list>
  </v-card>
</template>
<script>
import { mapState } from 'vuex'
export default {
  name: 'FileList',
  props: ['files', 'heading'],
  computed: {
    ...mapState('builder', ['db', 'fileTypes', 'treeRefreshKey', 'applicationName'])
  }
}
</script>
