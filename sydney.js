// Sydney
// ======
//
// [ ![Codeship Status for xaviervia/sydney](https://codeship.com/projects/317ce050-9903-0132-893b-365d53813970/status?branch=master)](https://codeship.com/projects/63545)
//
// Event [Subscription]()/[Venue]() library. Whole new approach:
//
// - Asynchronous emission only.
// - The venue is a middlewares. Propagation in the venue is mediated by
//   the main callback.
//
// Installation
// ------------
//
// ```shell
// npm install --save sydney
// ```
//

"use strict";

(function (name, definition) {

  //! AMD
  if (typeof define === 'function')
    define(definition)

  //! CommonJS
  else if (typeof module !== 'undefined' && module.exports)
    module.exports = definition()

  //! Browser
  else {
    var theModule = definition(), global = window, old = global[name];

    theModule.noConflict = function () {
      global[name] = old;
      return theModule;
    }

    global[name] = theModule
  }

})('Sydney', function () {

  var Sydney = function (first, second) {
    if (!(this instanceof Sydney)) return new Sydney(first, second)

    if (second) {
      this.endpoint = first
      this.callback = second
    }

    else this.callback = first

    this.subscribers = []
  }


  Sydney.prototype.send = function (event) {
    var callback = function () { this.callback(event, this) }.bind(this)

    if (process && process.nextTick) process.nextTick(callback)
    else if (setImmediate) setImmediate(callback)
    else setTimeout(callback, 0)

    return this
  }


  Sydney.prototype.broadcast = function (event) {
    this.subscribers.forEach(function (subscriber) {
      subscriber.send(event)
    })

    return this
  }


  Sydney.prototype.find = function (toBeFound) {
    var index   = 0
    var length  = this.subscribers.length

    for (; index < length; index ++)
      if (this.subscribers[index].callback === toBeFound ||
          this.subscribers[index].endpoint === toBeFound ||
          this.subscribers[index] === toBeFound)
        return this.subscribers[index]
  }


  Sydney.prototype.add = function (first, second) {
    if (second) this.subscribers.push(new Sydney(first, second))

    else {
      if (first instanceof Function) first = new Sydney(first)

      this.subscribers.push(first)
    }

    return this
  }


  Sydney.prototype.remove = function (toBeRemoved) {
    this.subscribers = this.subscribers.filter(function (subscriber) {
      if (toBeRemoved instanceof Function)
        return subscriber.callback !== toBeRemoved

      else if (toBeRemoved.match instanceof Function)
        return subscriber.endpoint !== toBeRemoved

      return subscriber !== toBeRemoved
    })

    return this
  }


  Sydney.prototype.link = function (first, second) {
    if (second) first = new Sydney(first, second)

    else if (first instanceof Function) first = new Sydney(first)

    this.add(first)

    first.add(this)

    return this
  }


  Sydney.prototype.unlink = function (toBeUnlinked) {
    toBeUnlinked = this.find(toBeUnlinked)

    toBeUnlinked.remove(this)

    this.remove(toBeUnlinked)

    return this
  }


  return Sydney

})
// License
// -------
//
// Copyright 2015 Xavier Via
//
// ISC license.
//
// See [LICENSE](LICENSE) attached.
