<template>
  <v-container>
    <v-row no-gutters>
      <v-col md="6" sm="12">
        <v-carousel height="400">
          <v-carousel-item
            v-for="screen in happ.screens"
            :key="screen"
            :src="screen"
            cover />
        </v-carousel>
      </v-col>
      <v-col md="6" sm="12">
        <v-card flat>
          <v-card-title class="font-weight-black">
            {{happ.name}}
            <v-spacer></v-spacer>
            <v-rating :value="4.5" class="" background-color="warning lighten-3" color="warning" dense></v-rating>
          </v-card-title>
          <v-card-text>
            {{happ.description}}
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn class="primary white--text" tile @click="agreeValueFlow = true">
              <v-icon>mdi-application-import</v-icon>
              <span>Install Happ</span>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <v-tabs>
          <v-tab>
            <span class="body-2">App REVIEWS</span>
          </v-tab>
          <v-tab>Developer Info</v-tab>
          <v-tab>
            <span class="body-2">Value Flow</span>
          </v-tab>
          <v-tab-item>
            <v-list
              :three-line="true"
              :avatar="true"
            >
              <v-list-item-group v-model="item" color="primary">
                <v-list-item
                  v-for="(item, i) in items"
                  :key="i"
                >
                  <v-list-item-avatar>
                    <v-img :src="item.avatar"></v-img>
                  </v-list-item-avatar>
                  <v-list-item-content>
                    <v-list-item-title v-html="item.title"></v-list-item-title>
                    <v-rating v-model="rating" class="" background-color="warning lighten-3" color="warning" dense></v-rating>
                    <v-list-item-subtitle v-html="item.subtitle"></v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </v-list-item-group>
            </v-list>
          </v-tab-item>
          <v-tab-item>
            <v-card flat>
              <v-card-title>{{happ.developer}}<v-icon>mdi-file-certificate-outline</v-icon></v-card-title>
              <v-card-text>
                {{happ.developerDescription}}
              </v-card-text>
            </v-card>
            <v-list
              :three-line="true"
              :avatar="true"
            >
              <v-list-item-group v-model="item" color="primary">
                <v-list-item
                  v-for="(item, i) in items"
                  :key="i"
                  :inactive="true"
                >
                  <v-list-item-avatar>
                    <v-img :src="item.avatar"></v-img>
                  </v-list-item-avatar>
                  <v-list-item-content>
                    <v-list-item-title v-html="item.title"></v-list-item-title>
                    <v-rating
                      v-model="rating"
                      background-color="warning lighten-3"
                      color="warning"
                      dense>
                    </v-rating>
                    <v-list-item-subtitle v-html="item.subtitle"></v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </v-list-item-group>
            </v-list>
          </v-tab-item>
          <v-tab-item>
            <v-card flat color="white">
              <v-img :src="require('@/assets/img/shop/sens-flow-1.png')" :height="400" contain/>
            </v-card>
          </v-tab-item>
        </v-tabs>
      </v-col>
    </v-row>
     <confirm-action-dialog
      :isOpen="agreeValueFlow"
      message="agree to this valueflow?"
      @confirm="confirmAgreement"
      @cancel="cancelAgreement"
    />
  </v-container>
</template>
<script>
export default {
  name: 'Happ',
  props: ['happ', 'filter'],
  components: {
    ConfirmActionDialog: () => import('@/components/ConfirmActionDialog.vue')
  },
  data: () => ({
    agreeValueFlow: false,
    rating: 4.5,
    item: 5,
    items: [
      {
        avatar: 'https://cdn.vuetifyjs.com/images/lists/1.jpg',
        title: 'Lorem ipsum dolor?',
        subtitle: "<span class='text--primary'>Ali Connors</span> &mdash; Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Nisl tincidunt eget nullam non. Tincidunt arcu non sodales neque sodales ut etiam. Lectus arcu bibendum at varius vel pharetra. Morbi tristique senectus et netus et malesuada.\n" +
                        '\n'
      },
      {
        avatar: 'https://cdn.vuetifyjs.com/images/lists/2.jpg',
        title: 'Lorem ipsum dolor <span class="grey--text text--lighten-1">4</span>',
        subtitle: "<span class='text--primary'>to Alex, Scott, Jennifer</span> &mdash; Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore"
      },
      {
        avatar: 'https://cdn.vuetifyjs.com/images/lists/3.jpg',
        title: 'Lorem ipsum dolor',
        subtitle: "<span class='text--primary'>Sandra Adams</span> &mdash; Lorem ipsum dolor sit amet, consectetur adipiscing elit"
      },
      {
        avatar: 'https://cdn.vuetifyjs.com/images/lists/4.jpg',
        title: 'Lorem ipsum dolor',
        subtitle: ''
      },
      {
        avatar: 'https://cdn.vuetifyjs.com/images/lists/5.jpg',
        title: 'Lorem ipsum dolor',
        subtitle: "<span class='text--primary'>Britta Holt</span> &mdash; Lorem ipsum dolor sit amet, consectetur adipiscing elit"
      }
    ]
  }),
  methods: {
    confirmAgreement () {
      this.$emit('install-happ', this.happ)
      this.agreeValueFlow = false
    },
    cancelAgreement () {
      this.agreeValueFlow = false
    }
  }
}
</script>
