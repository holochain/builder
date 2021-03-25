<template>
  <v-card height="100%" width="100%">
    <v-app-bar app dark dense tile class="pa-0">
      <v-toolbar-title class="ml-2 mt-n1 mr-1 font-weight-black">
        My Holochain Applications
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            icon
            @click="myappDrawerOpen = true"
            dark
            v-bind="attrs"
            v-on="on">
            <v-icon>mdi-application-import</v-icon>
          </v-btn>
        </template>
        <span>Install a new Holochain Application</span>
      </v-tooltip>
      <agent />
    </v-app-bar>
    <v-container>
      <v-row no-gutters>
        <v-col md="3" sm="3" xs="12">
          <v-card outlined>
            <v-card-title>Categories</v-card-title>
            <v-divider></v-divider>
            <v-treeview :items="happCategories" :selected-color="'#fff'" activatable open-on-click dense>
              <template v-slot:label="{ item }">
                <span
                  v-if="item.children === undefined"
                  @click.stop="selectCategory(item)"
                >
                  {{ item.name }}
                </span>
                <span v-else>
                  {{ item.name }}
                </span>
              </template>
            </v-treeview>
          </v-card>
        </v-col>
        <v-col md="9" sm="6" xs="12">
          <v-row no-gutters>
            <v-col class="pl-3" md="4" sm="6" xs="12" :key="happ.uuid" v-for="happ in categoryHapps">
              <v-card
                class="mx-auto"
                outlined
                tile
                max-width="600"
                elevation="5"
                to="/builder/organisations"
              >
                <v-img
                  class="white--text align-end"
                  :aspect-ratio="16/9"
                  height="200px"
                  cover
                  :src="happ.preview"
                >
                </v-img>
                <v-divider></v-divider>
                <v-card-title>
                  {{happ.name}}
                </v-card-title>
              </v-card>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-container>
    <v-navigation-drawer
      v-model="myappDrawerOpen"
      fixed
      dark
      class="overflow-visible pa-0"
      right
      :width="this.$vuetify.breakpoint.lgAndUp ? 1200 : 1000"
    >
      <v-card class="fill-height">
        <v-system-bar window dark>
          <span>Install a Holochain Application</span>
          <v-spacer></v-spacer>
          <v-icon v-if="shop === false" @click="shop = true">mdi-store-outline</v-icon>
          <v-icon @click="myappDrawerOpen = false;shop = true">mdi-close</v-icon>
        </v-system-bar>
        <happ-store v-if="shop" @show-happ="showHapp"/>
        <happ v-else :happ="selectedHapp"/>
      </v-card>
    </v-navigation-drawer>
  </v-card>
</template>
<script>
import { mapState } from 'vuex'
export default {
  name: 'Home',
  components: {
    Agent: () => import('@/components/Agent.vue'),
    Happ: () => import('@/components/happStore/Happ.vue'),
    HappStore: () => import('@/components/happStore/HappStore.vue')
  },
  data: () => ({
    myappDrawerOpen: false,
    shop: true,
    selectedCategory: 4
  }),
  computed: {
    ...mapState('myApplications', ['happs', 'happCategories']),
    categoryHapps () {
      return this.happs.filter(p => p.category === this.selectedCategory)
    }
  },
  methods: {
    showHapp (happ) {
      this.selectedHapp = { ...happ }
      this.shop = false
    },
    selectCategory (category) {
      this.selectedCategory = category.id
    }
  },
  watch: {
    filter (val) {
      this.selectedCategory = val.categoryId
    }
  }
}
</script>
