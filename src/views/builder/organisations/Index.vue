<template>
  <v-card height="100%" width="100%">
    <v-app-bar app dark dense tile class="pa-0">
      <v-avatar size="30" class="mt-n1 mr-2">
        <v-img contain :src="require('@/assets/holochain-halo.png')">
        </v-img>
      </v-avatar>
      <v-toolbar-title class="mt-n1 mr-1 font-weight-black">
        Builder Organisations
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click="newOrganisation">
        <v-icon>mdi-briefcase-plus-outline</v-icon>
      </v-btn>
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
              <v-spacer></v-spacer>
              <v-btn icon :to="`/builder/developer/${organisation.uuid}`">
                <v-icon>mdi-code-braces</v-icon>
              </v-btn>
              <v-btn icon @click="openOrganisationDetails(organisation)">
                <v-icon>mdi-briefcase-edit-outline</v-icon>
              </v-btn>
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
          <span>Organisation Details</span>
          <v-spacer></v-spacer>
          <v-icon @click="orgDrawerOpen = false">mdi-close</v-icon>
        </v-system-bar>
        <v-card-text>
          <v-container>
            <v-row no-gutters>
              <v-col cols="6" class="pa-0">
                <v-col cols="12" class="pa-0">
                  <v-text-field
                    v-model="orgProfile.name"
                    label="Organisation's Name"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12" class="pa-0">
                  <v-text-field
                    v-model="orgProfile.email"
                    label="Organisation's Email"
                    required
                  ></v-text-field>
                </v-col>
              </v-col>
              <v-col cols="6">
              </v-col>
              <v-col
                cols="12"
              >
                <v-textarea
                  v-model="orgProfile.billingAddress"
                  label="Billing Entity Address*"
                  hint="What's your address"
                  rows="3"
                  persistent-hint
                  required
                ></v-textarea>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="orgProfile.financialInstitution"
                  label="Financial Institution"
                  hint="eg: Transferwise"
                  persistent-hint
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="orgProfile.bsb"
                  label="BSB*"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="orgProfile.account"
                  label="Account Number*"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="orgProfile.billingContact"
                  label="Account Holder*"
                  hint="eg: Your name"
                  persistent-hint
                  required
                ></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions class="pa-0 mt-0">
          <v-spacer></v-spacer>
          <v-btn
            color="blue darken-1"
            text
            @click="orgDrawerOpen = false"
          >
            Close
          </v-btn>
          <v-btn
            color="blue darken-1"
            text
            @click="saveOrganisation(orgProfile); orgDrawerOpen = false"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-navigation-drawer>
  </v-card>
</template>
<script>
import { mapActions, mapState } from 'vuex'
import { v4 as uuidv4 } from 'uuid'
export default {
  name: 'Organisations',
  components: {
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
    }
  }),
  methods: {
    ...mapActions('builderOrganisations', ['initialise', 'saveOrganisation']),
    openOrganisationDetails (org) {
      this.orgProfile = { ...org }
      this.orgDrawerOpen = true
    },
    newOrganisation () {
      this.orgProfile = {
        uuid: uuidv4(),
        path: 'Organisations',
        name: '',
        email: '',
        billingContact: '',
        billingAddress: '',
        financialInstitution: '',
        bsb: '',
        account: ''
      }
      this.orgDrawerOpen = true
    }
  },
  computed: {
    ...mapState('builderOrganisations', ['organisations', 'organisation'])
  },
  watch: {
    organisation (orgProfile) {
      this.orgProfile = { ...orgProfile }
    }
  },
  created () {
    this.orgProfile = { ...this.organisation }
    this.initialise()
  }
}
</script>
