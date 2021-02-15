<template>
  <v-container fluid>
    <v-combobox
      v-model="model"
      :filter="filter"
      :hide-no-data="!search"
      :items="tags"
      item-text="tagText"
      :search-input.sync="search"
      return-object
      hide-selected
      label="Search for a tag"
      multiple
      small-chips
      solo
    >
      <template v-slot:no-data>
        <v-list-item>
          <span class="subheading pr-2">Adding</span>
          <v-chip :color="color(search)" label outlined>
            {{ search }}
          </v-chip>
        </v-list-item>
      </template>
      <template v-slot:selection="{ attrs, item, parent, selected }">
        <v-chip
          v-if="item === Object(item)"
          v-bind="attrs"
          :input-value="selected"
          label
          outlined
          :color="item.color"
          small
          class="ml-1"
        >
          <span class="pr-2">
            {{ item.tagText }}
          </span>
          <v-icon small @click="parent.selectItem(item)">mdi-close</v-icon>
        </v-chip>
      </template>
      <template v-slot:item="{ index, item }">
        <v-text-field
          v-if="editing === item"
          v-model="editing.tagText"
          autofocus
          flat
          background-color="transparent"
          hide-details
          solo
          @keyup.enter="edit(index, item)"
        ></v-text-field>
        <v-chip v-else :color="color(item.tagText)" dark label outlined small>
          {{ item.tagText }}
        </v-chip>
        <v-spacer></v-spacer>
        <v-list-item-action @click.stop>
          <v-btn icon @click.stop.prevent="edit(index, item)">
            <v-icon>{{ editing !== item ? "mdi-pencil" : "mdi-check" }}</v-icon>
          </v-btn>
        </v-list-item-action>
      </template>
    </v-combobox>
  </v-container>
</template>

<script>
import { v4 as uuidv4 } from 'uuid'
import { mapState, mapActions } from 'vuex'
export default {
  name: 'Tagger',
  props: ['selectedTags'],
  data: () => ({
    activator: null,
    attach: null,
    editing: null,
    index: -1,
    menu: false,
    x: 0,
    search: null,
    y: 0
  }),
  computed: {
    ...mapState('tagger', ['tags']),
    model: {
      get () {
        return this.selectedTags
      },
      set (selectedTags) {
        console.log('🚀 ~ ', selectedTags)
        const newTag = selectedTags.find(t => t.uuid === undefined)
        if (newTag !== undefined) {
          const tag = {
            uuid: uuidv4(),
            tagText: newTag,
            color: this.color(newTag)
          }
          this.createTag({ tag })
          console.log(selectedTags)
          selectedTags = selectedTags.filter(t => t.uuid !== undefined)
          selectedTags.push(tag)
        }
        this.$emit('tag', selectedTags)
      }
    }
  },
  methods: {
    ...mapActions('tagger', ['createTag']),
    color (tagText) {
      if (tagText === null || tagText === undefined) return
      var hash = 0
      for (var i = 0; i < tagText.length; i++) {
        hash = tagText.charCodeAt(i) + ((hash << 5) - hash)
      }
      var colour = '#'
      for (i = 0; i < 3; i++) {
        var value = (hash >> (i * 8)) & 0xff
        colour += ('00' + value.toString(16)).substr(-2)
      }
      return colour
    },
    edit (index, item) {
      if (!this.editing) {
        this.editing = item
        this.index = index
      } else {
        this.editing = null
        this.index = -1
      }
    },
    filter (item, queryText, itemText) {
      if (item.header) return false
      const hasValue = val => (val != null ? val : '')
      const text = hasValue(itemText)
      const query = hasValue(queryText)
      return (
        text
          .toString()
          .toLowerCase()
          .indexOf(query.toString().toLowerCase()) > -1
      )
    }
  },
  created () {
    this.$store.dispatch('tagger/initialise')
  }
}
</script>
