import Vue from 'vue'

const requireCard = require.context('.', false, /\.card\.vue$/)
requireCard.keys().forEach(filename => {
  const componentName = filename.replace(/(\.\/|\.card\.vue)/g, '')
  return Vue.component(componentName, requireCard(filename).default)
})
