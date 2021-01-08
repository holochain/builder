module.exports = {
  devServer: {
    disableHostCheck: true
  },
  transpileDependencies: [
    'vuetify'
  ],
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true
    }
  }
}
