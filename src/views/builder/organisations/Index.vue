<template>
  <v-card height="100%" width="100%">
    <v-app-bar app dark dense tile class="pa-0">
      <builder-menu />
      <v-toolbar-title class="ml-2 mt-n1 mr-1 font-weight-black">
        Builder Organisations
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click="newOrganisation">
        <v-icon>mdi-briefcase-plus-outline</v-icon>
      </v-btn>
      <v-btn icon @click="join = true; newOrganisation()">
        <v-icon>mdi-account-group-outline</v-icon>
      </v-btn>
      <agent />
    </v-app-bar>
    <v-container fluid>
      <v-row dense>
        <v-col
          v-for="organisation in organisations"
          :key="organisation.uuid"
          cols="12"
          lg="3"
          md="4"
          sm="6"
        >
          <v-card elevation="5">
            <v-img
              :src="organisation.logo"
              contain
              class="white--text align-end"
              gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
              height="200px"
            >
              <v-card-title v-text="organisation.name"></v-card-title>
            </v-img>

            <v-card-actions>
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    icon
                    @click="installDnas({ organisation })"
                    v-bind="attrs"
                    v-on="on">
                    <v-icon>mdi-dna</v-icon>
                  </v-btn>
                </template>
                <span>Reinstall locally built DNAs</span>
              </v-tooltip>
              <v-spacer></v-spacer>
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    icon
                    @click="goToDeveloper(organisation)"
                    dark
                    v-bind="attrs"
                    v-on="on">
                    <v-icon>mdi-code-braces</v-icon>
                  </v-btn>
                </template>
                <span>Open Developer IDE</span>
              </v-tooltip>
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    icon
                    @click="goToKanban(organisation)"
                    dark
                    v-bind="attrs"
                    v-on="on">
                    <v-icon>mdi-view-column-outline</v-icon>
                  </v-btn>
                </template>
                <span>Open Recursive Kanban Boards</span>
              </v-tooltip>
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    icon
                    @click="openOrganisationDetails(organisation)"
                    dark
                    v-bind="attrs"
                    v-on="on">
                    <v-icon>mdi-briefcase-edit-outline</v-icon>
                  </v-btn>
                </template>
                <span>Open Organisation Details</span>
              </v-tooltip>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
    <v-navigation-drawer
      v-model="orgDrawerOpen"
      fixed
      dark
      class="overflow-visible pa-0"
      right
      :width="this.$vuetify.breakpoint.lgAndUp ? 800 : 600"
    >
      <v-card dark dense flat class="fill-height">
        <v-system-bar window dark>
          <span v-if="join">Upload an invite package to join that Organisation</span>
          <span v-else>Organisation Details</span>
          <v-spacer></v-spacer>
          <v-icon @click="orgDrawerOpen = false; join = false">mdi-close</v-icon>
        </v-system-bar>
        <v-card-text>
          <v-file-input
            v-if="join"
            v-model="uploadedFile"
            accept="application/x-gzip"
            label="Upload invite package"
            outlined
            dense
            dark
            prepend-icon="mdi-folder-zip-outline"
          >
            <template v-slot:selection="{ text }">
              <v-card-subtitle>
                {{ text }}
              </v-card-subtitle>
            </template>
          </v-file-input>
          <organisation-edit
            :key="orgProfile.uuid"
            :orgProfile="orgProfile"
            :action="action"
            @close="orgDrawerOpen = false; join = false"/>
        </v-card-text>
      </v-card>
    </v-navigation-drawer>
  </v-card>
</template>
<script>
import { mapState, mapActions, mapMutations } from 'vuex'
import { v4 as uuidv4 } from 'uuid'
export default {
  name: 'Organisations',
  components: {
    Agent: () => import('@/components/Agent.vue'),
    BuilderMenu: () => import('@/layouts/builder/BuilderMenu.vue')
  },
  data: () => ({
    orgDrawerOpen: false,
    orgProfile: {
      uuid: uuidv4(),
      path: 'Organisations',
      name: '',
      email: '',
      billingContact: '',
      billingAddress: '',
      financialInstitution: '',
      bsb: '',
      account: ''
    },
    action: 'create',
    join: false,
    uploadedFile: []
  }),
  computed: {
    ...mapState('builderOrganisations', ['organisations', 'organisation', 'agent'])
  },
  methods: {
    ...mapActions('builderOrganisations', ['changeOrganisation', 'joinOrganisation', 'installDnas']),
    ...mapMutations('builderOrganisations', ['setOrganisation']),
    openOrganisationDetails (org) {
      this.orgProfile = { ...org }
      this.action = 'update'
      this.orgDrawerOpen = true
    },
    newOrganisation () {
      this.orgProfile = {
        uuid: uuidv4(),
        path: 'Organisations',
        name: '',
        logo: '',
        email: '',
        billingContact: '',
        billingAddress: '',
        financialInstitution: '',
        bsb: '',
        account: ''
      }
      this.action = 'create'
      this.orgDrawerOpen = true
    },
    goToDeveloper (organisation) {
      this.changeOrganisation(organisation)
      this.setOrganisation(organisation)
      this.$router.push('/builder/developer')
    },
    goToKanban (organisation) {
      this.changeOrganisation(organisation)
      this.setOrganisation(organisation)
      this.$router.push('/builder/kanban')
    }
  },
  watch: {
    organisation (orgProfile) {
      this.orgProfile = { ...orgProfile }
    },
    uploadedFile (invitePackage) {
      this.joinOrganisation(invitePackage)
      this.orgDrawerOpen = false
    }
  },
  created () {
    this.orgProfile = { ...this.organisation }
    this.$store.dispatch('builderKanban/initialise').then(() => this.$store.dispatch('builderOrganisations/initialise'))
  }
}
</script>
