<template>
  <v-card>
    <v-app-bar app dense dark>
      <v-avatar class="mr-1" size="40">
        <v-img
          contain
          max-height="90%"
          :src="require('@/assets/holochain-halo.png')"
        ></v-img>
      </v-avatar>
      <v-toolbar-title>
        <v-btn class="title font-weight-black headline" text to="ledger/invoices">
          ledger
        </v-btn>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn v-if="holo" text to="login">
        Login
      </v-btn>
      <v-btn v-if="holo" text to="register">
        Register
      </v-btn>
    </v-app-bar>
    <section id="hero">
      <v-row no-gutters>
        <v-img
          :min-height="'calc(100vh - ' + $vuetify.application.top + 'px)'"
          src="https://images.unsplash.com/photo-1487017159836-4e23ece2e4cf?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1951&q=80"
        >
          <v-theme-provider dark>
            <v-container fill-height>
              <v-row
                align="center"
                class="white--text mx-auto"
                justify="center"
              >
                <v-col
                  class="white--text text-center"
                  cols="12"
                  tag="h1"
                >
                  <span
                  :class="[$vuetify.breakpoint.smAndDown ? 'display-1' : 'display-2']"
                    class="font-weight-light"
                  >
                    WELCOME TO
                  </span>
                  <br>
                  <span
                    :class="[$vuetify.breakpoint.smAndDown ? 'display-3': 'display-4']"
                    class="font-weight-black"
                  >
                    Ledger
                  </span>
                </v-col>
                <v-btn
                  class="align-self-end"
                  fab
                  outlined
                  @click="$vuetify.goTo('#about-me')"
                >
                  <v-icon>mdi-chevron-double-down</v-icon>
                </v-btn>
              </v-row>
            </v-container>
          </v-theme-provider>
        </v-img>
      </v-row>
    </section>
    <section id="about-me">
      <div class="py-12"></div>
      <v-container class="text-center">
        <h2 class="display-2 font-weight-bold mb-3">Simple</h2>
        <v-responsive
          class="mx-auto mb-8"
          width="56"
        >
          <v-divider class="mb-1"></v-divider>
          <v-divider></v-divider>
        </v-responsive>
        <v-responsive
          class="mx-auto title font-weight-light mb-8"
          max-width="720"
        >
          Ledger is an invoicing and expenses app designed for the individual consultant. Add how you want to get paid to the consultsant profile and then add clients. Record the work you are doing for a client as line items in an invoice. When you send the invocie to be paid simply drag it to the "Sent" column and when it's paid drag it to the "Paid" column.
        </v-responsive>
        <v-avatar
          class="elevation-12 mb-12"
          size="150"
        >
          <v-img src="https://holo.host/wp-content/uploads/Philip-Beadle.jpg"></v-img>
        </v-avatar>
      </v-container>
    </section>
    <section
      id="features"
    >
      <div class="py-12"></div>
      <v-container class="text-center">
        <h2 class="display-2 font-weight-bold mb-3">Ledger Features</h2>
        <v-responsive
          class="mx-auto mb-12"
          width="56"
        >
          <v-divider class="mb-1"></v-divider>
          <v-divider></v-divider>
        </v-responsive>
        <v-row>
          <v-col
            v-for="({ icon, title, text }, i) in features"
            :key="i"
            cols="12"
            md="6"
          >
            <v-card
              class="py-12 px-4"
              flat
            >
              <v-theme-provider dark>
                <div>
                  <v-avatar
                    color="primary"
                    size="88"
                  >
                    <v-icon
                      large
                      v-text="icon"
                    ></v-icon>
                  </v-avatar>
                </div>
              </v-theme-provider>
              <v-card-title
                class="justify-center font-weight-black text-uppercase"
                v-text="title"
              ></v-card-title>
              <v-card-text
                class="subtitle-1"
                v-text="text"
              >
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
      <div class="py-12"></div>
    </section>
    <v-footer
      class="justify-center"
      color="#292929"
      height="100"
    >
      <div class="title font-weight-light grey--text text--lighten-1 text-center">
        &copy; {{ (new Date()).getFullYear() }} — Made with 💜 by Philip Beadle
      </div>
    </v-footer>
  </v-card>
</template>

<script>
export default {
  name: 'Home',
  data () {
    return {
      holo: true,
      features: [
        {
          icon: 'mdi-dna',
          title: 'Ledger',
          text: 'Manage your clident list, invoices for each client and expenses.'
        },
        {
          icon: 'mdi-shield-outline',
          title: 'Powered by Holochain',
          text: `Each of us wants to have control over how and with whom we interact. In order to evolve and thrive, our communities must support everyone's uniqueness. Yet today, our online relationships are dominated by centralized corporate web sites. 
          Holochain enables a distributed web with user autonomy built directly into its architecture and protocols. 
          Data is about remembering our lived and shared experiences. 
          Distributing the storage and processing of that data can change how we coordinate and interact. 
          With digital integration under user control, Holochain liberates our online lives from corporate control over our choices and information.`
        }
      ]
    }
  },
  created () {
    if (localStorage.getItem('agentPubKey')) this.holo = false
  }
}
</script>
