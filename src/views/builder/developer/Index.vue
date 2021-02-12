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
            File
          </v-btn>
        </template>
        <v-list dense>
          <v-list-item
            key="newShellProject"
          >
            <v-list-item-title>New Application</v-list-item-title>
          </v-list-item>
          <v-list-item
            @click="openShop({
              text: 'Application',
              action: 'Create New Application from this Preset',
              event: 'install',
              categoryId: 49
            })"
            key="newProject"
          >
            <v-list-item-title>New Application From Preset</v-list-item-title>
          </v-list-item>
          <v-list-item
            v-if="applicationName"
            @click="openShop({
              text: 'Vue Cli Plugin (Application)',
              action: `Create New vue-cli-plugin-${organisation.name}-app-${applicationName}`,
              event: 'app-plugin-template',
              categoryId: 491
            })"
            key="newCliApp"
          >
            <v-list-item-title v-if="organisation">New vue-cli-plugin-{{ organisation.name }}-app-{{ applicationName }}</v-list-item-title>
          </v-list-item>
          <v-list-item
            v-if="applicationName"
            @click="openShop({
              text: 'Vue Cli Plugin (Module)',
              action: `Create New vue-cli-plugin-${organisation.name}-module-${applicationName}`,
              event: 'module-plugin-template',
              categoryId: 555
            })"
            key="newCliModule"
          >
            <v-list-item-title>New vue-cli-plugin-{{ organisation.name }}-module-{{ applicationName }}</v-list-item-title>
          </v-list-item>
          <v-divider></v-divider>
          <v-list-group
            no-action
            @click.stop
          >
            <template v-slot:activator>
              <v-list-item-title>Open Application</v-list-item-title>
            </template>
            <v-list-item v-for="application in applications"
              @click="stdMessagesDialog = true;
                resetConductor();
                clearCommits().then(() => getStatus({ name: application.name }));
                terminalTab = 0;
                reinstallNodeModules({ name: applicationName });"
              :key="`${application.name}application`"
              class="pl-10"
            >
              <v-list-item-title>{{ application.name }}</v-list-item-title>
            </v-list-item>
          </v-list-group>
          <v-divider></v-divider>
          <v-list-group
            no-action
            @click.stop
          >
            <template v-slot:activator>
              <v-list-item-title>Open Plugin</v-list-item-title>
            </template>
            <v-list-item v-for="plugin in plugins"
              @click="stdMessagesDialog = true;
                resetConductor();
                clearCommits().then(() => getStatus({ name: plugin.name }));
                terminalTab = 0;"
              :key="`${plugin.name}plugin`"
              class="pl-10"
            >
              <v-list-item-title>{{ plugin.name.replace('vue-cli-plugin-', '') }}</v-list-item-title>
            </v-list-item>
          </v-list-group>
          <v-divider></v-divider>
          <v-list-item>
            <v-list-item-title class="grey--text">Package for Holo</v-list-item-title>
          </v-list-item>
          <v-list-item>
            <v-list-item-title class="grey--text">Package for Holochain</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
      <v-menu offset-y dark v-if="applicationName">
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
            v-if="applicationName !== ''"
            key="addModule"
            @click="openShop({
              text: 'Module',
              action: `Add Module`,
              event: 'install',
              categoryId: 5
            })">
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
      <v-menu offset-y dark v-if="applicationName">
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
            Test & Demo
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
          <v-list-item key="manageDemoAgents"  v-if="conductorRunning" @click="testAgentsDialog = true;fetchAgents(conductor)">
            <v-list-item-title>Demo Agents</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
      <v-menu offset-y dark v-if="applicationName">
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
          <v-list-item v-if="!appServerRunning"
            key="startWebServer"
            @click="
              stdMessagesDialog = true;
              terminalTab = 1;
              startWebServer({ name: applicationName });
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
            "
          >
            <v-list-item-title>Stop Web Server</v-list-item-title>
          </v-list-item>
          <v-list-item v-if="!conductorRunning"
            key="startConductor"
            @click="
              stdMessagesDialog = true;
              terminalTab = 3;
              startConductor();
            "
          >
            <v-list-item-title>Start Conductor</v-list-item-title>
          </v-list-item>
          <v-list-item key="resetConductorFiles" @click="resetConductor">
            <v-list-item-title>Reset Conductor</v-list-item-title>
          </v-list-item>
          <v-divider></v-divider>
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
          <v-list-item key="yarnReinstall"
          @click="
              stdMessagesDialog = true;
              terminalTab = 0;
              reinstallNodeModules({ name: applicationName });
            "
          >
            <v-list-item-title>Reinstall Node Modules</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
      <v-menu offset-y dark dense v-if="applicationName">
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
           <v-list-item to="/builder/kanban">
            <v-list-item-title>Kanban</v-list-item-title>
          </v-list-item>
          <v-divider></v-divider>
          <v-list-item
            key="refreshFiles"
            @click="
              stdMessagesDialog = true;
              terminalTab = 0;
              getStatus({ name: applicationName });
              fileStatusDrawerOpen = true
            ">
            <v-list-item-title>Review Your Changes</v-list-item-title>
          </v-list-item>
          <v-list-item>
            <v-list-item-title class="grey--text">Get Shared Changes</v-list-item-title>
          </v-list-item>
          <v-list-item>
            <v-list-item-title class="grey--text">Share Your Changes</v-list-item-title>
          </v-list-item>
          <v-divider></v-divider>
          <v-list-item
            key="publishPlugin"
            @click="
              stdMessagesDialog = true;
              terminalTab = 0;
              publishPlugin({ name: applicationName });
            ">
            <v-list-item-title>Publish Plugin</v-list-item-title>
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
            {{ organisationApplicationName }} <span v-if="currentBranch">({{ currentBranch.branch }})</span>
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
                    Web Server
                    <v-icon v-if="!appServerRunning" right small @click="startWebServer({ name: applicationName })">
                      mdi-play-circle-outline
                    </v-icon>
                    <v-icon v-else right small @click="stopWebServer()">
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
                    <v-icon v-if="conductorRunning" right small @click="resetConductor">
                      mdi-stop-circle-outline
                    </v-icon>
                    <v-icon v-else right small @click="startConductor">
                      mdi-play-circle-outline
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
    <v-dialog v-model="testAgentsDialog" persistent max-width="800px">
      <test-agents @close="testAgentsDialog = false" />
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
          <span>New {{ filter.text }}</span>
          <v-spacer></v-spacer>
          <v-icon v-if="shop === false" @click="shop = true">mdi-store-outline</v-icon>
          <v-icon @click="myappDrawerOpen = false; shop = true  ">mdi-close</v-icon>
        </v-system-bar>
        <v-card-text v-if="filter.text === 'Application' && !shop">
          <v-text-field
            label="Name of your new Holochain App"
            v-model="name"
            dense
          ></v-text-field>
        </v-card-text>
        <shop v-if="shop" :items="items" :filter="filter" @show-product="showProduct"/>
        <product v-else :product="selectedProduct" :filter="filter" @install="install" @app-plugin-template="appPluginTemplate" @module-plugin-template="modulePluginTemplate"/>
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
      <file-sharing @close="fileStatusDrawerOpen = false" @change-branch="stdMessagesDialog = true" />
    </v-navigation-drawer>
  </v-card>
