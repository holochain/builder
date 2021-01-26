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
    <v-btn small icon @click="generateAgentKey({ agent })">
      <v-icon>
          mdi-account-key-outline
        </v-icon>
      </v-btn>
      <v-btn v-if="agent.agentPubKey" small icon @click="installDna({ agent, dnaPaths })">
        <v-icon>
          mdi-application-import
        </v-icon>
      </v-btn>
      <v-btn v-if="agent.cellData" small icon :href="`http://localhost:4400${index + 1}?agentPubKey=${encodeURIComponent(agent.agentPubKey)}&${cells}&port=44444`" target="_blank">
        <v-icon>
          mdi-application
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
import { mapActions, mapState } from 'vuex'
import * as base64 from 'byte-base64'
export default {
  name: 'DemoAgent',
  props: ['agent', 'index', 'details'],
  computed: {
    ...mapState('builder', ['hcClient', 'dnaPaths']),
    cells () {
      let cellIds = ''
      this.agent.cellData.forEach(cell => {
        cellIds += `&${cell[1]}CellId=${encodeURIComponent(base64.bytesToBase64(cell[0][0]))}`
      })
      console.log(cellIds)
      return cellIds
      // &cellId=${encodeURIComponent(agent.cellId)}
    }
  },
  methods: {
    ...mapActions('builder', ['generateAgentKey', 'installDna']),
    openAgentDetail () {
      this.$emit('open-agent-detail', this.agent)
    }
  }
}
</script>
