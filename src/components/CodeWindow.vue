<template>
  <codemirror
    v-model="internalContent"
    :options="options"
    ref="editor"
    @changes="changes"
  ></codemirror>
</template>

<script>
import { mapState } from 'vuex'
import { codemirror } from 'vue-codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/rust/rust.js'
import 'codemirror/mode/javascript/javascript.js'
import 'codemirror/mode/markdown/markdown.js'
import 'codemirror/mode/vue/vue.js'
import 'codemirror/theme/base16-dark.css'
import 'codemirror/keymap/sublime.js'
export default {
  name: 'CodeWindow',
  props: ['file', 'options', 'height'],
  data () {
    return {
      internalContent: this.file.content
    }
  },
  components: {
    codemirror
  },
  computed: {
    ...mapState('builder', ['refreshKey'])
  },
  methods: {
    changes () {
      if (this.file.content !== this.internalContent) {
        this.$emit('edited', this.file, true)
      } else {
        this.$emit('edited', this.file, false)
      }
    }
  },
  mounted () {
    this.$refs.editor.codemirror.setSize(null, this.height)
  },
  watch: {
    height (val) {
      this.$refs.editor.codemirror.setSize(null, val)
    },
    refreshKey () {
      this.internalContent = this.file.content
    }
  }
}
</script>
