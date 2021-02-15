<template>
  <span @click="onEmojiClick" class="title">{{ emoji.value }}</span>
</template>

<script>
export default {
  data () {
    return {}
  },
  props: ['emoji'],
  methods: {
    onEmojiClick () {
      this.$emit('click', this.emoji)
    }
  }
}
</script>
