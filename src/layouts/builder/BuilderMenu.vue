<template>
  <v-menu bottom min-width="200px" rounded offset-y>
    <template v-slot:activator="{ on }">
      <v-app-bar-nav-icon v-on="on" small/>
    </template>
    <v-list>
      <v-list-item to="/builder/organisations">
        <v-list-item-content>
          <v-list-item-title>Organisations</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item to="/builder/developer">
        <v-list-item-content>
          <v-list-item-title>Developer</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item to="/builder/kanban">
        <v-list-item-content>
          <v-list-item-title>Kanban</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script>
export default {
  name: 'BuilderMenu'
}
</script>
