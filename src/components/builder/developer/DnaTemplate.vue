<template>
  <v-card outlined dark elevation="5">
    <v-card-title>{{ template.name }}</v-card-title>
    <v-img
      class="white--text align-end ma-2"
      max-width="400"
      :src="template.preview"
    >
    </v-img>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn
        color="action darken-1"
        text
        @click="cloneDna({ template: template.name, name: applicationName })"
      >
        Clone Me
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { mapState, mapActions } from 'vuex'
export default {
  name: 'DnaTemplate',
  props: ['template', 'details'],
  computed: {
    ...mapState('builderDeveloper', ['applicationName'])
  },
  methods: {
    ...mapActions('builderDeveloper', ['cloneDna'])
  }
}
</script>
