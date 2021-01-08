<template>
  <div>
    <v-container>
      <div class="row">
        <div
         class="col-md-3 col-sm-3 col-xs-12"
        >
          <v-card outlined>
            <v-card-title>Filters</v-card-title>
            <v-divider></v-divider>
            <v-treeview :items="items" :open="[1]" :selected-color="'#fff'" activatable open-on-click dense>
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
            <v-divider></v-divider>
            <v-card-title class="pb-0">Customer Rating</v-card-title>
            <v-container class="pt-0"  fluid>
              <v-checkbox append-icon="mdi-star" label="4 & above" hide-details dense></v-checkbox>
              <v-checkbox append-icon="mdi-star" label="3 & above" hide-details dense></v-checkbox>
              <v-checkbox append-icon="mdi-star" label="2 & above" hide-details dense></v-checkbox>
              <v-checkbox append-icon="mdi-star" label="1 & above" hide-details dense></v-checkbox>
            </v-container>
          </v-card>
        </div>
        <div class="col-md-9 col-sm-9 col-xs-12">
          <v-row dense>
            <v-col cols="12" sm="8" class="pl-6 pt-6">
              <small>Showing 1-12 of 200 products</small>
            </v-col>
            <v-col cols="12" sm="4">
              <v-select class="pa-0" v-model="select" :items="options" style="margin-bottom: -20px;" outlined dense></v-select>
            </v-col>
          </v-row>

          <v-divider></v-divider>

          <v-row class="pt-2">
            <v-col md="3" sm="6" xs="12" :key="product.uuid" v-for="product in categoryProducts">
              <v-card
                class="mx-auto"
                max-width="600"
                @click="$emit('show-product', product)"
              >
                <v-img
                  class="white--text align-end"
                  :aspect-ratio="16/9"
                  height="200px"
                  contain
                  :src="product.preview"
                >
                </v-img>
                <v-card-title>
                  {{product.name}}
                </v-card-title>
              </v-card>
            </v-col>
          </v-row>
          <div class="mt-12">
            <v-pagination
              v-model="page"
              :length="3"
            ></v-pagination>
          </div>
        </div>
      </div>
    </v-container>
  </div>
</template>
<style>
  .v-card--reveal {
    align-items: center;
    bottom: 0;
    justify-content: center;
    opacity: .8;
    position: absolute;
    width: 100%;
  }
</style>
<script>
export default {
  data () {
    return {
      range: [0, 10000],
      select: 'Popularity',
      options: [
        'Default',
        'Popularity',
        'Relevance',
        'Price: Low to High',
        'Price: High to Low'
      ],
      page: 1,
      selectedCategory: 4,
      breadcrums: [
        {
          text: 'Home',
          disabled: false,
          href: 'breadcrumbs_home'
        },
        {
          text: 'Social Apps',
          disabled: false,
          href: 'breadcrumbs_clothing'
        },
        {
          text: 'Messaging',
          disabled: true,
          href: 'breadcrumbs_shirts'
        }
      ],
      min: 0,
      max: 10000,
      items: [
        {
          id: 1,
          name: 'Applications',
          children: [
            { id: 9, name: 'Recursive Columns & Cards' },
            { id: 4, name: 'Simple' }
          ]
        }
      ],
      products: [
        {
          category: 4,
          uuid: 'f9c8e8c2-b3b4-4d73-8790-e9c0b729c629',
          name: 'Simple',
          preview: require('../../assets/img/shop/Simple1.png'),
          description: 'Simple is a complete Holochain application that you can use as a starting point for your own app. Simple let\'s you create, update, list and delete Things. Get it? The Simple Things in life :) This app shows you how to interact with Holochain from a modern web app built with Vue.js and Vuetify. Simple also takes advantage of the IndexDB, available in all browsers and has a lot of storage, to speed up the experience for people using your app.',
          developerDescription: 'e-s-c-r\'s core focus is building high quality certified applications and modules for Holo & Holochain. Always on the bleeding edge of Holochain e-s-c-r is continuously improving, automating & using their own applications.',
          screens: [
            require('@/assets/img/shop/Simple1.png'),
            require('@/assets/img/shop/Simple2.png')
          ],
          developer: 'Eat Sleep Code Repeat',
          plugin: 'vue-cli-plugin-holochain-simple'
        },
        {
          category: 9,
          uuid: 'd28d96a7-8e0d-4fac-8c02-626366b2f7ad',
          name: 'Recursive Cards & Columns',
          preview: require('../../assets/img/shop/recursive4.png'),
          description: 'This Vuetify web app, Columns & Cards, is setup to show you how easy it is to build a Holochain application. Columns & Cards is a starting point for, as you guessed, recursivecards apps that don\'t require a complicated navigation system or other fancy layouts. Columns & Cards shows you how to use Vue Router, Vuex and Holochain. It also shows you how to secure your routes and check to make sure the person using Columns & Cards has a Holochain Public Agent Key or has logged in to Holo. Columns & Cards also uses dexie.js to store information in the browser database, IndexDB. This speeds up your even more enabling you to retrieve data immediately from IndexDB and then let the data be updated by Holochain. This is known as the stale-while-revalidate (SWR) pattern. If your app needs more complicated layouts try the Holochain Kitchen Sink option.',
          developerDescription: 'e-s-c-r\'s core focus is building high quality certified applications and modules for Holo & Holochain. Always on the bleeding edge of Holochain e-s-c-r is continuously improving, automating & using their own applications.',
          screens: [
            require('@/assets/img/shop/recursive1.png'),
            require('@/assets/img/shop/recursive2.png'),
            require('@/assets/img/shop/recursive3.png')
          ],
          developer: 'Eat Sleep Code Repeat',
          plugin: 'vue-cli-plugin-holochain-recursive-cards'
        }
      ]
    }
  },
  methods: {
    selectCategory (category) {
      console.log(category)
      this.selectedCategory = category.id
    }
  },
  computed: {
    categoryProducts () {
      return this.products.filter(p => p.category === this.selectedCategory)
    }
  }
}
</script>
