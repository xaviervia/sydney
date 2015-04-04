
"use strict"


var example = require("washington")
var Sydney  = require("../sydney")


example("#link: add as subscriber", function () {
  var mother    = new Sydney
  var daughter  = new Sydney

  mother.link(daughter)

  return mother.subscribers[0] === daughter
})


example("#link: subscribe back the venue", function () {
  var mother    = new Sydney
  var daughter  = new Sydney

  mother.link(daughter)

  return daughter.subscribers[0] === mother
})


example("#link: @function create venue and add as subscriber", function () {
  var mother            = new Sydney
  var daughterCallback  = function () {}

  mother.link(daughterCallback)

  return mother.subscribers[0].callback === daughterCallback
})


example("#link: @function subscribe back the venue", function () {
  var mother            = new Sydney
  var daughterCallback  = function () {}

  mother.link(daughterCallback)

  return mother.subscribers[0].subscribers[0] === mother
})


example("#link: chainable", function () {
  var mother = new Sydney

  return mother.link(function () {}) === mother
})
