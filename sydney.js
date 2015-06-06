// Sydney
// ======
//
// [ ![Codeship Status for xaviervia/sydney](https://codeship.com/projects/317ce050-9903-0132-893b-365d53813970/status?branch=master)](https://codeship.com/projects/63545) [![Code Climate](https://codeclimate.com/github/xaviervia/sydney/badges/gpa.svg)](https://codeclimate.com/github/xaviervia/sydney) [![Test Coverage](https://codeclimate.com/github/xaviervia/sydney/badges/coverage.svg)](https://codeclimate.com/github/xaviervia/sydney/coverage)
//
// Event [Subscription]()/[Venue]() library. Whole new approach:
//
// - Asynchronous emission only. Synchronous programming is over.
// - The venue is a middleware. Propagation in the venue is mediated by
//   the main callback.
// - Subscribers are venues too. Broadcasting back into the source venue is
//   done by adding the source venue as a subscriber to its own subscribers
//   (this is called `linking`).
//
// The way events are treated is completely different. You can think of them
// as full requests, with headers and payload:
//
// - There is no difference between the event and the arguments sent to the
//   event. Events are assumed to be complex objects.
// - Optional `endpoint`s allow venues to check whether they are interested
//   in an event or not. This allows venues to link to each other promiscuously
//   and achieve very complex topologies in a scalable manner.
//
// > This is still alpha code.
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
  // Methods
  // -------
  //
  // ### new
  //
  // The constructor can be called with several different arguments:
  //
  // **`new Sydney( Function callback )`**
  //
  // Creates the venue with the `Function` as the callback.
  //
  // **`new Sydney( Object endpoint )`**
  //
  // Given that the argument has a `match` method, it is interpreted as an
  // `endpoint`. In that case, the venue is initialized with the argument as
  // `endpoint` and no `callback`.
  //
  // **`new Sydney( Object endpoint, Function callback )`**
  //
  // Adds the endpoint and callback in a new Sydney venue.
  //
  // > Note that `new` is completely optional. Calling `Sydney` as a function
  // > directly will have the same effect.
  //
  // #### Returns
  //
  // - `Sydney` this
  //
  var Sydney = function (first, second) {
    if (!(this instanceof Sydney)) return new Sydney(first, second)

    if (second) {
      this.endpoint = first
      this.callback = second
    }

    else if (first) {
      if (first.callback && first.endpoint) {
        this.callback = first.callback.bind(first)
        this.endpoint = first.endpoint
      }

      if (first.callback) this.callback = first.callback.bind(first)
      else if (first.endpoint) this.endpoint = first.endpoint
      else if (first.match) this.endpoint = first
      else this.callback = first
    }
  }

  Sydney.testIfNextTickSupported = function () {
    try {
      if (global.process.nextTick instanceof Function)
        Sydney.nextTickSupported = true
      else
        Sydney.nextTickSupported = false
    }

    catch (e) { Sydney.nextTickSupported = false }
  }

  // ### Sydney.find( query, haystack )
  //
  // Finds and returns a subscriber from the haystack so that:
  //
  // - It is exactly the same object as the `query` or
  // - Its endpoint is exactly the same object as the `query` or
  // - Its callback is exactly the same object as the `query` or
  // - Its endpoint is exactly the same object as the `query.endpoint` or
  // - Its callback is exactly the same object as the `query.callback`
  //
  // Returns `undefined` if not found.
  //
  // #### Arguments
  //
  // - `Object` query
  // - `Sydney` haystack
  //
  // #### Returns
  //
  // - `Sydney` subscriber | `undefined`
  //
  Sydney.find = function (query, haystack) {
    var index   = 0
    var length  = (haystack.subscribers = haystack.subscribers || []).length

    for (; index < length; index ++)
      if (haystack.subscribers[index].callback === query ||
          haystack.subscribers[index].endpoint === query ||
          haystack.subscribers[index].callback === query.callback ||
          haystack.subscribers[index].endpoint === query.endpoint ||
          haystack.subscribers[index] === query)
        return haystack.subscribers[index]
  }

  // ### Sydney.amplify( vanillaSubscriber )
  //
  // Adds `Sydney.prototype` methods as mixin to the `vanillaSubscriber`.
  //
  Sydney.amplify = function (vanillaSubscriber) {
    if (vanillaSubscriber.add === undefined)
      vanillaSubscriber.add = Sydney.prototype.add

    if (vanillaSubscriber.broadcast === undefined)
      vanillaSubscriber.broadcast = Sydney.prototype.broadcast

    if (vanillaSubscriber.link === undefined)
      vanillaSubscriber.link = Sydney.prototype.link

    if (vanillaSubscriber.remove === undefined)
      vanillaSubscriber.remove = Sydney.prototype.remove

    if (vanillaSubscriber.send === undefined)
      vanillaSubscriber.send = Sydney.prototype.send

    if (vanillaSubscriber.unlink === undefined)
      vanillaSubscriber.unlink = Sydney.prototype.unlink
  }

  // ### send( event )
  //
  // If the venue has an `endpoint`, it calls `match` with the `event` and
  // only calls the `callback` if the return value is `true`. If there is no
  // `endpoint` it always calls the `callback`. The callback is called with
  // the `event` as the first argument and the venue (`this`) as the second
  // argument.
  //
  // If there is no `callback`, the event is broadcasted to the subscribers
  // instead. That is done by calling `broadcast` with the `event` as
  // argument.
  //
  // #### Arguments
  //
  // - `Object` event
  //
  // #### Returns
  //
  // - `Sydney` this
  //
  Sydney.prototype.send = function (event) {
    var callback;

    if (this.callback)
      callback = function () { this.callback(event, this) }.bind(this)

    else callback = function () { this.broadcast(event) }.bind(this)

    if (this.endpoint && ! this.endpoint.match(event)) return this

    if (Sydney.nextTickSupported === undefined) Sydney.testIfNextTickSupported()

    if (Sydney.nextTickSupported) process.nextTick(callback)
    else  setTimeout(callback, 0)

    return this
  }

  // ### broadcast( event )
  //
  // Calls `send` with the provided `event` in all the subscribers.
  //
  // #### Arguments
  //
  // - `Object` event
  //
  // #### Returns
  //
  // - `Sydney` this
  //
  Sydney.prototype.broadcast = function (event) {
    (this.subscribers = this.subscribers || []).forEach(function (subscriber) {
      subscriber.send(event)
    })

    return this
  }

  // ### add( subscriber )
  //
  // If the `subscriber` is a `Sydney` venue, it just adds it as a
  // subscriber in the current venue.
  //
  // If the `subscriber` is not a `Sydney` module, it adds all of `Sydney`
  // methods to the `subscriber`. It doesn't override properties already
  // existing on the `subscriber`.
  //
  // #### Returns
  //
  // - `Sydney` this
  //
  Sydney.prototype.add = function (subscriber) {
    this.subscribers = this.subscribers || []

    if (!(subscriber instanceof Sydney))
      Sydney.amplify(subscriber)

    this.subscribers.push(subscriber)

    return this
  }

  // ### remove( query )
  //
  // If the `query` is `===` to the callback of a subscriber, removes that
  // subscriber from the array.
  //
  // If the `query` is `===` to the endpoint of a subscriber, removes that
  // subscriber from the array.
  //
  // If the `query` is `===` to a subscriber, removes that subscriber.
  //
  // If the `query.callback` is `===` to the callback of a subscriber, removes
  // that subscriber from the array.
  //
  // If the `query.endpoint` is `===` to the endpoint of a subscriber, removes
  // that subscriber from the array.
  //
  // #### Arguments
  //
  // - `Object` query
  //
  // #### Returns
  //
  // - `Sydney` this
  //
  Sydney.prototype.remove = function (query) {
    var target, index;

    target = Sydney.find(query, this)

    if ( ! target) return this

    index = this.subscribers.indexOf(Sydney.find(query, this))

    if (index === -1) return this

    this.subscribers.splice(index, 1)

    return this
  }

  // ### link
  //
  // This method can be called with several different arguments:
  //
  // **`link( Function callback )`**
  //
  // Wraps the `Function` to a Sydney and adds it to the `subscribers`. Then
  // adds `this` back into the new Sydney.
  //
  // **`link( Sydney subscriber )`**
  //
  // Adds the subscriber to the `subscribers` array .Then
  // adds `this` back into the provided subscriber.
  //
  // **`link( Object endpoint, Function callback )`**
  //
  // Wraps the endpoint and callback in a new Sydney venue and adds that as
  // a subscriber. Then adds `this` back into the new Sydney.
  //
  // **`link( Object protoSubscriber )`**
  //
  // Wraps the `callback` and/or `endpoint` of the `protoSubscriber` into a new
  // Sydney venue and adds it as a subscriber. Then adds `this` back into the
  // new subscriber.
  //
  // If the `protoSubscriber` has a `callback`, it binds that callback to the
  // `protoSubscriber` so that it doesn't lose context.
  //
  // #### Returns
  //
  // - `Sydney` this
  //
  Sydney.prototype.link = function (first, second) {
    var subscriber = Sydney.make(first, second)

    this.add(subscriber)

    subscriber.add(this)

    return this
  }

  // ### unlink( query )
  //
  // If the `query` is `===` to the callback of a subscriber, removes that
  // subscriber from the array. Also removes `this` from the subscriber.
  //
  // If the `query` is `===` to the endpoint of a subscriber, removes that
  // subscriber from the array. Also removes `this` from the subscriber.
  //
  // If the `query` is `===` to a subscriber, removes that subscriber. Also
  // removes `this` from the subscriber.
  //
  // If the `query.endpoint` is `===` to the endpoint of a subscriber, removes
  // that subscriber from the array. Also removes `this` from the subscriber.
  //
  // If the `query.callback` is `===` to the callback of a subscriber, removes
  // that subscriber from the array. Also removes `this` from the subscriber.
  //
  // #### Arguments
  //
  // - `Object` query
  //
  // #### Returns
  //
  // - `Sydney` this
  //
  Sydney.prototype.unlink = function (query) {
    query = Sydney.find(query, this)

    if (query) {
      query.remove(this)

      this.remove(query)
    }

    return this
  }


  return Sydney

})
//
// Testing
// -------
//
// ```
// git clone git://github.com/xaviervia/sydney
// cd sydney
// npm install
// make test
// ```
//
// License
// -------
//
// Copyright 2015 Xavier Via
//
// ISC license.
//
// See [LICENSE](LICENSE) attached.
