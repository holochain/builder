<template>
  <div id="console" class="std-container">
    <ul class="pb-10 pl-1">
      <li
        v-for="(message, i) in messages"
        :key="`${message}${i}`"
        class="message"
      >
        <message :message="message" :key="i" />
      </li>
    </ul>
  </div>
</template>
<script>
export default {
  name: 'Messages',
  props: ['messages'],
  components: {
    Message: () => import('@/components/Message.vue')
  },
  methods: {
    scrollToEnd () {
      this.$el.scrollTop = this.$el.scrollHeight
    }
  },
  updated () {
    this.$nextTick(() => this.scrollToEnd())
  }
}
</script>
<style scoped>
.std-container {
  box-sizing: border-box;
  overflow-y: auto;
  background-color: black;
  height: 350px;
}
ul {
  list-style-type: none;
}
</style>
