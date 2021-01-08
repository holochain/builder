/**
 * plugins/vuetify.js
 *
 * Vuetify documentation: https://vuetifyjs.com/
 */

// Imports
import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import colors from 'vuetify/lib/util/colors'
import { preset } from 'vue-cli-plugin-vuetify-preset-reply/preset'

Vue.use(Vuetify)

export default new Vuetify({
  preset,
  theme: {
    themes: {
      light: {
        primary: colors.indigo.base
      }
    }
  }
})
