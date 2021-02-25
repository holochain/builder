<template>
  <div v-if="blok.extension === 'png'">
    <v-img :src="blok.content" contain />
  </div>
  <div v-else v-html="renderedMarkdown"></div>
</template>

<script>
import MarkdownIt from 'markdown-it'
import mermaid from 'mermaid'
import 'highlight.js/styles/tomorrow-night-bright.css'
const renderer = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
})
  .use(require('markdown-it-mermaid-plugin'))
  .use(require('markdown-it-code-copy'), {})
  .use(require('markdown-it-highlightjs'), {})
export default {
  name: 'Blok',
  props: ['blok'],
  computed: {
    renderedMarkdown () {
      return this.render(this.blok)
    }
  },
  methods: {
    render (blok) {
      let content = blok.content
      switch (blok.extension) {
        case 'js':
          content = '```javascript\n' + content + '\n```'
          break
        case 'rs':
          content = '```rust\n' + content + '\n```'
          break
        case 'merm':
          content = '```mermaid\n' + content + '\n```'
          break
        case 'vue':
          content = content.replaceAll('"', "'")
          content = '```javascript\n' + content + '\n```'
          break
        case 'json':
          content = '```json\n' + content + '\n```'
          break
        case 'yaml':
          content = '```yaml\n' + content + '\n```'
          break
        case 'md':
          break
      }
      content = renderer.render(content)
      return content
    },
    async renderMermaid () {
      setTimeout(() => {
        mermaid.mermaidAPI.initialize({ theme: 'base', themeVariables: { darkMode: true, primaryColor: '#5c007a' } })
        mermaid.init()
      }, 300)
    }
  },
  watch: {
    renderedMarkdown: {
      immediate: true,
      handler () {
        this.$nextTick(() => this.renderMermaid())
      }
    }
  }
}
</script>
