<template>
  <v-card height="100%" width="100%">
    <v-row no-gutters>
      <v-col cols="6" class="pa-0">
        <v-col cols="12" class="pa-0">
          <v-text-field
            v-model="internalConductorApp.name"
            label="Application's Name"
            required
          ></v-text-field>
        </v-col>
        <v-col cols="12" class="pa-0">
          <v-text-field
            v-model="internalConductorApp.dnaNickName"
            label="Application DNA's nickname"
            required
          ></v-text-field>
        </v-col>
      </v-col>
      <v-col cols="12">
        List of DNAs goes here
      </v-col>
    </v-row>
    <v-card-actions class="pa-0 mt-0">
      <v-spacer></v-spacer>
      <v-btn
        color="blue darken-1"
        text
        @click="$emit('close')"
      >
        Close
      </v-btn>
      <v-btn
        color="blue darken-1"
        text
        @click="save"
      >
        Save & Install DNA
      </v-btn>
    </v-card-actions>
  </v-card>
</template>
<script>
import { mapActions } from 'vuex'
import { v4 as uuidv4 } from 'uuid'
export default {
  name: 'ConductorApplicationEdit',
  props: ['conductorApp'],
  data () {
    return {
      internalConductorApp: {
        uuid: uuidv4(),
        path: 'ConductorApplications',
        name: ''
      }
    }
  },
  methods: {
    ...mapActions('conductorAdmin', ['installDna']),
    save () {
      this.saveApplication(this.internalConductorApp)
      this.installDna({ conductorApp: this.internalConductorApp })
      this.$emit('close')
    }
  },
  mounted () {
    if (this.orgProfile) {
      this.internalConductorApp = { ...this.orgProfile }
    }
  }
}
</script>
