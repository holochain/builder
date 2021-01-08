<template>
  <v-card dark elevation="5">
    <v-img
      class="white--text align-end ma-2"
      max-width="200"
      :src="agent.avatar"
    >
    </v-img>
    <v-card-title>{{ agent.handle }}</v-card-title>
    <v-divider></v-divider>
    <v-card-actions>
      <v-btn v-if="agent.appInterface" small icon :href="`http://localhost:5100?agentPubKey=${encodeURIComponent(agent.agentPubKey)}&cellId=${encodeURIComponent(agent.cellId)}&port=${agent.appInterface.port}`" target="_blank">
        <v-icon>
          mdi-application
        </v-icon>
      </v-btn>
      <v-btn small icon @click="installDna({ agent })">
        <v-icon>
          mdi-application-import
        </v-icon>
      </v-btn>
      <v-spacer></v-spacer>
      <v-icon @click="$emit('delete-agent', agent)" color="warning">
        mdi-delete-outline</v-icon
      >
      <v-icon @click="openAgentDetail">
        mdi-details
      </v-icon>
    </v-card-actions>
  </v-card>
</template>

<script>
import { mapActions } from 'vuex'
export default {
  name: 'DemoAgent',
  props: ['agent', 'details'],
  computed: {},
  methods: {
    ...mapActions('builder', ['installDna']),
    openAgentDetail () {
      this.$emit('open-agent-detail', this.agent)
    }
  }
}
</script>
