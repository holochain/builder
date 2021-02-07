<template>
  <section id="holo">
    <v-menu v-if="holo" bottom min-width="200px" rounded offset-y>
      <template v-slot:activator="{ on }">
        <v-btn icon v-on="on">
          <v-avatar color="brown" size="30">
            <v-img contain :src="require('@/assets/images/philip.beadle.png')">
            </v-img>
          </v-avatar>
        </v-btn>
      </template>
      <v-card>
        <v-list>
          <v-list-item href="http://localhost:50001/profile/ded3453e-1508-44b5-8aca-70e3b3764b3e">
            <v-list-item-avatar size="30">
              <v-img contain :src="require('@/assets/images/philip.beadle.png')">
              </v-img>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-card-title>Philip Beadle</v-card-title>
            </v-list-item-content>
          </v-list-item>
          <v-divider></v-divider>
          <v-list-item v-if="agent.agentPubKey === ''" @click="generateAgentKey({ agent })">
            <v-list-item-icon>
              <v-icon>
                mdi-account-key-outline
              </v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>My Public Key</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item href="http://localhost:50001/personas">
            <v-list-item-icon>
              <v-icon>mdi-account</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>My Personas</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item href="http://localhost:50001/my-apps">
            <v-list-item-icon>
              <v-icon>mdi-application</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>My Apps</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item href="http://localhost:50001/my-invites">
            <v-list-item-icon>
              <v-icon>mdi-account-arrow-left-outline</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>My Invites</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-card>
    </v-menu>
    <v-btn icon v-else to="login">
      <v-icon>mdi-form-textbox-password</v-icon>
    </v-btn>
  </section>
</template>

<script>
import { mapActions, mapState } from 'vuex'
export default {
  name: 'Holo',
  data () {
    return {
      holo: true
    }
  },
  computed: {
    ...mapState('conductorAdmin', ['agent'])
  },
  methods: {
    ...mapActions('conductorAdmin', ['generateAgentKey'])
  },
  created () {
    if (this.$route.query.agentPubKey) localStorage.setItem('agentPubKey', decodeURIComponent(this.$route.query.agentPubKey))
    if (this.$route.query.cellId) localStorage.setItem('cellId', decodeURIComponent(this.$route.query.cellId))
    if (this.$route.query.port) localStorage.setItem('port', this.$route.query.port)
  }
}
</script>
