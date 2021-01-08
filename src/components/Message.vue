<template>
  <v-card dark class="black pa-0 ma-0">
    {{ message }}
  </v-card>
</template>
<script>
export default {
  name: 'Message',
  props: ['message']
}
</script>
