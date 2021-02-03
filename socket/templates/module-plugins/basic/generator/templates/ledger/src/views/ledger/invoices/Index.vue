<template>
  <v-container class="fill-height" tag="section">
    <v-row no-gutters class="fill-height">
      <v-col cols="6" class="pr-3">
        <v-card
          outlined
          class="fill-height"
          tile
        >
          <v-toolbar dense dark color='elevation-0'>
           <v-toolbar-title>📥 In Progress</v-toolbar-title>
           <v-spacer></v-spacer>
           <v-dialog
              v-model="invoiceDialog"
              max-width="800px"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-icon
                  color="primary"
                  dark
                  class="mb-2"
                  v-bind="attrs"
                  v-on="on"
                >
                  mdi-book-plus-multiple-outline
                </v-icon>
              </template>
              <v-card color="white" light class="pt-10">
                <v-card-text>
                  <v-container>
                    <v-row class="mb-2">
                      <v-col cols="3">
                        <v-img contain width="150" :src="require('@/assets/philip.beadle.png')">
                        </v-img>
                      </v-col>
                      <v-col cols="4">
                        <p class="headline font-weight-black pb-0 mb-0">{{ editedItem.consultantName }}</p>
                        <p class="sub-title">{{ editedItem.consultantBillingAddress }}</p>
                        <p class="sub-title">{{ editedItem.consultantEmail }}</p>
                      </v-col>
                      <v-col cols="1">
                      </v-col>
                      <v-col cols="4">
                        <v-spacer></v-spacer>
                        <p class="headline">Invoice: {{ editedItem.invoiceId }}</p>
                        <v-row no-gutters>
                          <v-col cols="4">
                            <p class="font-weight-bold">Date:</p>
                          </v-col>
                          <v-col cols="8">
                            <p class="font-weight-bold">{{ getDate() }}</p>
                          </v-col>
                          <v-col cols="4">
                            <p class="font-weight-bold">Due Date:</p>
                          </v-col>
                          <v-col cols="8">
                            <p class="font-weight-bold">{{ getDueDate() }}</p>
                          </v-col>
                          <v-col cols="4">
                            <p class="font-weight-bold">Terms:</p>
                          </v-col>
                          <v-col cols="8">
                            <p class="font-weight-bold">7 days</p>
                          </v-col>
                        </v-row>
                      </v-col>
                    </v-row>
                    <v-divider class="pt-1 pb-1"></v-divider>
                    <v-row no-gutters>
                      <v-col cols="1">
                      <p class="font-weight-bold mt-3">Bill to:</p>
                      </v-col>
                      <v-col cols="3">
                        <v-select
                          v-model="client"
                          :items="clients"
                          item-text="name"
                          return-object
                          hide-details
                          outlined
                          dense
                        ></v-select>
                      </v-col>
                      <v-col cols="4">
                        <p class="font-weight-bold mt-3 ml-3">Attn: {{ editedItem.clientBillingContact }}</p>
                      </v-col>
                      <v-col cols="4">
                        <p class="font-weight-bold mt-3">Address: {{ editedItem.clientBillingAddress }}</p>
                      </v-col>
                    </v-row>
                    <v-divider class="pt-15"></v-divider>
                     <v-row>
                      <v-col cols="4">
                        <p class="sub-title font-weight-bold">Description</p>
                        <p>Consulting</p>
                      </v-col>
                      <v-col cols="2">
                        <p class="sub-title font-weight-bold">Quantity</p>
                        <p>1</p>
                      </v-col>
                      <v-col cols="3">
                        <p class="sub-title font-weight-bold">Unit Price</p>
                        <p>{{ editedItem.currency }} 2000</p>
                      </v-col>
                      <v-col cols="3">
                        <p class="sub-title font-weight-bold">Amount</p>
                        <p>{{ editedItem.currency }} {{ editedItem.total }}</p>
                      </v-col>
                    </v-row>
                    <v-divider></v-divider>
                    <v-row class="pt-3">
                      <v-col cols="6">
                      </v-col>
                      <v-col cols="3">
                        <p class="sub-title font-weight-bold">Total</p>
                      </v-col>
                      <v-col cols="3">
                        <p class="sub-title font-weight-bold">{{ editedItem.currency }} {{ editedItem.total }}</p>
                      </v-col>
                    </v-row>
                    <v-divider></v-divider>
                    <v-row no-gutters class="pt-3">
                      <v-col cols="12">
                        <p class="sub-title font-weight-bold">Please pay to:</p>
                      </v-col>
                      <v-col cols="3">
                        <p>Account Holder:</p>
                        <p class="mt-n3">Financial Institution:</p>
                        <p class="mt-n3">BSB</p>
                        <p class="mt-n3">Account Number</p>
                      </v-col>
                      <v-col cols="9">
                        <p>{{ editedItem.consultantBillingContact }}</p>
                        <p class="mt-n3">{{ editedItem.consultantFinancialInstitution }}</p>
                        <p class="mt-n3">{{ editedItem.consultantBsb }}</p>
                        <p class="mt-n3">{{ editedItem.consultantAccount }}</p>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-card-text>
                <v-card-actions class="mt-n10">
                  <v-spacer></v-spacer>
                  <v-btn
                    color="primary darken-1"
                    text
                    @click="invoiceDialog = false"
                  >
                    Cancel
                  </v-btn>
                  <v-btn
                    color="primary darken-1"
                    text
                    @click="save"
                  >
                    Save
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-toolbar>
          <v-row no-gutters>
             <v-col cols="12" v-for="invoice in invoices" :key="invoice.uuid" class="pa-1">
               <v-card color="white" light>
                 <v-card-title>
                   {{ invoice.clientName }}
                   <v-spacer></v-spacer>
                   {{ invoice.invoiceId }}
                 </v-card-title>
               </v-card>
             </v-col>
           </v-row>
        </v-card>
      </v-col>
      <v-col cols="3" class="pr-3">
        <v-card
          outlined
          class="fill-height"
          tile
        >
          <v-toolbar dense dark color="elevation-0">
           <v-toolbar-title>📮 Sent</v-toolbar-title>
          </v-toolbar>
        </v-card>
      </v-col>
      <v-col cols="3">
        <v-card
          outlined
          class="fill-height"
          tile
        >
          <v-toolbar dense dark color='elevation-0'>
           <v-toolbar-title>😎 Paid</v-toolbar-title>
          </v-toolbar>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { v4 as uuidv4 } from 'uuid'
