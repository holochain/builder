<template>
  <v-app id="inspire">
    <v-main>
      <v-fade-transition mode="out-in">
        <router-view />
      </v-fade-transition>
    </v-main>
  </v-app>
</template>
<script>
export default {
  data () {
    return {
      navOpen: false,
      items: [
        { title: 'T-Shirts' },
        { title: 'Jackets' },
        { title: 'Shirts' },
        { title: 'Jeans' },
        { title: 'Shoes' }
      ],
      activeBtn: 1
    }
  }
}
</script>
