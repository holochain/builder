<template>
  <v-card height="100%" width="100%">
    <v-app-bar app dark dense tile class="pa-0">
      <v-avatar size="30" class="mt-n1 mr-2">
        <v-img contain :src="require('@/assets/e-s-c-r-logo.png')">
        </v-img>
      </v-avatar>
      <v-toolbar-title class="mt-n1 mr-1 font-weight-black">Builder</v-toolbar-title>
      <v-menu offset-y dark dense>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            color="action darken-1"
            tile
            text
            dark
            small
            v-bind="attrs"
            v-on="on"
          >
            File
          </v-btn>
        </template>
        <v-list dense>
          <v-list-item
            @click="myappDrawerOpen = true; newApplication = true"
            key="newApplication"
          >
            <v-list-item-title>New Holochain App</v-list-item-title>
          </v-list-item>
          <!-- <v-list-item
            key="newDna"
            @click="
              getTemplates();
              addDnaDialog = true;
            "
          >
            <v-list-item-avatar size="25">
              <v-icon>mdi-dna</v-icon>
            </v-list-item-avatar>
            <v-list-item-title>New Holochain DNA</v-list-item-title>
          </v-list-item> -->
          <v-divider></v-divider>
          <!-- <v-list-item
            key="refreshFiles"
            @click="recurseApplicationFiles({ name: 'kanban' })"
          >
            <v-list-item-title>Status</v-list-item-title>
          </v-list-item> -->
          <v-list-item @click="newFolder" key="newFolder">
            <v-list-item-title>New Folder</v-list-item-title>
          </v-list-item>
          <v-list-item @click="newFile" key="newFile">
            <v-list-item-title>New File</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
        <v-menu offset-y dark dense>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            color="action darken-1"
            tile
            text
            dark
            small
            v-bind="attrs"
            v-on="on"
          >
            View
          </v-btn>
        </template>
        <v-list dense>
          <v-list-item to="/builder-repositories">
            <v-list-item-content>
              <v-list-item-title>Repositories</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item to="/agents">
            <v-list-item-content>
              <v-list-item-title>Community</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item to="/profile-designer">
            <v-list-item-content>
              <v-list-item-title>Profile Specs</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-menu>
      <v-menu offset-y dark>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            color="action darken-1"
            tile
            text
            dark
            small
            v-bind="attrs"
            v-on="on"
          >
            App
          </v-btn>
        </template>
        <v-list dense>
          <v-list-item
            key="addModule"
            @click="myappDrawerOpen = true; newApplication = false"
          >
            <v-list-item-title>Add Module</v-list-item-title>
          </v-list-item>
          <v-list-item
            key="addLayout"
            @click="
              webPartDialogTitle = 'Add a layout'
              webPartType = 'layouts'
              getWebPartTemplates({ webPartType });
              addWebPartDialog = true;
            "
          >
            <v-list-item-title>Add Layout</v-list-item-title>
          </v-list-item>
          <v-list-item key="addView" @click="
              webPartDialogTitle = 'Add a view'
              webPartType = 'views'
              getWebPartTemplates({ webPartType });
              addWebPartDialog = true;
            ">
            <v-list-item-title>Add View</v-list-item-title>
          </v-list-item>
          <!-- <v-list-item key="addAppComponent">
            <v-list-item-title>Add App Component</v-list-item-title>
          </v-list-item>
          <v-list-item key="addComponent">
            <v-list-item-title>Add Component</v-list-item-title>
          </v-list-item> -->
          <v-divider></v-divider>
          <v-list-item
            key="runWebApp"
            @click="
              stdMessagesDialog = true;
              terminalTitle = 'yarn serve';
              serveWebApp({ name: applicationName, port: '5100' });
            "
          >
            <v-list-item-title>Serve Web App</v-list-item-title>
          </v-list-item>
          <v-list-item
            key="yarn lint"
            @click="
              stdMessagesDialog = true;
              terminalTitle = 'lint';
              lintFiles({ name: applicationName });
            "
          >
            <v-list-item-title>Lint Files</v-list-item-title>
          </v-list-item>
          <!-- <v-divider></v-divider>
          <v-list-item @click="dialog = true" key="newYarnAdd">
            <v-list-item-title>Add node module</v-list-item-title>
          </v-list-item>
          <v-list-item @click="dialog = true" key="yarnReinstall">
            <v-list-item-title>Reinstall node modules</v-list-item-title>
          </v-list-item> -->
        </v-list>
      </v-menu>
      <v-menu offset-y dark>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            color="action darken-1"
            tile
            text
            dark
            small
            v-bind="attrs"
            v-on="on"
          >
            DNA
          </v-btn>
        </template>
        <v-list dense>
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-list-item v-on="on" key="testDna"
                @click="
                  stdMessagesDialog = true;
                  terminalTitle = 'Test DNA';
                  terminalTab = 2;
                  testDna({ name: applicationName });
                "
              >
                <v-list-item-title>Test DNA</v-list-item-title>
              </v-list-item>
              </template>
            <span>Each successful test reinstalls the DNA into the Developer Conductor for each agent</span>
          </v-tooltip>
          <v-list-item key="addEntryType">
            <v-list-item-title>Add Entry Type</v-list-item-title>
          </v-list-item>
          <v-list-item key="duplicateEntryType" @click="duplicateEntryDialog = true">
            <v-list-item-title>Duplicate Entry Type</v-list-item-title>
          </v-list-item>
          <v-list-item key="renameEntryType" @click="renameEntryDialog = true">
            <v-list-item-title>Rename Entry Type</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
      <v-menu offset-y dark>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            color="action darken-1"
            tile
            text
            dark
            small
            v-bind="attrs"
            v-on="on"
          >
            Conductor
          </v-btn>
        </template>
        <v-list dense>
          <v-list-item key="deleteConductorFiles">
            <v-list-item-title>Reset Conductor Files</v-list-item-title>
          </v-list-item>
          <v-divider></v-divider>
          <v-list-item key="manageDemoAgents" @click="testAgentsDialog = true">
            <v-list-item-title>Manage Demo Agent Apps</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
      <v-menu offset-y dark>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            color="action darken-1"
            tile
            text
            dark
            small
            v-bind="attrs"
            v-on="on"
          >
            Window
          </v-btn>
        </template>
        <v-list dense>
          <v-list-item @click="stdMessagesDialog = true" key="bashTerminals">
            <v-list-item-title>Terminals</v-list-item-title>
          </v-list-item>
          <v-divider></v-divider>
        </v-list>
      </v-menu>
      <v-spacer></v-spacer>
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            color="action darken-1"
            tile
            text
            dark
            small
            v-bind="attrs"
            v-on="on"
          >
            {{ applicationName }}
            <v-icon class="ml-1">mdi-source-branch</v-icon>
          </v-btn>
        </template>
        <span>Show the branch graph</span>
      </v-tooltip>
      <agent />
    </v-app-bar>
    <v-row no-gutters height="100%">
      <v-col>
        <split
          :key="cwHeight"
          :style="`height: ${cwHeight}px; width: 100%;`"
          :gutterSize="2"
        >
          <split-area :size="22">
            <file-tree
              @dir-selected="dirSelected"
              @file-selected="fileSelected"
              :height="cwHeight"
            />
          </split-area>
          <split-area :size="78">
            <editor :height="cwHeight" />
          </split-area>
        </split>
      </v-col>
    </v-row>
    <v-dialog v-model="stdMessagesDialog" persistent max-width="700px">
      <v-card dark>
        <v-card-text class="pa-2">
          <v-container>
            <v-row no-gutters>
              <v-col cols="12" class="black">
                <v-tabs
                  v-model="terminalTab"
                  dark
                  show-arrows
                  height="40"
                  ripple
                >
                  <v-tabs-slider></v-tabs-slider>
                  <v-tab>
                    App
                    <v-icon right small>
                      mdi-application
                    </v-icon>
                  </v-tab>
                  <v-tab-item key="appServerTab">
                    <div class="std-container">
                      <ul class="pb-10 pl-1">
                        <li
                          v-for="(message, i) in appServerMessages"
                          :key="i"
                          class="message"
                        >
                          <message :message="message" :key="i" />
                        </li>
                      </ul>
                    </div>
                  </v-tab-item>
                  <v-tab>
                    Lint
                    <v-icon @click="terminalTab = 1;lintFiles({ name: applicationName })"
                      >mdi-eslint</v-icon
                    >
                  </v-tab>
                  <v-tab-item key="lintTab">
                    <div class="std-container">
                      <ul class="pb-10 pl-1">
                        <li
                          v-for="(message, i) in stdOutMessages"
                          :key="message"
                          class="message"
                        >
                          <message :message="message" :key="i" />
                        </li>
                      </ul>
                    </div>
                  </v-tab-item>
                  <v-tab>
                    DNA
                    <v-avatar size="25" class="ml-2" @click="testDna({ name: applicationName })">
                      <img
                        contain
                        width="25"
                        :src="require('@/assets/holochain-halo.png')"
                      />
                    </v-avatar>
                  </v-tab>
                  <v-tab-item key="testDnaTab">
                    <div class="std-container">
                      <ul class="pb-10 pl-1">
                        <li
                          v-for="(message, i) in testDnaMessages"
                          :key="i"
                          class="message"
                        >
                          <message :message="message" :key="i" />
                        </li>
                      </ul>
                    </div>
                  </v-tab-item>
                </v-tabs>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            v-if="!showRefresh"
            color="action darken-1"
            text
            @click="stdMessagesDialog = false"
          >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="addDnaDialog" persistent max-width="600px">
      <v-card dark>
        <v-card-title>
          Clone a DNA Template
        </v-card-title>
        <v-card-text class="pa-3 pt-0">
          <v-container>
            <v-row height="100%">
              <v-col
                v-for="(template, index) in dnaTemplates"
                :key="index"
                cols="12"
                sm="6"
                md="4"
                lg="4"
              >
                <dna-template :key="index" :template="template" :details="true">
                </dna-template>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="action darken-1" text @click="addDnaDialog = false">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="addWebPartDialog" persistent max-width="600px">
      <v-card dark>
        <v-card-title>
          {{webPartDialogTitle}} called <v-text-field class="ml-2" v-model="webPartName"></v-text-field>
        </v-card-title>
        <v-card-text class="pa-3 pt-0">
          <v-container>
            <v-row height="100%">
              <v-col
                v-for="(template, index) in webPartTemplates"
                :key="index"
                cols="12"
                sm="6"
                md="4"
                lg="4"
              >
                <web-part-template
                  :key="index"
                  :template="template"
                  :webPartName="webPartName"
                  :webPartType="webPartType"
                  :details="true"
                >
                </web-part-template>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="action darken-1" text @click="addWebPartDialog = false">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="renameEntryDialog" persistent max-width="600px">
      <v-card dark>
        <v-card-title>
          Rename entry type
        </v-card-title>
        <v-card-text class="pa-3 pt-0">
          <v-container>
            <v-row height="100%">
              <v-col
                cols="6"
              >
              <v-combobox
                v-model="oldName"
                :items="entryTypes"
                label="Entry Type to rename"
                hint="Select one"
                persistent-hint
                outlined
                dense
              ></v-combobox>
              </v-col>
              <v-col
                cols="6"
              >
                <v-text-field
                  v-model="newName"
                  label="New Entry Type name"
                  hint="Type new name in the box"
                  persistent-hint
                  outlined
                  dense
                ></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="action darken-1" text @click="renameEntryDialog = false">
            Close
          </v-btn>
          <v-btn color="action darken-1" text @click="renameEntryType({ name: applicationName, oldName, newName }); renameEntryDialog = false">
            Rename
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="duplicateEntryDialog" persistent max-width="600px">
      <v-card dark>
        <v-card-title>
          Duplicate entry type
        </v-card-title>
        <v-card-text class="pa-3 pt-0">
          <v-container>
            <v-row height="100%">
              <v-col
                cols="6"
              >
              <v-combobox
                v-model="oldName"
                :items="entryTypes"
                label="Entry Type to rename"
                hint="Select one"
                persistent-hint
                outlined
                dense
              ></v-combobox>
              </v-col>
              <v-col
                cols="6"
              >
                <v-text-field
                  v-model="newName"
                  label="New Entry Type name"
                  hint="Type new name in the box"
                  persistent-hint
                  outlined
                  dense
                ></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="action darken-1" text @click="duplicateEntryDialog = false">
            Close
          </v-btn>
          <v-btn color="action darken-1" text @click="duplicateEntryType({ name: applicationName, oldName, newName }); duplicateEntryDialog = false">
            Rename
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="testAgentsDialog" max-width="800px">
      <test-agents />
    </v-dialog>
    <v-navigation-drawer
      v-model="myappDrawerOpen"
      fixed
      dark
      class="overflow-visible pa-0"
      right
      :width="this.$vuetify.breakpoint.lgAndUp ? 800 : 600"
    >
      <v-card dark dense flat class="fill-height">
        <v-system-bar window dark>
          <span v-if="newApplication">New Application</span>
          <span v-else>New Module</span>
          <v-spacer></v-spacer>
          <v-icon v-if="shop === false" @click="shop = true">mdi-store-outline</v-icon>
          <v-icon @click="myappDrawerOpen = false">mdi-close</v-icon>
        </v-system-bar>
        <v-card-text v-if="newApplication">
          <v-text-field
            label="Name of your new Holochain App"
            v-model="name"
            dense
          ></v-text-field>
        </v-card-text>
        <shop v-if="shop" @show-product="showProduct"/>
        <product v-else :product="selectedProduct" @install="install"/>
      </v-card>
    </v-navigation-drawer>
  </v-card>
