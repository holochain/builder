<template>
  <section id="holo">
    <v-menu v-if="holo" bottom min-width="200px" rounded offset-y>
      <template v-slot:activator="{ on }">
        <v-btn icon v-on="on">
          <v-avatar color="info" size="30">
            <v-img contain :src="agent.avatar">
            </v-img>
          </v-avatar>
        </v-btn>
      </template>
      <v-card>
        <v-list>
          <v-list-item @click="editProfileDialog = true">
            <v-list-item-avatar color="info" size="30">
              <v-img contain :src="agent.avatar">
              </v-img>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-card-title>{{ agent.handle }}</v-card-title>
            </v-list-item-content>
          </v-list-item>
          <v-divider></v-divider>
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
    <v-dialog v-model="editProfileDialog" persistent max-width="420">
      <v-card elevation="5">
        <v-card-title class="headline">
          Tell us your handle 😎
        </v-card-title>
        <v-card-text></v-card-text>
        <v-card-text>
          <v-text-field
            v-model="agent.handle"
            label="Enter your handle"
            hint="This will be shown in tags, messages, notes etc 😀"
            dark
            outlined
            full-width
            append-icon="mdi-face-agent"
          />
        </v-card-text>
        <v-card-title class="headline mt-0">
          Upload your avatar
        </v-card-title>
        <v-file-input
          v-model="uploadedFile"
          accept="image/*"
          label="Upload new avatar"
          outlined
          dense
          dark
          prepend-icon="mdi-file-image-outline"
        >
          <template v-slot:selection="{ text }">
            <v-card-subtitle>
              {{ text }}
            </v-card-subtitle>
          </template>
        </v-file-input>
        <v-img :src="internalAvatar" width="200" class="mx-auto" />
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn icon @click="generateAgentKey({ agent })">
            <v-icon>mdi-account-key-outline</v-icon>
          </v-btn>
          <v-btn icon @click="installDnas()">
            <v-icon>mdi-application-import</v-icon>
          </v-btn>
          <v-btn icon @click="saveAgent({ agent }); editProfileDialog=false">
            <v-icon>mdi-content-save-outline</v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </section>
</template>

<script>
import { mapActions, mapState } from 'vuex'
export default {
  name: 'Agent',
  data () {
    return {
      holo: true,
      editProfileDialog: false,
      internalAvatar: '',
      uploadedFile: []
    }
  },
  computed: {
    ...mapState('builderConductorAdmin', ['agent'])
  },
  methods: {
    ...mapActions('builderConductorAdmin', ['saveAgent', 'generateAgentKey', 'installDnas'])
  },
  watch: {
    uploadedFile (fileToUpload) {
      if (fileToUpload === null) {
        this.internalAvatar = ''
        return
      }
      var reader = new FileReader()
      reader.onload = (e) => {
        this.internalAvatar = e.target.result
        this.agent.avatar = this.internalAvatar
      }
      reader.readAsDataURL(fileToUpload)
    }
  },
  created () {
    this.$store.dispatch('builderConductorAdmin/initialise')
    this.internalAvatar = this.agent.avatar
  }
}
</script>
