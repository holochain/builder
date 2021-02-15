<template>
  <v-app>
    <v-main>
      <v-fade-transition mode="out-in">
        <router-view class="fill-height" />
      </v-fade-transition>
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: 'DefaultLayout'
}
</script>
