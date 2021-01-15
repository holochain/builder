<template>
  <div>
    <v-treeview
      item-key="key"
      activatable
      open-on-click
      dense
      return-object
      :key="treeRefreshKey"
      :active.sync="active"
      :open.sync="open"
      :items="treeItems"
      :load-children="listDirectory"
    >
      <template v-slot:prepend="{ item, open }">
        <v-icon color="primary darken-4"
          v-if="item.type === 'dir'"
          @contextmenu="show($event, item)"
          @click="
            listDirectory(item);
            $emit('dir-selected', item);
          "
        >
          {{ open ? "mdi-folder-open" : "mdi-folder" }}
        </v-icon>
        <v-icon color="primary darken-2"
          v-else
          @click="
            openFile(item);
            $emit('file-selected', item);
          "
        >
          {{ fileTypes[item.extension] }}
        </v-icon>
      </template>
      <template v-slot:label="{ item }">
        <div v-if="contextMenuItem.edit">
          <v-text-field
            v-model="item.name"
            dark
            @keydown.enter="renameEntry(contextMenuItem)"
            />
        </div>
        <div v-else>
          <span
            v-if="item.type === 'dir'"
            @contextmenu="show($event, item)"
            @click.stop="
              listDirectory(item);
              $emit('dir-selected', item);
            "
          >
            {{ item.name }}
          </span>
          <span
            v-else
            @click="
              openFile(item);
              $emit('file-selected', item);
            "
          >
            {{ item.name }}
          </span>
        </div>
      </template>
    </v-treeview>
    <v-menu
      v-model="showMenu"
      :position-x="x"
      :position-y="y"
      absolute
      offset-y
      >
        <v-list dense>
        <v-list-item key="menuItem1" @click="clickAction($event, menuItem)">
          <v-list-item-title>Rename Entry Type</v-list-item-title>
        </v-list-item>
        <v-list-item key="menuItem2" @click="clickAction($event, menuItem)">
          <v-list-item-title>Duplicate Entry Type</v-list-item-title>
        </v-list-item>
        </v-list>
      </v-menu>
  </div>
</template>
<script>
import { mapState, mapActions } from 'vuex'
export default {
  name: 'FileTree',
  components: {},
  data () {
    return {
      open: [],
      active: [],
      tree: [],
      contextMenuItem: {},
      showMenu: false,
      x: 0,
      y: 0,
      menuItems: [],
      addEntryTypeDialog: false
    }
  },
  computed: {
    ...mapState('builder', ['db', 'treeItems', 'fileTypes', 'treeRefreshKey', 'applicationName'])
  },
  methods: {
    ...mapActions('builder', ['openFile', 'getTreeRootFolders']),
    async listDirectory (item) {
      localStorage.setItem('openTreeNodes', this.open)
      const parentDir = `${item.parentDir}${item.name}/`
      return new Promise(resolve => {
        this.db.currentFiles.where({ parentDir }).toArray(entries => {
          item.children = entries.map(entry => {
            entry.key = `${entry.parentDir}${entry.name}`
            if (entry.type === 'dir') {
              entry.children = []
            }
            return entry
          })
          resolve()
        })
      })
    },
    clickAction (event, selectedMenuItem) {
      this.contextMenuItem.name = 'test'
      this.contextMenuItem.edit = true
      console.log(event, selectedMenuItem, this.contextMenuItem)
    },
    show (event, item) {
      event.preventDefault()
      this.showMenu = false
      this.contextMenuItem = item
      this.x = event.clientX
      this.y = event.clientY
      this.$nextTick(() => {
        // if (item.parentDir === `/${this.applicationName}/dna/zomes/${this.applicationName}/src/entries/`) {
        //   this.showMenu = true
        // }
      })
    },
    renameEntry (contextMenuItem) {
      this.contextMenuItem.edit = false
    }
  },
  mounted () {
    this.getTreeRootFolders()
  },
  watch: {
    treeRefreshKey () {
      this.getTreeRootFolders()
    }
  }
}
</script>
