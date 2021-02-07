<template>
  <v-main>
    <v-fade-transition mode="out-in">
      <router-view class="fill-height" />
    </v-fade-transition>
  </v-main>
</template>

<script>
export default {
  name: 'AppView'
}
</script>