import { mapState, mapActions } from 'vuex'
export default {
  name: 'Invoices',
  data () {
    return {
      invoiceDialog: false,
      client: {},
      editedItem: {
        uuid: uuidv4(),
        timestamp: Date.now(),
        invoiceId: '',
        status: 'inProgress',
        clientName: '',
        items: '',
        total: 2000,
        currency: 'AUD',
        consultantName: '',
        consultantEmail: '',
        consultantBillingContact: '',
        consultantBillingAddress: '',
        consultantFinancialInstitution: '',
        consultantBsb: '',
        consultantAccount: '',
        clientBillingContact: '',
        clientBillingAddress: ''
      }
    }
  },
  computed: {
    ...mapState('ledger', ['clients', 'consultantProfile', 'invoices'])
  },
  methods: {
    ...mapActions('ledger', ['saveInvoice']),
    save () {
      this.saveInvoice({ invoice: this.editedItem, action: this.action })
      this.invoiceDialog = false
    },
    getDate () {
      const invDate = new Date(this.editedItem.timestamp)
      return `${invDate.getFullYear()}/${invDate.getMonth()}/${invDate.getDate()}`
    },
    getDueDate () {
      const invDate = new Date(this.editedItem.timestamp + (7 * 24 * 3600 * 1000))
      return `${invDate.getFullYear()}/${invDate.getMonth()}/${invDate.getDate()}`
    }
  },
  watch: {
    consultantProfile (profile) {
      this.editedItem.consultantName = profile.name
      this.editedItem.consultantEmail = profile.email
      this.editedItem.consultantBillingContact = profile.billingContact
      this.editedItem.consultantBillingAddress = profile.billingAddress
      this.editedItem.consultantFinancialInstitution = profile.financialInstitution
      this.editedItem.consultantBsb = profile.bsb
      this.editedItem.consultantAccount = profile.account
    },
    client (c) {
      this.editedItem.clientName = c.name
      this.editedItem.clientBillingContact = c.billingContact
      this.editedItem.clientBillingAddress = c.billingAddress
    },
    invoices (inv) {
      this.editedItem.invoiceId = (inv.length + 1).toString().padStart(4, '0')
    }
  },
  created () {
    if (localStorage.getItem('agentPubKey')) {
      this.holo = false
      this.$store.dispatch('ledger/initialise').then(this.$store.dispatch('ledger/fetchInvoices'))
    }
  }
}
</script>
