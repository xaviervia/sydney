Sydney
======

[ ![Codeship Status for xaviervia/sydney](https://codeship.com/projects/317ce050-9903-0132-893b-365d53813970/status?branch=master)](https://codeship.com/projects/63545)

Event [Subscription]()/[Venue]() library. Whole new approach:

- Asynchronous emission only. Synchronous programming is over.
- The venue is a middleware. Propagation in the venue is mediated by
  the main callback.
- Subscribers are venues too. Broadcasting back into the source venue is
  done by adding the source venue as a subscriber to its own subscribers
  (this is called `linking`).

The way events are treated is completely different. You can think of them
as full requests, with headers and payload:

- There is no difference between the event and the arguments sent to the
  event. Events are assumed to be complex objects.
- Optional `endpoint`s allow venues to check whether they are interested
  in an event or not. This allows venues to link to each other promiscuously
  and achieve very complex topologies in a scalable manner.

> This is still alpha code.

Installation
------------

```shell
npm install --save sydney
```

Methods
-------

### new

The constructor can be called with several different arguments:

**`new Sydney( Function callback )`**

Creates the venue with the `Function` as the callback.

**`new Sydney( Object endpoint )`**

Given that the argument has a `match` method, it is interpreted as an
`endpoint`. In that case, the venue is initialized with the argument as
`endpoint` and no `callback`.

**`new Sydney( Object endpoint, Function callback )`**

Adds the endpoint and callback in a new Sydney venue.

> Note that `new` is completely optional. Calling `Sydney` as a function
> directly will have the same effect.

#### Returns

- `Sydney` this

### send( event )

If the venue has an `endpoint`, it calls `match` with the `event` and
only calls the `callback` if the return value is `true`. If there is no
`endpoint` it always calls the `callback`. The callback is called with
the `event` as the first argument and the venue (`this`) as the second
argument.

If there is no `callback`, the event is broadcasted to the subscribers
instead. That is done by calling `broadcast` with the `event` as
argument.

#### Arguments

- `Object` event

#### Returns

- `Sydney` this

### broadcast( event )

Calls `send` with the provided `event` in all the subscribers.

#### Arguments

- `Object` event

#### Returns

- `Sydney` this

### find( query )

Finds and returns a subscriber so that:

- It is exactly the same object as the `query`
- Its endpoint is exactly the same object as the `query`
- Its callback is exactly the same object as the `callback`

Returns undefined if not found.

#### Arguments

- `Object` query

#### Returns

- `Sydney` subscriber | `undefined`

### add

This method can be called with several different arguments:

**`add( Function callback )`**

Wraps the `Function` to a Sydney and adds it to the `subscribers`.

**`add( Sydney subscriber )`**

Adds the subscriber to the `subscribers` array.

**`add( Object endpoint, Function callback )`**

Wraps the endpoint and callback in a new Sydney venue and adds that as
a subscriber.

#### Returns

- `Sydney` this

### remove( query )

If the `query` is `===` to the callback of a subscriber, removes that
subscriber from the array.

If the `query` is `===` to the endpoint of a subscriber, removes that
subscriber from the array.

If the `query` is `===` to a subscriber, removes that subscriber.

#### Arguments

- `Object` query

#### Returns

- `Sydney` this

### link

This method can be called with several different arguments:

**`link( Function callback )`**

Wraps the `Function` to a Sydney and adds it to the `subscribers`. Then
adds `this` back into the new Sydney.

**`link( Sydney subscriber )`**

Adds the subscriber to the `subscribers` array .Then
adds `this` back into the provided subscriber.

**`link( Object endpoint, Function callback )`**

Wraps the endpoint and callback in a new Sydney venue and adds that as
a subscriber. Then adds `this` back into the new Sydney.

#### Returns

- `Sydney` this

### unlink( query )

If the `query` is `===` to the callback of a subscriber, removes that
subscriber from the array. Also removes `this` from the subscriber.

If the `query` is `===` to the endpoint of a subscriber, removes that
subscriber from the array. Also removes `this` from the subscriber.

If the `query` is `===` to a subscriber, removes that subscriber. Also
removes `this` from the subscriber.

#### Arguments

- `Object` query

#### Returns

- `Sydney` this

License
-------

Copyright 2015 Xavier Via

ISC license.

See [LICENSE](LICENSE) attached.
