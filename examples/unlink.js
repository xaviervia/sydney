
"use strict"


var example = require("washington")
var Sydney  = require("../sydney")


example("#unlink: remove from venue", function () {
  var mother    = new Sydney
  var daughter  = new Sydney

  mother.link(daughter)

  mother.unlink(daughter)

  return mother.subscribers.length === 0
})


example("#unlink: remove venue from subscriber", function () {
  var mother    = new Sydney
  var daughter  = new Sydney

  mother.link(daughter)

  mother.unlink(daughter)

  return daughter.subscribers.length === 0
})


example("#unlink: @function remove from venue", function () {
  var mother            = new Sydney
  var daughterCallback  = function () {}

  mother.link(daughterCallback)

  mother.unlink(daughterCallback)

  return mother.subscribers.length === 0
})


example("#unlink: @function remove venue from subscriber", function () {
  var mother            = new Sydney
  var daughterCallback  = function () {}
  var daughter          = undefined

  mother.link(daughterCallback)

  daughter = Sydney.find(daughterCallback, mother)

  mother.unlink(daughterCallback)

  return daughter.subscribers.length === 0
})


example("#unlink: @endpoint remove from venue", function () {
  var mother            = new Sydney
  var endpoint          = { match: function () {} }
  var daughterCallback  = function () {}

  mother.link(endpoint, daughterCallback)

  mother.unlink(endpoint)

  return mother.subscribers.length === 0
})


example("#unlink: @endpoint remove venue from subscriber", function () {
  var mother            = new Sydney
  var endpoint          = { match: function () {} }
  var daughterCallback  = function () {}
  var daughter          = undefined

  mother.link(endpoint, daughterCallback)

  daughter = Sydney.find(daughterCallback, mother)

  mother.unlink(endpoint)

  return daughter.subscribers.length === 0
})


example("#unlink: chainable", function () {
  var mother    = new Sydney
  var daughter  = new Sydney

  mother.link(daughter)

  return mother.unlink(daughter) === mother
})


example("#unlink: @no-subscribers won't fail", function () {
  new Sydney().unlink(new Sydney)
})
