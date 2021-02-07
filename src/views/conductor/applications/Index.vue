<template>
  <v-card height="100%" width="100%">
    <v-app-bar app dark dense tile class="pa-0">
      <v-avatar size="30" class="mt-n1 mr-2">
        <v-img contain :src="require('@/assets/holochain-halo.png')">
        </v-img>
      </v-avatar>
      <v-toolbar-title class="mt-n1 mr-1 font-weight-black">
        Conductor Applications
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click="newApplication">
        <v-icon>mdi-application-import</v-icon>
      </v-btn>
      <agent />
    </v-app-bar>
    <v-container fluid>
      <v-row dense>
        <v-col
          v-for="conductorApp in conductorApps"
          :key="conductorApp.uuid"
          cols="12"
          lg="3"
          md="4"
          sm="6"
        >
          <v-card elevation="5">
            <v-img
              :src="conductorApp.preview"
              contain
              class="white--text align-end"
              gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
              height="200px"
            >
              <v-card-title v-text="conductorApp.name"></v-card-title>
            </v-img>
            <v-card-actions>
              <v-btn v-if="conductorApp.agentPubKey" small icon @click="installDna({ conductorApp, dnaPaths })">
                <v-icon>
                  mdi-application-import
                </v-icon>
              </v-btn>
              <v-btn v-if="conductorApp.cellData" small icon :href="`http://localhost:5200?agentPubKey=${encodeURIComponent(agent.agentPubKey)}&${cells}&port=27107`" target="_blank">
                <v-icon>
                  mdi-application
                </v-icon>
              </v-btn>
              <v-spacer></v-spacer>
              <v-icon @click="$emit('delete-conductor-app', conductorApp)" color="warning">
                mdi-delete-outline
              </v-icon>
              <v-icon @click="openAgentDetail">
                mdi-details
              </v-icon>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
    <v-navigation-drawer
      v-model="appDrawerOpen"
      fixed
      dark
      class="overflow-visible pa-0"
      right
      :width="this.$vuetify.breakpoint.lgAndUp ? 800 : 600"
    >
      <v-card dark dense flat class="fill-height">
        <v-system-bar window dark>
          <span>Application Details</span>
          <v-spacer></v-spacer>
          <v-icon @click="appDrawerOpen = false">mdi-close</v-icon>
        </v-system-bar>
        <v-card-text>
          <conductor-application-edit
            :key="conductorApp.uuid"
            :conductorApp="conductorApp"
            @close="appDrawerOpen = false"/>
        </v-card-text>
      </v-card>
    </v-navigation-drawer>
  </v-card>
</template>
<script>
import { mapState } from 'vuex'
import { v4 as uuidv4 } from 'uuid'
export default {
  name: 'Applications',
  components: {
    Agent: () => import('@/components/Agent.vue')
  },
  data: () => ({
    appDrawerOpen: false,
    conductorApp: {
      uuid: uuidv4(),
      path: 'ConductorApplications',
      name: '',
      dnaNickName: '',
      dnaFiles: []
    }
  }),
  methods: {
    openConductorAppDetails (cApp) {
      this.conductorApp = { ...cApp }
      this.appDrawerOpen = true
    },
    newApplication () {
      this.orgProfile = {
        uuid: uuidv4(),
        path: 'Applications',
        name: '',
        dnaPaths: '',
        dnaNickName: ''
      }
      this.appDrawerOpen = true
    }
  },
  computed: {
    ...mapState('conductorAdmin', ['conductorApps'])
  },
  created () {
    this.$store.dispatch('conductorAdmin/initialise')
  }
}
</script>
