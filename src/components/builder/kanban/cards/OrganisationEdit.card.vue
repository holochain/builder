<template>
  <v-card height="100%" width="100%">
    <v-row no-gutters>
      <v-col cols="6" class="pa-0">
        <v-col cols="12" class="pa-0">
          <v-text-field
            v-model="internalOrgProfile.name"
            label="Organisation's Name"
            required
          ></v-text-field>
        </v-col>
        <v-col cols="12" class="pa-0">
          <v-text-field
            v-model="internalOrgProfile.email"
            label="Organisation's Email"
            required
          ></v-text-field>
        </v-col>
      </v-col>
      <v-col cols="6">
        <v-file-input
          v-model="uploadedFile"
          accept="image/*"
          label="Upload new image"
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
        <v-img :src="internalOrgProfileLogo" width="200" class="mx-auto" />
      </v-col>
      <v-col
        cols="12"
      >
        <v-textarea
          v-model="internalOrgProfile.billingAddress"
          label="Billing Entity Address*"
          hint="What's your address"
          rows="3"
          persistent-hint
          required
        ></v-textarea>
      </v-col>
      <v-col cols="12">
        <v-text-field
          v-model="internalOrgProfile.financialInstitution"
          label="Financial Institution"
          hint="eg: Transferwise"
          persistent-hint
          required
        ></v-text-field>
      </v-col>
      <v-col cols="12">
        <v-text-field
          v-model="internalOrgProfile.bsb"
          label="BSB*"
          required
        ></v-text-field>
      </v-col>
      <v-col cols="12">
        <v-text-field
          v-model="internalOrgProfile.account"
          label="Account Number*"
          required
        ></v-text-field>
      </v-col>
      <v-col cols="12">
        <v-text-field
          v-model="internalOrgProfile.billingContact"
          label="Account Holder*"
          hint="eg: Your name"
          persistent-hint
          required
        ></v-text-field>
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
        Save
      </v-btn>
    </v-card-actions>
  </v-card>
</template>
<script>
import { mapActions } from 'vuex'
import { v4 as uuidv4 } from 'uuid'
export default {
  name: 'OrganisationEdit',
  props: ['orgProfile', 'action'],
  data () {
    return {
      uploadedFile: [],
      internalOrgProfileLogo: '',
      internalOrgProfile: {
        uuid: uuidv4(),
        path: 'Organisations',
        name: '',
        logo: '',
        email: '',
        billingContact: '',
        billingAddress: '',
        financialInstitution: '',
        bsb: '',
        account: ''
      }
    }
  },
  methods: {
    ...mapActions('builderOrganisations', ['saveOrganisation']),
    // ...mapActions('builderKanban', ['saveCard']),
    save () {
      console.log(this.action)
      this.internalOrgProfile.logo = this.internalOrgProfileLogo
      this.saveOrganisation({ organisation: this.internalOrgProfile, action: this.action })
      // const card = {
      //   uuid: this.internalOrgProfile.uuid,
      //   name: this.internalOrgProfile.name,
      //   parentColumn: 'root',
      //   cardType: 'column',
      //   parent: 'Cards',
      //   order: 0
      // }
      // this.saveCard({ card })
      this.$emit('close')
    }
  },
  watch: {
    uploadedFile (fileToUpload) {
      if (fileToUpload === null) {
        this.internalOrgProfileLogo = ''
        return
      }
      var reader = new FileReader()
      reader.onload = (e) => {
        this.internalOrgProfileLogo = e.target.result
      }
      reader.readAsDataURL(fileToUpload)
    },
    orgProfile (profile) {
      console.log(profile)
      this.internalOrgProfile = { ...profile }
      this.internalOrgProfileLogo = this.internalOrgProfile.logo
    }
  }
}
</script>
