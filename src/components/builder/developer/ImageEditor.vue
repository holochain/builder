<template>
  <v-card>
    <v-img :src="internalContent" :key="refreshKey" :height="imageHeight" contain />
    <v-file-input
      v-model="uploadedFile"
      accept="image/*"
      label="Upload new image"
      outlined
      dense
      dark
      prepend-icon="mdi-file-image-outline"
      show-size
      class="pt-3"
    >
      <template v-slot:selection="{ text }">
        <v-card-subtitle>
          {{ text }}
        </v-card-subtitle>
      </template>
    </v-file-input>
  </v-card>
</template>

<script>
import { mapState } from 'vuex'
export default {
  name: 'ImageEditor',
  props: ['file', 'imageWidth', 'imageHeight'],
  components: {},
  data () {
    return {
      internalContent: '',
      uploadedFile: []
    }
  },
  computed: {
    ...mapState('builderDeveloper', ['refreshKey'])
  },
  methods: {},
  watch: {
    uploadedFile (fileToUpload) {
      this.$emit('image-uploaded', fileToUpload, this.file, false)
    },
    refreshKey () {
      this.internalContent = this.file.content
    }
  },
  mounted () {
    this.internalContent = this.file.content
  }
}
</script>
