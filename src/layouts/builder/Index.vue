<template>
  <v-app>
    <v-main>
      <v-fade-transition mode="out-in">
        <router-view class="fill-height" />
      </v-fade-transition>
      <!-- <v-navigation-drawer
        v-model="notesDrawerOpen"
        fixed
        dark
        class="overflow-visible pa-0"
        right
        width="350"
        style="overflow: visible">
        <v-system-bar window dark>
          <v-icon>mdi-note-multiple-outline</v-icon>
          <span>Notes</span>
          <v-spacer></v-spacer>
          <v-btn
            id="add-sticky-note"
            color="action"
            icon
            @click="isEditing = true"
            small>
            <v-icon>mdi-note-plus-outline</v-icon>
          </v-btn>
          <v-icon @click="notesDrawerOpen = false">mdi-close-box-outline</v-icon>
        </v-system-bar>
        <notes :notes="notes">
          <v-col v-if="isEditing" cols="12">
            <note-edit @done="isEditing = false" />
          </v-col>
        </notes>
      </v-navigation-drawer> -->
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: 'DefaultLayout',
  data () {
    return {
      notesDrawerOpen: false,
      fab: false
    }
  }
}
</script>
