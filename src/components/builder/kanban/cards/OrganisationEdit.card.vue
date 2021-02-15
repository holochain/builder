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
        <!-- <input type="file" @change="previewImage" accept="image/*"> -->
        <v-img :src="internalOrgProfileLogo" width="200" class="mx-auto">
        </v-img>
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
  props: ['orgProfile'],
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
    ...mapActions('builderKanban', ['saveCard']),
    save () {
      this.internalOrgProfile.logo = this.internalOrgProfileLogo
      this.saveOrganisation(this.internalOrgProfile)
      const card = {
        uuid: this.internalOrgProfile.uuid,
        name: this.internalOrgProfile.name,
        preview: this.internalOrgProfileLogo,
        parentColumn: 'root',
        cardType: 'column',
        parent: 'Cards',
        order: 0
      }
      this.saveCard({ card })
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
    }
  },
  mounted () {
    if (this.orgProfile) {
      this.internalOrgProfile = { ...this.orgProfile }
      this.internalOrgProfileLogo = this.internalOrgProfile.logo
    }
  }
}
</script>