</template>
<script>
import { mapState, mapActions, mapMutations } from 'vuex'
export default {
  name: 'Builder',
  components: {
    Agent: () => import('@/components/Agent.vue'),
    FileTree: () => import('@/components/builder/developer/FileTree.vue'),
    FileSharing: () => import('@/components/builder/developer/FileSharing.vue'),
    Editor: () => import('@/components/builder/developer/Editor.vue'),
    Messages: () => import('@/components/Messages.vue'),
    DnaTemplate: () => import('@/components/builder/developer/DnaTemplate.vue'),
    WebPartTemplate: () => import('@/components/builder/developer/WebPartTemplate.vue'),
    TestAgents: () => import('@/components/builder/developer/TestAgents.vue'),
    Shop: () => import('@/components/builder/shop/Shop.vue'),
    Product: () => import('@/components/builder/shop/Product.vue')
  },
  data () {
    return {
      refreshKey: 0,
      shop: true,
      cwHeight: 700,
      organisationApplicationName: this.organisation,
      myappDrawerOpen: false,
      fileStatusDrawerOpen: false,
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
      filter: {
        filter: '',
        text: '',
        action: '',
        categoryId: ''
      },
      initialCategory: 0
    }
  },
  computed: {
    ...mapState('builderDeveloper', [
      'conductor',
      'applications',
      'plugins',
      'applicationName',
      'dnaPaths',
      'dnaEntryTypes',
      'stdOutMessages',
      'appServerMessages',
      'appServerRunning',
      'conductorMessages',
      'conductorRunning',
      'finished',
      'dnaTemplates',
      'webPartTemplates',
      'testDnaMessages',
      'currentBranch',
      'currentFiles',
      'sharedFiles'
    ]),
    ...mapState('builderShop', ['applicationItems', 'moduleItems', 'cliPluginAppItems', 'cliPluginModuleItems']),
    ...mapState('builderOrganisations', ['organisation']),
    items () {
      switch (this.filter.text) {
        case 'Application':
          return this.applicationItems
        case 'Module':
          return this.moduleItems
        case 'Vue Cli Plugin (Application)':
          return this.cliPluginAppItems
        case 'Vue Cli Plugin (Module)':
          return this.cliPluginModuleItems
        default:
          return []
      }
    }
  },
  methods: {
    ...mapActions('builderDeveloper', [
      'createApplication',
      'addModule',
      'openApplication',
      'createDirectory',
      'createFile',
      'getStatus',
      'clearCommits',
      'lintFiles',
      'reinstallNodeModules',
      'startWebServer',
      'stopWebServer',
      'startConductor',
      'stopConductor',
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
      'getCurrentChanges',
      'createAppPluginFromTemplate',
      'createModulePluginFromTemplate',
      'publishPlugin'
    ]),
    ...mapMutations('builderDeveloper', ['setApplicationName', 'socketFinished']),
    setCodeWindowHeight () {
      this.cwHeight = this.$el.clientHeight - 44
    },
    openShop (filter) {
      this.filter = { ...filter }
      this.myappDrawerOpen = true
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
      switch (this.filter.text) {
        case 'Application':
          this.createApplication({ name: this.name, preset: this.selectedProduct.preset })
          break
        case 'Module':
          this.addModule({ name: this.applicationName, plugin: this.selectedProduct.plugin })
          break
      }
    },
    appPluginTemplate (product) {
      this.stdMessagesDialog = true
      this.myappDrawerOpen = false
      this.terminalTab = 0
      this.createAppPluginFromTemplate({ name: this.applicationName, product })
    },
    modulePluginTemplate (product) {
      this.stdMessagesDialog = true
      this.myappDrawerOpen = false
      this.terminalTab = 0
      this.createModulePluginFromTemplate({ name: this.applicationName, product })
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
    resetConductor () {
      this.stdMessagesDialog = true
      this.terminalTab = 3
      this.$store.dispatch('builderDeveloper/resetConductor')
    },
    scrollToEnd () {
      var container = this.$el.querySelector('#container')
      container.scrollTop = container.scrollHeight
    }
  },
  watch: {
    selectedEntryType (entryType) {
      this.selectedEntryTypeHint = `DNA - ${entryType.parentDir.split('/')[3]}`
    },
    applicationName (appName) {
      if (this.organisation) {
        this.organisationApplicationName = `${this.organisation.name} - ${appName}`
      } else {
        this.organisationApplicationName = `${appName}`
      }
    }
  },
  mounted () {
    this.$store.dispatch('builderShop/initialise')
    this.$store.dispatch('builderOrganisations/initialise').then(() => {
      this.$store.dispatch('builderDeveloper/getApplications')
      this.$store.dispatch('builderDeveloper/getPlugins')
    })
    this.$store.dispatch('builderDeveloper/initialise')
      .then(() => {
        this.$store.dispatch('builderDeveloper/getDnaPaths')
        this.$store.dispatch('builderDeveloper/getDnaEntryTypes')
      })
    this.setCodeWindowHeight()
  }
}
</script>