</template>
<script>
import { mapState, mapActions, mapMutations } from 'vuex'
export default {
  name: 'Builder',
  components: {
    Agent: () => import('@/components/Agent.vue'),
    FileTree: () => import('@/components/FileTree.vue'),
    Editor: () => import('@/components/Editor.vue'),
    Message: () => import('@/components/Message.vue'),
    DnaTemplate: () => import('@/components/DnaTemplate.vue'),
    WebPartTemplate: () => import('@/components/WebPartTemplate.vue'),
    TestAgents: () => import('@/components/TestAgents.vue'),
    Shop: () => import('@/components/shop/Shop.vue'),
    Product: () => import('@/components/shop/Product.vue')
  },
  data () {
    return {
      shop: true,
      cwHeight: 700,
      terminalTitle: 'Terminal',
      myappDrawerOpen: false,
      stdMessagesDialog: false,
      createApplicationDialog: false,
      webPartDialogTitle: '',
      addDnaDialog: false,
      addWebPartDialog: false,
      renameEntryDialog: false,
      duplicateEntryDialog: false,
      testAgentsDialog: false,
      webPartName: '',
      webPartType: '',
      parentDir: '',
      name: '',
      terminalTab: 0,
      oldName: [],
      newName: '',
      entryTypes: [
        'project'
      ],
      selectedProduct: {
        uuid: '',
        name: '',
        type: '',
        price: '',
        screens: [],
        developer: '',
        plugin: ''
      },
      newApplication: true
    }
  },
  computed: {
    ...mapState('builder', [
      'applicationName',
      'stdOutMessages',
      'appServerMessages',
      'socketServerMessages',
      'showRefresh',
      'dnaTemplates',
      'webPartTemplates',
      'testDnaMessages'
    ]),
    ...mapState('conductor', ['conductor', 'applications'])
  },
  methods: {
    ...mapActions('builder', [
      'createApplication',
      'openApplication',
      'createDirectory',
      'createFile',
      'recurseApplicationFiles',
      'lintFiles',
      'serveWebApp',
      'socketServer',
      'getTemplates',
      'getWebPartTemplates',
      'cloneSocket',
      'cloneDevConductor',
      'testDna',
      'renameEntryType',
      'duplicateEntryType'
    ]),
    ...mapMutations('builder', ['setApplicationName']),
    setCodeWindowHeight () {
      this.cwHeight = this.$el.clientHeight - 44
    },
    showProduct (product) {
      this.selectedProduct = product
      this.shop = false
    },
    install () {
      this.stdMessagesDialog = true
      this.myappDrawerOpen = false
      this.createApplication({ name: this.name, plugin: this.selectedProduct.plugin })
    },
    dirSelected (directory) {
      this.fileSelected(directory)
    },
    fileSelected (file) {
      this.parentDir = `${file.parentDir}${file.name}`
      this.setApplicationName(`${this.parentDir.split('/')[1]}`)
    },
    newFolder () {
      this.createDirectory({ parentDir: this.parentDir, name: 'components' })
    },
    newFile () {
      this.createFile({ parentDir: this.parentDir, name: 'something.js' })
    },
    scrollToEnd () {
      var container = this.$el.querySelector('#container')
      container.scrollTop = container.scrollHeight
    }
  },
  created () {
    this.$store.dispatch('builder/initialise')
  },
  mounted () {
    this.setCodeWindowHeight()
  }
}
</script>
<style scoped>
.std-container {
  box-sizing: border-box;
  overflow-y: auto;
  background-color: black;
  height: 300px;
}
ul {
  list-style-type: none;
}
</style>
