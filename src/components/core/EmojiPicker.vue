<template>
  <v-dialog v-model="isOpen" scrollable width="400px">
    <v-card height="400px">
      <v-card-title class="white--text">
        <span class="headline">Emoji Picker</span>
      </v-card-title>
      <v-card-text class="scroll">
        <emoji
          v-for="emoji in emojis"
          v-bind:key="emoji.key"
          :emoji="emoji"
          @click="addEmoji"
        ></emoji>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
<script>
import { mapState } from 'vuex'
export default {
  name: 'EmojiPicker',
  components: {
    Emoji: () => import('@/components/core/Emoji.vue')
  },
  props: ['isOpen'],
  methods: {
    addEmoji (emoji) {
      this.$emit('add-emoji', emoji)
    }
  },
  computed: {
    ...mapState('emojis', ['emojis'])
  }
}
</script>
<style scoped>
.scroll {
   overflow-y: scroll
}
</style>
