<template>
  <v-fade-transition mode="out-in">
    <router-view class="fill-height"/>
  </v-fade-transition>
</template>

<script>
export default {
  name: 'App',
  created () {
    this.$vuetify.theme.dark = true
  }
}
</script>
