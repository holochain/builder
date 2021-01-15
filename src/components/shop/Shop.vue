<template>
  <v-container>
    <v-row no-gutters>
      <v-col md="3" sm="3" xs="12">
        <v-card outlined>
          <v-card-title>Categories</v-card-title>
          <v-divider></v-divider>
          <v-treeview :items="items" :selected-color="'#fff'" activatable open-on-click dense>
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
      </v-col>
      <v-col md="9" sm="6" xs="12">
        <v-row no-gutters>
          <v-col class="pl-3" md="3" sm="6" xs="12" :key="product.uuid" v-for="product in categoryProducts">
            <v-card
              class="mx-auto"
              outlined
              tile
              max-width="600"
              elevation="5"
              @click="$emit('show-product', product)"
            >
              <v-img
                class="white--text align-end"
                :aspect-ratio="16/9"
                height="200px"
                cover
                :src="product.preview"
              >
              </v-img>
              <v-divider></v-divider>
              <v-card-title>
                {{product.name}}
              </v-card-title>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
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
import { mapState } from 'vuex'
export default {
  props: ['items', 'initialCategory'],
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
      selectedCategory: 0,
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
      max: 10000
    }
  },
  methods: {
    selectCategory (category) {
      this.selectedCategory = category.id
    }
  },
  computed: {
    ...mapState('appStore', ['products']),
    categoryProducts () {
      return this.products.filter(p => p.category === this.selectedCategory)
    }
  },
  watch: {
    initialCategory (old, val) {
      this.selectedCategory = this.initialCategory
    }
  }
}
</script>
