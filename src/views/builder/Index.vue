<template>
  <v-card height="100%" width="100%">
    <v-app-bar app dark dense tile class="pa-0">
      <v-avatar size="30" class="mt-n1 mr-2">
        <v-img contain :src="require('@/assets/holochain-halo.png')">
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
            Application
          </v-btn>
        </template>
        <v-list dense>
          <v-list-item
            @click="openShop(true)"
            key="newApplication"
          >
            <v-list-item-title>New Holochain App</v-list-item-title>
          </v-list-item>
          <v-list-item
            key="addModule"
            @click="openShop(false)"
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
          <v-list-item key="addComponent">
            <v-list-item-title class="grey--text">Add Component</v-list-item-title>
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
            DNA
          </v-btn>
        </template>
        <v-list dense>
          <v-list-item v-for="path in dnaPaths" :key="path.uuid"
            @click="
              stdMessagesDialog = true;
              terminalTab = 2;
              testDna({ name: applicationName, path: `${path.parentDir}${path.name}` });
            "
          >
            <v-list-item-title>Test '{{path.name}}'' DNA</v-list-item-title>
          </v-list-item>
          <v-divider></v-divider>
          <v-list-item
            key="newDna"
            @click="
              getTemplates();
              addDnaDialog = true;
            "
          >
            <v-list-item-title class="grey--text">Add DNA</v-list-item-title>
          </v-list-item>
          <v-list-item key="addZome">
            <v-list-item-title class="grey--text">Add Zome</v-list-item-title>
          </v-list-item>
          <v-list-item key="addEntryType">
            <v-list-item-title class="grey--text">Add Entry Type</v-list-item-title>
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
            Dev Conductor
          </v-btn>
        </template>
        <v-list dense>
          <v-list-item v-if="conductorStopped"
            key="startConductor"
            @click="
              stdMessagesDialog = true;
              terminalTab = 3;
              startConductor();
              conductorStopped = false
            "
          >
            <v-list-item-title>Start</v-list-item-title>
          </v-list-item>
          <v-list-item v-else
            key="stopConductor"
            @click="
              stdMessagesDialog = true;
              terminalTab = 3;
              stopConductor();
              conductorStopped = true
            "
          >
            <v-list-item-title>Stop</v-list-item-title>
          </v-list-item>
          <v-list-item key="resetConductorFiles"
            @click="stdMessagesDialog = true;
              terminalTab = 3;
              resetConductor();
              conductorStopped = true"
            >
            <v-list-item-title>Reset</v-list-item-title>
          </v-list-item>
          <v-list-item key="manageDemoAgents" @click="testAgentsDialog = true;fetchAgents(conductor)">
            <v-list-item-title>Agents</v-list-item-title>
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
            Console
          </v-btn>
        </template>
        <v-list dense>
          <v-list-item
            key="showTerminal"
            @click="stdMessagesDialog = true"
          >
          <v-list-item-title>Show</v-list-item-title>
          </v-list-item>
          <v-list-item v-if="appServerStopped"
            key="startWebServer"
            @click="
              stdMessagesDialog = true;
              terminalTab = 1;
              startWebServer({ name: applicationName });
              appServerStopped = false
            "
          >
          <v-list-item-title>Start Web Server</v-list-item-title>
          </v-list-item>
          <v-list-item v-else
            key="stopWebServer"
            @click="
              stdMessagesDialog = true;
              terminalTab = 1;
              stopWebServer();
              appServerStopped = true
            "
          >
            <v-list-item-title>Stop Web Server</v-list-item-title>
          </v-list-item>
          <v-list-item
            key="yarn lint"
            @click="
              stdMessagesDialog = true;
              terminalTab = 0;
              lintFiles({ name: applicationName });
            "
          >
            <v-list-item-title>Lint Web App Files</v-list-item-title>
          </v-list-item>
          <v-list-item key="newYarnAdd">
            <v-list-item-title class="grey--text">Add Node Module</v-list-item-title>
          </v-list-item>
          <v-list-item key="yarnReinstall">
            <v-list-item-title class="grey--text">Reinstall Node Modules</v-list-item-title>
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
            Collaborate
          </v-btn>
        </template>
        <v-list dense>
           <v-list-item
            key="refreshFiles"
            @click="fileStatusDrawerOpen = true;
            recurseApplicationFiles({ name: applicationName });
            getCurrentChanges();
            getMergeTargetChanges()"
          >
            <v-list-item-title>Get Status</v-list-item-title>
          </v-list-item>
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
            {{ applicationName }} - <span v-if="currentBranch">{{ currentBranch.branch }}</span>
          </v-btn>
        </template>
        <span>Show the project details</span>
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
              :key="refreshKey"
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
    <v-dialog v-model="stdMessagesDialog" persistent max-width="800px">
      <v-card dark outlined>
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
                    Console
                    <v-icon @click="terminalTab = 1;lintFiles({ name: applicationName })"
                      >mdi-bash</v-icon
                    >
                  </v-tab>
                  <v-tab-item key="lintTab">
                    <messages :messages="stdOutMessages" />
                  </v-tab-item>
                  <v-tab>
                    App Server
                    <v-icon v-if="appServerStopped" right small @click="startWebServer({ name: applicationName });appServerStopped = false">
                      mdi-play-circle-outline
                    </v-icon>
                    <v-icon v-else right small @click="stopWebServer()();appServerStopped = true">
                      mdi-stop-circle-outline
                    </v-icon>
                  </v-tab>
                  <v-tab-item key="appServerTab">
                    <messages :messages="appServerMessages" />
                  </v-tab-item>
                  <v-tab>
                    DNA Tests
                    <v-avatar size="25" class="ml-2">
                      <img
                        contain
                        width="25"
                        :src="require('@/assets/holochain-halo.png')"
                      />
                    </v-avatar>
                  </v-tab>
                  <v-tab-item key="testDnaTab">
                    <messages :messages="testDnaMessages" />
                  </v-tab-item>
                  <v-tab>
                    Dev Conductor
                    <v-icon v-if="conductorStopped" right small @click="startConductor();conductorStopped = false">
                      mdi-play-circle-outline
                    </v-icon>
                    <v-icon v-else right small @click="stopConductor();conductorStopped = true">
                      mdi-stop-circle-outline
                    </v-icon>
                  </v-tab>
                  <v-tab-item key="conductorTab">
                    <messages :messages="conductorMessages" />
                  </v-tab-item>
                </v-tabs>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
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
                  @close="addWebPartDialog = false;
                    stdMessagesDialog = true;
                    terminalTab = 0;"
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
                v-model="selectedEntryType"
                :items="dnaEntryTypes"
                label="Entry Type to Rename"
                :hint="selectedEntryTypeHint"
                return-object
                item-text="name"
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
          <v-btn color="action darken-1" text @click="renameEntryType({ name: applicationName, entryTypeToDuplicate: selectedEntryType, newName }); renameEntryDialog = false">
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
            <v-row>
              <v-col
                cols="6"
              >
              <v-combobox
                v-model="selectedEntryType"
                :items="dnaEntryTypes"
                label="Entry Type to Duplicate"
                :hint="selectedEntryTypeHint"
                return-object
                item-text="name"
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
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="action darken-1" text @click="duplicateEntryDialog = false">
            Close
          </v-btn>
          <v-btn color="action darken-1" text @click="duplicateEntryType({ name: applicationName, entryTypeToDuplicate: selectedEntryType, newName }); duplicateEntryDialog = false">
            Duplicate
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
      :width="this.$vuetify.breakpoint.lgAndUp ? 1000 : 800"
    >
      <v-card dark dense flat class="fill-height">
        <v-system-bar window dark>
          <span v-if="newApplication">New Application</span>
          <span v-else>New Module</span>
          <v-spacer></v-spacer>
          <v-icon v-if="shop === false" @click="shop = true">mdi-store-outline</v-icon>
          <v-icon @click="myappDrawerOpen = false; shop = true  ">mdi-close</v-icon>
        </v-system-bar>
        <v-card-text v-if="newApplication && !shop">
          <v-text-field
            label="Name of your new Holochain App"
            v-model="name"
            dense
          ></v-text-field>
        </v-card-text>
        <shop v-if="shop" :items="items" :initialCategory="initialCategory" @show-product="showProduct"/>
        <product v-else :product="selectedProduct" :newApplication="newApplication" @install="install"/>
      </v-card>
    </v-navigation-drawer>
    <v-navigation-drawer
      v-model="fileStatusDrawerOpen"
      fixed
      dark
      class="overflow-visible pa-0"
      right
      :width="this.$vuetify.breakpoint.lgAndUp ? 1100 : 900"
    >
      <file-sharing @close="fileStatusDrawerOpen = false"/>
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
    FileSharing: () => import('@/components/FileSharing.vue'),
    Editor: () => import('@/components/Editor.vue'),
    Messages: () => import('@/components/Messages.vue'),
    DnaTemplate: () => import('@/components/DnaTemplate.vue'),
    WebPartTemplate: () => import('@/components/WebPartTemplate.vue'),
    TestAgents: () => import('@/components/TestAgents.vue'),
    Shop: () => import('@/components/shop/Shop.vue'),
    Product: () => import('@/components/shop/Product.vue')
  },
  data () {
    return {
      refreshKey: 0,
      shop: true,
      cwHeight: 700,
      terminalTitle: 'Terminal',
      myappDrawerOpen: false,
      fileStatusDrawerOpen: false,
      stdMessagesDialog: false,
      createApplicationDialog: false,
      webPartDialogTitle: '',
      conductorStopped: true,
      appServerStopped: true,
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
      selectedEntryType: [],
      selectedEntryTypeHint: '',
      newName: '',
      selectedProduct: {
        uuid: '',
        name: '',
        type: '',
        price: '',
        screens: [],
        developer: '',
        plugin: ''
      },
      newApplication: true,
      initialCategory: 0
    }
  },
  computed: {
    ...mapState('builder', [
      'conductor',
      'applicationName',
      'dnaPaths',
      'dnaEntryTypes',
      'stdOutMessages',
      'appServerMessages',
      'conductorMessages',
      'finished',
      'dnaTemplates',
      'webPartTemplates',
      'testDnaMessages',
      'currentBranch',
      'currentFiles',
      'sharedFiles'
    ]),
    ...mapState('appStore', ['applicationItems', 'moduleItems']),
    items () {
      if (this.newApplication) return this.applicationItems
      if (!this.newApplication) return this.moduleItems
      return []
    }
  },
  methods: {
    ...mapActions('builder', [
      'createApplication',
      'addModule',
      'openApplication',
      'createDirectory',
      'createFile',
      'recurseApplicationFiles',
      'lintFiles',
      'startWebServer',
      'stopWebServer',
      'startConductor',
      'stopConductor',
      'resetConductor',
      'fetchAgents',
      'getTemplates',
      'getWebPartTemplates',
      'cloneSocket',
      'cloneDevConductor',
      'testDna',
      'getDnaPaths',
      'getDnaEntryTypes',
      'renameEntryType',
      'duplicateEntryType',
      'getMergeTargetChanges',
      'getCurrentChanges'
    ]),
    ...mapMutations('builder', ['setApplicationName', 'socketFinished']),
    setCodeWindowHeight () {
      this.cwHeight = this.$el.clientHeight - 44
    },
    openShop (isNewApplication) {
      this.myappDrawerOpen = true
      this.newApplication = isNewApplication
      if (isNewApplication) {
        this.initialCategory = 49
      } else {
        this.initialCategory = 5
      }
      this.shop = true
    },
    showProduct (product) {
      this.selectedProduct = product
      this.shop = false
    },
    install () {
      this.stdMessagesDialog = true
      this.myappDrawerOpen = false
      this.terminalTab = 0
      if (this.newApplication) {
        this.createApplication({ name: this.name, preset: this.selectedProduct.preset })
      } else {
        this.addModule({ name: this.applicationName, plugin: this.selectedProduct.plugin })
      }
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
  watch: {
    selectedEntryType (entryType) {
      this.selectedEntryTypeHint = `DNA - ${entryType.parentDir.split('/')[3]}`
    }
  },
  created () {
    this.$store.dispatch('builder/initialise')
    this.$store.dispatch('appStore/initialise')
  },
  mounted () {
    this.$store.dispatch('builder/getDnaPaths')
    this.$store.dispatch('builder/getDnaEntryTypes')
    this.setCodeWindowHeight()
  }
}
</script>
