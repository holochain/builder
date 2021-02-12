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
        <image-editor
          v-if="f.options.mode === 'image'"
          :file="f"
          :imageHeight="imageHeight"
          :imageWidth="imageWidth"
          @image-uploaded="imageUploaded"
          class="pa-3"
        />
      </v-tab-item>
    </v-tabs>
  </v-card>
</template>
<script>
import { mapState, mapMutations, mapActions } from 'vuex'
export default {
  name: 'Editor',
  props: ['height'],
  data () {
    return {
      imageHeight: 300,
      imageWidth: 300
    }
  },
  components: {
    CodeWindow: () => import('./CodeWindow.vue'),
    ImageEditor: () => import('./ImageEditor.vue')
  },
  methods: {
    ...mapActions('builderDeveloper', ['saveOpenImage']),
    ...mapMutations('builderDeveloper', ['closeFile', 'openFileEdited']),
    fileEdited (file, edited) {
      file.edited = edited
      this.openFileEdited(file)
    },
    imageUploaded (fileToUpload, file) {
      this.saveOpenImage({ fileToUpload, file })
    }
  },
  computed: {
    ...mapState('builderDeveloper', ['openFiles', 'openFile', 'refreshKey']),
    selectedTab: {
      get () {
        return this.$store.state.builderDeveloper.selectedTab
      },
      set (tab) {
        this.$store.commit('builderDeveloper/setSelectedTab', tab)
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
