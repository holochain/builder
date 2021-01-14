<template>
  <v-card flat tile height="100%" class="ma-0 pa-0">
    <v-tabs v-model="selectedTab" dark show-arrows height="40" ripple>
      <v-tabs-slider></v-tabs-slider>
      <v-tab v-for="f in openFiles" :key="`${f.parentDir}${f.name}`">
        {{ f.name }}
        <v-icon
          right
          small
          v-text="f.edited ? 'mdi-circle' : 'mdi-close'"
          @click="closeFile(f)"
        ></v-icon>
      </v-tab>
      <v-tab-item v-for="f in openFiles" :key="`${f.parentDir}${f.name}`">
        <code-window
          v-if="f.options.mode !== 'image'"
          :key="`${f.parentDir}${f.name}${refreshKey}`"
          :file="f"
          :options="f.options"
          :height="height - 44"
          @edited="fileEdited"
        />
        <v-image-input
          v-if="f.options.mode === 'image'"
          v-model="f.content"
          :image-quality="1"
          clearable
          image-format="jpeg,png"
          :image-width="imageWidth"
          :image-height="imageHeight"
          dark
          image-min-scaling="contain"
        />
      </v-tab-item>
    </v-tabs>
  </v-card>
</template>
<script>
import VImageInput from 'vuetify-image-input/a-la-carte'
import { mapState, mapMutations } from 'vuex'
export default {
  name: 'Editor',
  props: ['height'],
  components: {
    CodeWindow: () => import('./CodeWindow.vue'),
    VImageInput
  },
  methods: {
    ...mapMutations('builder', ['closeFile', 'openFileEdited']),
    fileEdited (file, edited) {
      file.edited = edited
      this.openFileEdited(file)
    }
  },
  computed: {
    ...mapState('builder', ['openFiles', 'openFile', 'refreshKey']),
    selectedTab: {
      get () {
        return this.$store.state.builder.selectedTab
      },
      set (tab) {
        this.$store.commit('builder/setSelectedTab', tab)
      }
    }
  }
}
</script>
<style scoped>
.CodeMirror {
  border: 1px solid #eee;
  height: auto;
}
</style>
