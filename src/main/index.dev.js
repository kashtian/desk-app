require('electron').app.on('ready', () => {
  // Install `electron-debug` with `devtron`
  require('electron-debug')({ showDevTools: true })

  // Install `vue-devtools`
  let installExtension = require('electron-devtools-installer')
  installExtension.default(installExtension.VUEJS_DEVTOOLS)
    .then((name) => {})
    .catch(err => {
      console.log('Unable to install `vue-devtools`: \n', err)
    })
})

