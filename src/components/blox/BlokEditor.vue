<template>
  <div v-if="options.mode === 'image'">
    <v-img :src="internalContent" contain />
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
  </div>
  <div v-else>
    <codemirror
      v-model="internalContent"
      :options="options"
      ref="editor"
      @changes="changes"
    ></codemirror>
  </div>
</template>

<script>
import { codemirror } from 'vue-codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/rust/rust.js'
import 'codemirror/mode/javascript/javascript.js'
import 'codemirror/mode/markdown/markdown.js'
import 'codemirror/mode/vue/vue.js'
import 'codemirror/theme/base16-dark.css'
import 'codemirror/keymap/sublime.js'
export default {
  name: 'BlokEditor',
  props: ['blok', 'options', 'height'],
  data () {
    return {
      internalBlok: this.blok,
      internalContent: this.blok.content,
      internalHeight: this.height,
      uploadedFile: []
    }
  },
  components: {
    codemirror
  },
  methods: {
    changes () {
      this.internalBlok.content = this.internalContent
      this.$emit('edited', this.internalBlok)
    }
  },
  mounted () {
    console.log(this.blok)
    if (this.$refs.editor) this.$refs.editor.codemirror.setSize(null, '100%')
  },
  watch: {
    internalHeight (val) {
      if (this.$refs.editor) this.$refs.editor.codemirror.setSize(null, '100%')
    },
    uploadedFile (fileToUpload) {
      if (fileToUpload === null) {
        this.internalOrgProfileLogo = ''
        return
      }
      var reader = new FileReader()
      reader.onload = (e) => {
        this.internalContent = e.target.result
        this.internalBlok.content = this.internalContent
        this.$emit('edited', this.internalBlok)
      }
      reader.readAsDataURL(fileToUpload)
    }
  }
}
</script>
