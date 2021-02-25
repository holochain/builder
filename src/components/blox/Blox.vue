<template>
  <v-card>
    <template v-for="(blok) in internalBlox">
      <v-hover :key="blok.uuid" v-slot:default="{ hover }" open-delay="200">
        <v-row no-gutters>
          <v-col cols="1">
            <v-icon v-if="hover" @click="setEditMode(blok)" v-text="editMode[blok.uuid] ? 'mdi-content-save-outline' : 'mdi-square-edit-outline'"></v-icon>
            <v-icon v-if="hover" @click="deleteBlok(blok)" color="warning" class="pl-2">mdi-delete-outline</v-icon>
          </v-col>
          <v-col cols="11" :id="blok.uuid">
            <blok-editor
              v-if="editMode[blok.uuid]"
              :options="getOptions(blok)"
              :blok="blok"
              @edited="contentChanged"/>
            <blok v-else class="pa-0 ma-0 mb-1" :blok="blok" />
          </v-col>
        </v-row>
      </v-hover>
    </template>
    <v-toolbar dark dense>
      <v-toolbar-title class="ml-2 mt-n1 mr-1 font-weight-black">Add Blok</v-toolbar-title>
      <v-btn @click="addBlok('md')">
        md
        <v-icon>mdi-language-markdown</v-icon>
      </v-btn>
      <v-btn @click="addBlok('merm')">
        diag
        <v-icon>mdi-drawing</v-icon>
      </v-btn>
      <v-btn @click="addBlok('png')">
        png
        <v-icon>mdi-file-image</v-icon>
      </v-btn>
      <v-btn @click="addBlok('vue')">
        Vue
        <v-icon>mdi-vuetify</v-icon>
      </v-btn>
      <v-btn @click="addBlok('json')">
        JSON
        <v-icon>mdi-code-json</v-icon>
      </v-btn>
      <v-btn @click="addBlok('js')">
        js
        <v-icon>mdi-language-javascript</v-icon>
      </v-btn>
      <v-btn @click="addBlok('rs')">
        rs
        <v-icon>mdi-code-braces</v-icon>
      </v-btn>
      <v-btn @click="addBlok('yaml')">
        yaml
        <v-icon>mdi-file-settings-outline</v-icon>
      </v-btn>
    </v-toolbar>
  </v-card>
</template>

<script>
import { v4 as uuidv4 } from 'uuid'
export default {
  name: 'Blox',
  components: {
    Blok: () => import('./Blok.vue'),
    BlokEditor: () => import('./BlokEditor.vue')
  },
  props: ['blox', 'fileTypes'],
  data () {
    return {
      editMode: {},
      internalBlox: this.blox
    }
  },
  methods: {
    setEditMode (blok) {
      this.editMode[blok.uuid] = !this.editMode[blok.uuid]
      if (!this.editMode[blok.uuid]) this.$emit('changed', this.internalBlox)
      this.editMode = { ...this.editMode }
    },
    contentChanged (updatedBlok) {
      this.internalBlox = this.internalBlox.map(blok =>
        blok.uuid !== updatedBlok.uuid ? blok : { ...blok, ...updatedBlok }
      )
    },
    getOptions (blok) {
      const opts = {
        tabSize: 2,
        keyMap: 'sublime',
        mode: 'javascript',
        theme: 'base16-dark',
        readOnly: false,
        lineNumbers: true,
        line: true,
        lineWrapping: true
      }
      switch (blok.extension) {
        case 'png':
        case 'jpg':
        case 'jpeg':
        case 'gif':
          opts.mode = 'image'
          break
        case 'rs':
          opts.mode = 'rust'
          break
        case 'yaml':
        case 'json':
        case 'nix':
        case 'code':
          opts.mode = 'javascript'
          opts.json = true
          break
        case 'js':
          opts.mode = 'javascript'
          opts.json = false
          break
        case 'md':
          opts.mode = 'markdown'
          opts.lineNumbers = false
          break
        case 'vue':
          opts.mode = 'vue'
          break
      }
      return opts
    },
    addBlok (type) {
      const uuid = uuidv4()
      this.internalBlox.push({
        uuid,
        order: this.internalBlox.length,
        content: '',
        extension: type
      })
      this.$emit('changed', this.internalBlox)
      this.editMode[uuid] = true
    },
    deleteBlok (blok) {
      this.internalBlox = this.internalBlox.filter(b => b.uuid !== blok.uuid)
      this.$emit('changed', this.internalBlox)
      delete this.editMode[blok.uuid]
    }
  },
  watch: {
    blox: {
      deep: true,
      handler (val) {
        this.internalBlox = val
      }
    }
  },
  created () {
    this.blox.forEach(blok => {
      this.editMode[blok.uuid] = false
    })
  }
}
</script>
