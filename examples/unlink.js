

"use strict"


let example = require("washington")
let Sydney  = require("../sydney")


example("#unlink: remove from venue", function () {
  let mother    = new Sydney
  let daughter  = new Sydney

  mother.link(daughter)

  mother.unlink(daughter)

  return mother.subscribers.length === 0
})


example("#unlink: remove venue from subscriber", function () {
  let mother    = new Sydney
  let daughter  = new Sydney

  mother.link(daughter)

  mother.unlink(daughter)

  return daughter.subscribers.length === 0
})


example("#unlink: @function remove from venue", function () {
  let mother            = new Sydney
  let daughterCallback  = function () {}

  mother.link(daughterCallback)

  mother.unlink(daughterCallback)

  return mother.subscribers.length === 0
})


example("#unlink: @function remove venue from subscriber", function () {
  let mother            = new Sydney
  let daughterCallback  = function () {}
  let daughter          = undefined

  mother.link(daughterCallback)

  daughter = mother.find(daughterCallback)

  mother.unlink(daughterCallback)

  return daughter.subscribers.length === 0
})


example("#unlink: chainable", function () {
  let mother    = new Sydney
  let daughter  = new Sydney

  mother.link(daughter)

  return mother.unlink(daughter) === mother
})
