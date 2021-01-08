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
        <v-list dense>
          <v-list-item>
            <v-list-item-content>
              <v-card-title>Philip Beadle</v-card-title>
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
export default {
  name: 'Holo',
  data () {
    return {
      holo: true
    }
  },
  created () {
    // if (this.$route.query.agentPubKey) localStorage.setItem('agentPubKey', decodeURIComponent(this.$route.query.agentPubKey))
    // if (this.$route.query.cellId) localStorage.setItem('cellId', decodeURIComponent(this.$route.query.cellId))
    // if (this.$route.query.port) localStorage.setItem('port', this.$route.query.port)
    // if (localStorage.getItem('agentPubKey')) {
    //   // this.holo = false
    //   this.$store.dispatch('holodex/initialise')
    //     .then(() => this.$store.dispatch('holodex/fetchMembers'))
    // }
  }
}
</script>
