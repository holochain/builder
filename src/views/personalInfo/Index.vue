<template>
  <v-card height="100%" width="100%">
    <v-app-bar app dark dense tile class="pa-0">
      <v-toolbar-title class="ml-2 mt-n1 mr-1 font-weight-black">
        My Personal Information
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <agent />
    </v-app-bar>
    <v-container fluid>
    </v-container>
  </v-card>
</template>
<script>
export default {
  name: 'Home',
  components: {
    Agent: () => import('@/components/Agent.vue')
  },
  data: () => ({}),
  computed: {}
}
</script>
