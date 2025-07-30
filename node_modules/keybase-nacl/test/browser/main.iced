
mods =
  sigs : require '../files/0_sigs.iced'
  encrypt : require '../files/1_encrypt.iced'
  scalarmult : require '../files/2_scalarmult.iced'

{BrowserRunner} = require('iced-test')

window.onload = () ->
  br = new BrowserRunner { log : "log", rc : "rc" }
  await br.run mods, defer rc
