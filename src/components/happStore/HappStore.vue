<template>
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
          <!-- <v-divider></v-divider>
          <v-card-title class="pb-0">Customer Rating</v-card-title>
          <v-container class="pt-0"  fluid>
            <v-checkbox append-icon="mdi-star" label="4 & above" hide-details dense></v-checkbox>
            <v-checkbox append-icon="mdi-star" label="3 & above" hide-details dense></v-checkbox>
            <v-checkbox append-icon="mdi-star" label="2 & above" hide-details dense></v-checkbox>
            <v-checkbox append-icon="mdi-star" label="1 & above" hide-details dense></v-checkbox>
          </v-container> -->
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
              @click="$emit('show-happ', happ)"
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
  name: 'HapStore',
  props: ['filter'],
  data () {
    return {
      selectedCategory: 1
    }
  },
  methods: {
    selectCategory (category) {
      this.selectedCategory = category.id
    }
  },
  computed: {
    ...mapState('happStore', ['happs', 'happCategories']),
    categoryHapps () {
      return this.happs.filter(p => p.category === this.selectedCategory)
    }
  },
  watch: {
    filter (val) {
      this.selectedCategory = val.categoryId
    }
  }
}
</script>
