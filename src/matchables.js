var example = require("washington")
var assert  = require("assert")



// Matchable
// =========
//
// A common parent for all matchables. The interface that they are supposed to
// implement (although `Matchable` itself does not) is to expose a `match`
// method that returns either `true` or `false`.
//
var Matchable = function () {}



// WildcardProperty
// ================
//
// Returns `true` if the value of any property is `===` to the assigned value.
// `false` otherwise. If initialized with an inheritor of `Matchable` it will
// forward the `match` to the matchable instead.
//
// Usage:
//
// ```javascript
// // Static value property
// var wildcardProperty = new WildcardProperty("public"):
// wildcardProperty.match({"project": "public"}); // => true
//
// // Matchable
// var matchable    = new Matchable();
// matchable.match  = function () { return true } ;
// wildcardProperty = new WildcardProperty(matchable);
// wildcardProperty.match({"property": "value"}); // => true
// ```
//
var WildcardProperty = function (value) {
  this.value = value
}

WildcardProperty.prototype = new Matchable

example("WildcardProperty is a Matchable", function () {
  assert(new WildcardProperty instanceof Matchable)
})

WildcardProperty.prototype.match = function (object) {
  if (this.value instanceof Matchable) {
    for (key in object) if (this.value.match(object[key])) return true }

  else {
    for (key in object) if (object[key] === this.value) return true }

  return false
}

example("WildcardProperty + string value #match: correct value, true", function () {
  assert(
    new WildcardProperty("value")
      .match({"something": "value"}) )
})

example("WildcardProperty + string value #match: incorrect value, false", function () {
  assert(
    ! new WildcardProperty("value")
      .match({"something": "not-value"}) )
})

example("WildcardProperty + number value #match: correct value, true", function () {
  assert(
    new WildcardProperty(4)
      .match({"otherThing": 4}) )
})

example("WildcardProperty + Matchable value #match: delegate, send values to Matchable (propagate false)", function () {
  var matchable = new Matchable()
  var toMatch   = {"something": "value", "other": "other-value"}
  matchable.match = function (match) {
    (this.match.called = this.match.called || {})[match] = true
    return false }

  assert(
    ! new WildcardProperty(matchable)
      .match(toMatch) )

  assert(matchable.match.called["value"])
  assert(matchable.match.called["other-value"])
})

example("WildcardProperty + Matchable value #match: delegate, send values to Matchable (propagate true)", function () {
  var matchable = new Matchable()
  var toMatch   = {"something": "value", "other": "other-value"}
  matchable.match = function (match) {
    (this.match.called = this.match.called || {})[match] = true
    return match === "value" }

  assert(
    new WildcardProperty(matchable)
      .match(toMatch) )
})



// ExactProperty
// =============
//
// Returns `true` if there is a property with the given name which value is
// `===` to the assigned value. `false` otherwise.
//
// If initialized with an inheritor of `Matchable` it will
// forward the `match` to the matchable, if the property exists.
//
// Usage:
//
// ```javascript
// // Static value property
// var exactProperty = new ExactProperty("project", "public"):
// exactProperty.match({"project": "public"}); // => true
//
// // Matchable
// var matchable    = new Matchable();
// matchable.match  = function () { return true } ;
// exactProperty = new ExactProperty("property", matchable);
// exactProperty.match({"property": "value"}); // => true
//
// // Matchable but property missing
// var matchable    = new Matchable();
// matchable.match  = function () { return true };
// exactProperty = new ExactProperty("project", matchable);
// exactProperty.match({"property": "value"}); // => false
// ```
//
var ExactProperty = function (name, value) {
  this.name   = name
  this.value  = value
}

ExactProperty.prototype = new Matchable

example("ExactProperty is a Matchable", function () {
  assert(new ExactProperty instanceof Matchable)
})

ExactProperty.prototype.match = function (object) {
  if (this.value instanceof Matchable)
    return object[this.name] && this.value.match(object[this.name])

  return object[this.name] && object[this.name] === this.value
}

example("ExactProperty + non-Matchable #match: true if both OK", function () {
  assert(
    new ExactProperty("name", "value")
      .match({"name": "value"}) )
})

example("ExactProperty + non-Matchable #match: false if exists but value is wrong", function () {
  assert(
    ! new ExactProperty("name", "other-value")
      .match({"name": "value"}) )
})

example("ExactProperty #match: false if property is not there", function () {
  assert(
    ! new ExactProperty("other-name", "value")
      .match({"name": "value"}) )
})

example("ExactProperty + Matchable #match: delegates to matchable", function () {
  var matchable = new Matchable()
  matchable.match = function (value) {
    this.match.calledWith = value
    return true }

  assert(new ExactProperty("property", matchable).match({"property": "value"}))
  assert.equal(matchable.match.calledWith, "value")
})



// Negator
// =======
//
// Delegates the matching to the sent matchable and negates the result.
//
// Usage:
// ```javascript
// var matchable = new Matchable();
// matchable.match = function () {
//   return true;
// }
//
// var negator = new Negator(matchable);
// negator.match({"here": "ignored"}); // => false
// ```
//
var Negator = function (matchable) {
  this.matchable = matchable
}

Negator.prototype = new Matchable

Negator.prototype.match = function (object) {
  return !this.matchable.match(object)
}

example("Negator is a Matchable", function () {
  assert(new Negator instanceof Matchable)
})

example("Negator: delegates and negates", function () {
  var matchable = new Matchable
  var theObject = {}
  matchable.match = function (object) {
    this.match.calledWith = object
    return false }

  assert(
    new Negator(matchable)
      .match(theObject) )

  assert.equal(
    matchable.match.calledWith, theObject)
})



// ObjectPattern
// =============
//
// Returns the `&&` result of calling the `match` method in each `properties`,
// forwarding the argument.
//
// Usage:
// ```javascript
// var property = new ObjectPattern(
//   new ExactProperty("public", true),
//   new WildcardProperty("value"),
//   new ExactProperty("timestamp", 123456789)
// )
//
// property.match({
//   "public": true,
//   "anyProp": "value",
//   "timestamp": 123456789
// }) // => true
// ```
//
var ObjectPattern = function () {
  this.properties = []
  for (var i = 0, j = arguments.length; i < j; i ++)
    this.properties.push(arguments[i])
}

ObjectPattern.prototype = new Matchable

example("ObjectPattern is a Matchable", function () {
  assert(new ObjectPattern instanceof Matchable)
})

ObjectPattern.prototype.match = function (object) {
  for (var i = 0, j = this.properties.length; i < j; i ++)
    if (!this.properties[i].match(object)) return false

  return true
}

example("ObjectPattern: AND of three properties", function () {
  var property = new ObjectPattern(
    new ExactProperty("public", true),
    new WildcardProperty("value"),
    new ExactProperty("timestamp", 123456789)
  )

  assert(property.match({
    "public": true,
    "anyProp": "value",
    "timestamp": 123456789
  }))
})

example("ObjectPattern: AND of three properties (false)", function () {
  var property = new ObjectPattern(
    new ExactProperty("public", true),
    new WildcardProperty("value"),
    new ExactProperty("timestamp", 123456789)
  )

  assert( ! property.match({
    "public": false,
    "anyProp": "value",
    "timestamp": 123456789
  }))
})



// WildcardValue
// =============
//
// Returns always `true` except if the argument is `undefined`.
//
// Usage:
// ```javascript
// var wildcardValue = new WildcardValue();
// wildcardValue.match("something"); // => true
// ```
//
var WildcardValue = function () {}

WildcardValue.prototype = new Matchable

WildcardValue.prototype.match = function (object) {
  return object !== undefined
}

example("WildcardValue is a Matchable", function () {
  assert(new WildcardValue instanceof Matchable)
})

example("WildcardValue: true if not undefined", function () {
  assert(
    new WildcardValue().match("anything") )
})

example("WildcardValue: false if undefined", function () {
  assert(
    ! new WildcardValue().match())
})



// TypedValue
// ==========
//
// If initialized with a `Function`, returns `true` only if the argument if
// `instanceof` the `Function`.
//
// If initialized with the following `String` arguments, it returns `true`:
//
// - **number**: any value that serialized to JSON would be casted into a
//   `number` literal.
// - **string**: any value that serialized to JSON would be casted into a
//   `string` literal.
// - **array**: any value that serialized to JSON would be casted into an
//   `array` literal.
// - **object**: any value that serialized to JSON would be casted into an
//   `object` literal.
// - **boolean**: any value that serialized to JSON would be casted into
//   either `true` or `false`
//
// Usage:
//
// ```javascript
// var Type = function () {};
// var typedValue = new TypedValue(Type);
//
// typedValue.match(new Type()) // => true
// ```
//
var TypedValue = function (type) {
  this.type = type
}

TypedValue.prototype = new Matchable

example("TypedValue is a Matchable", function () {
  assert(new TypedValue instanceof Matchable)
})

TypedValue.prototype.match = function (object) {
  switch (this.type) {
    case 'array':
      return JSON.stringify(object).substring(0, 1) === '['
      break;

    case 'boolean':
      return object === true || object === false
      break

    case 'number':
      return JSON.stringify(object) === '' + object
      break

    case 'object':
      return (JSON.stringify(object) || '').substring(0, 1) === '{'
      break

    case 'string':
      return JSON.stringify(object) === '"' + object + '"'
      break

    default:
      return object instanceof this.type
  }
}

example("TypedValue: true if value is of type", function () {
  assert(new TypedValue(Matchable).match(new Matchable))
})

example("TypedValue: false if value is not of type", function () {
  assert( ! new TypedValue(TypedValue).match(new Matchable))
})

example("TypedValue + 'number': true if value is an integer", function () {
  assert(new TypedValue('number').match(3))
})

example("TypedValue + 'number': true if value is a float", function () {
  assert(new TypedValue('number').match(-2.4))
})

example("TypedValue + 'number': false if value is a string", function () {
  assert( ! new TypedValue('number').match('-1'))
})

example("TypedValue + 'string': true if value is a plain String", function () {
  assert(new TypedValue('string').match('some string'))
})

example("TypedValue + 'string': true if value is a String object", function () {
  assert(new TypedValue('string').match(new String('some string')))
})

example("TypedValue + 'string': false if value is a number", function () {
  assert( ! new TypedValue('string').match(3))
})

example("TypedValue + 'array': true if value is an Array", function () {
  assert(new TypedValue('array').match(new Array))
})

example("TypedValue + 'array': false if value is arguments object", function () {
  assert( ! new TypedValue('array').match(arguments))
})

example("TypedValue + 'array': false if value is a regular object", function () {
  assert( ! new TypedValue('array').match({}))
})

example("TypedValue + 'boolean': true if value is true", function () {
  assert(new TypedValue('boolean').match(true))
})

example("TypedValue + 'boolean': true if value is false", function () {
  assert(new TypedValue('boolean').match(false))
})

example("TypedValue + 'object': true if value is a regular object", function () {
  assert(new TypedValue('object').match({}))
})

example("TypedValue + 'object': false if value is a string", function () {
  assert( ! new TypedValue('object').match('string'))
})

example("TypedValue + 'object': false if value is a number", function () {
  assert( ! new TypedValue('object').match(-4))
})

example("TypedValue + 'object': false if value is a boolean", function () {
  assert( ! new TypedValue('object').match(true))
})

example("TypedValue + 'object': false if value is an array", function () {
  assert( ! new TypedValue('object').match([]))
})

example("TypedValue + 'object': false if value is a function", function () {
  assert( ! new TypedValue('object').match(new Function()))
})



// ArrayPattern
// ============
//
// Handles `ArrayMatchable`s, combining their results to return a final
// `Boolean` value representing whether the `Array` was or not a match.
//
// Usage:
//
// ```javascript
// var arrayMatcher = new ArrayPattern(
//   new ArrayElement( new TypedValue( 'number' ) ),
//   'user',
//   new ArrayWildcard(),
//   new ArrayEllipsis( 9 )
// );
//
// arrayMatcher.match([6, 'user', 9]); // => false
// arrayMatcher.match([-56.2, 'user', 'extra', 9]); // => true
// ```
//
var ArrayPattern = function () {
  this.matchables = []

  for (var i = 0; i < arguments.length; i ++)
    this.matchables.push(arguments[i])
}

ArrayPattern.prototype = new Matchable

ArrayPattern.prototype.match = function (array) {
  if (!(array instanceof Array))
    return false

  if (this.matchables.length === 0 && array.length > 0)
    return false

  else if (this.matchables.length === 0 && array.length === 0)
    return true

  var filteredArray = array
  var result = {}
  var i = 0

  for (; i < this.matchables.length; i ++) {
    if (this.matchables[i] instanceof ArrayMatchable) {
      result = this.matchables[i].match(filteredArray)

      if (result.matched === false)
        return false

      filteredArray = result.unmatched
    }

    else {
      if (filteredArray.length === 0)
        return false

      if (filteredArray[0] !== this.matchables[i])
        return false

      result.matched = true
      filteredArray  = filteredArray.slice(1)
    }
  }

  return result.matched && filteredArray.length === 0
}

example("ArrayPattern is a Matchable", function () {
  assert( new ArrayPattern instanceof Matchable )
})

example("ArrayPattern + undefined: false for non array", function () {
  assert( ! new ArrayPattern().match('non array') )
})

example("ArrayPattern + undefined: true for empty array", function () {
  assert( new ArrayPattern().match([]) )
})

example("ArrayPattern + undefined: false for non empty array", function () {
  assert( ! new ArrayPattern().match([ 'something' ]) )
})

example("ArrayPattern + [ArrayMatchable]: forward elements and return `matched`", function () {
  var arrayMatchable = new ArrayMatchable
  arrayMatchable.match = function () {
    this.match.called = arguments
    return {
      matched: 'matched',
      unmatched: []
    }
  }

  var result = new ArrayPattern(arrayMatchable).match(['something'])

  assert.equal( arrayMatchable.match.called[0], 'something' )
  assert.equal( result, true )
})

example("ArrayPattern + [AM]: remaining elements mean not a match", function () {
  var arrayMatchable = new ArrayMatchable
  arrayMatchable.match = function () {
    return {
      matched: true,
      unmatched: [ 'element!' ]
    }
  }

  assert( ! new ArrayPattern(arrayMatchable).match(['something']) )
})

example("ArrayPattern + [AM, AM]: remaining elements are send to the next", function () {
  var firstMatchable = new ArrayMatchable
  var secondMatchable = new ArrayMatchable
  var remaining = ['some', 'remaining']
  firstMatchable.match = function () {
    return {
      matched: true,
      unmatched: remaining } }
  secondMatchable.match = function () {
    this.match.called = arguments
    return {
      matched: true,
      unmatched: ['irrelevant'] } }

  new ArrayPattern(firstMatchable, secondMatchable).match(['irrelevant'])

  assert.equal( secondMatchable.match.called[0], remaining )
})

example("ArrayPattern + [AM, AM]: next is not called if first is false", function () {
  var firstMatchable = new ArrayMatchable
  var secondMatchable = new ArrayMatchable
  firstMatchable.match = function () {
    return {
      matched: false,
      unmatched: [] } }
  secondMatchable.match = function () { this.called = true }

  assert( ! new ArrayPattern(firstMatchable, secondMatchable).match(['']) )
  assert( ! secondMatchable.match.called )
})

example("ArrayPattern[non-AM, AM]: true when existing, sends the rest to the next AM", function () {
  var arrayMatchable = new ArrayMatchable
  var arrayMatcher = new ArrayPattern('exactly', arrayMatchable)
  arrayMatchable.match = function (argument) {
    this.match.argument = argument
    return {
      matched: true,
      unmatched: []
    }
  }

  arrayMatcher.match(['exactly', 'extra'])

  assert.equal( arrayMatchable.match.argument[0], 'extra' )
  assert.equal( arrayMatchable.match.argument.length, 1 )
})

example("ArrayPattern[non-AM, non-AM]: true when match", function () {
  assert( new ArrayPattern(5, 6).match([5, 6]) )
})

example("ArrayPattern[non-AM, non-AM]: false when not a match", function () {
  assert( ! new ArrayPattern(5, 6).match([5, 7]) )
})



// ArrayMatchable
// ==============
//
// A common parent for all descriptors of `Array` components. `ArrayMatchable`s
// have a slightly different interface than regular `Matchable`s because they
// need to send back the chunk of the Array that wasn't consumed by the current
// pattern so that the `ArrayPattern` can forward it to the next
// `ArrayMatchable`.
//
var ArrayMatchable = function () {}



// ArrayElement
// ============
//
// Encapsulated any Matchable. Forwards the content of the first element
// of the argument `Array` to the `Matchable`'s `match` and returns:
//
// - `"matched"`: the result of `match`
// - `"unmatched"`: the rest of the `Array`
//
// Usage:
//
// ```javascript
// var arrayElement = new ArrayElement(new TypedValue('string'));
//
// var result = arrayElement.match(['text', 'extra']);
// result.matched; // => true
// result.unmatched; // => ['extra']
// ```
//
var ArrayElement = function (matchable) {
  this.matchable = matchable
}

ArrayElement.prototype = new ArrayMatchable

ArrayElement.prototype.match = function (array) {
  return {
    matched: this.matchable.match(array[0]),
    unmatched: array.slice(1)
  }
}

example("ArrayElement is ArrayMatchable", function () {
  assert( new ArrayElement instanceof ArrayMatchable )
})

example("ArrayElement: encapsulates any Matchable", function () {
  var matchable = new Matchable
  var arrayElement = new ArrayElement(matchable)
  var result = undefined
  matchable.match = function (argument) {
    this.match.argument = argument
    return 'matched'
  }

  result = arrayElement.match(['something', 'extra'])

  assert.equal( result.matched, 'matched' )
  assert.equal( matchable.match.argument, 'something' )
  assert.equal( result.unmatched[0], 'extra' )
})



// ArrayWildcard
// =============
//
// Returns `true` unless there is nothing in the `Array`. Removes the first
// element from the `Array`.
//
// Usage:
//
// ```javascript
// var arrayWildcard = new ArrayWildcard();
//
// var result = arrayWildcard.match(['anything', 'extra']);
// result.matched; // => true
// result.unmatched; // => ['extra']
// ```
//
var ArrayWildcard = function () {}

ArrayWildcard.prototype = new ArrayMatchable

ArrayWildcard.prototype.match = function (array) {
  return {
    matched: array.length > 0,
    unmatched: array.slice(1)
  }
}

example("ArrayWildcard is a ArrayMatchable", function () {
  assert( new ArrayWildcard instanceof ArrayMatchable )
})

example("ArrayWildcard: false if empty", function () {
  assert( ! new ArrayWildcard().match([]).matched )
})

example("ArrayWildcard: true if non empty", function () {
  assert( new ArrayWildcard().match(['something']).matched )
})

example("ArrayWildcard: unmatched has the rest of the array", function () {
  var result = new ArrayWildcard().match(['more', 'than', 'one'])
  assert.equal( result.unmatched.length, 2 )
  assert.equal( result.unmatched[0], 'than' )
  assert.equal( result.unmatched[1], 'one' )
})



// ArrayEllipsis
// =============
//
// The `ArrayEllipsis` represents a variable length pattern, and it's behavior
// depends on how it is configured.
//
// 1. Passing no arguments to the `ArrayEllipsis` will create a _catch all_
//    pattern that will match anything, even no elements at all.
// 2. Passing any `Matchable` to the `ArrayEllipsis` will cause it to
//    sequentially probe each element for a match with the `Matchable`. That
//    `Matchable` is called the _termination_ of the ellipsis pattern. If a
//    match happens, the `ArrayEllipsis` will stop, return `true` in `matched`
//    and the remainings of the `Array` in `unmatched`.
//
// Usage:
//
// ```javascript
// var arrayEllipsis = new ArrayEllipsis();
//
// var result = arrayEllipsis.match(['element', 2, {}]);
// result.matched; // => true
// result.unmatched; // => []
// ```
//
// With termination:
//
// ```javascript
// var arrayEllipsis = new ArrayEllipsis(new TypedValue('string'));
//
// var result = arrayEllipsis.match([2, 4, 'text', 'extra']);
// result.matched; // => true
// result.unmatched; // => ['extra']
// ```
//
var ArrayEllipsis = function (termination) {
  this.termination = termination
}

ArrayEllipsis.prototype = new ArrayMatchable

ArrayEllipsis.prototype.match = function (array) {
  if ( ! this.termination)
    return {
      matched: true,
      unmached: [] }

  for (var index = 0; index < array.length; index ++) {
    if (this.termination instanceof Matchable) {
      if (this.termination.match(array[index]))
        return {
          matched: true,
          unmatched: array.slice(index + 1) }
    }

    else {
      if (this.termination === array[index])
        return {
          matched: true,
          unmatched: array.slice(index + 1)}
    }
  }

  return {
    matched: false,
    unmatched: []
  }
}

example("ArrayEllipsis is a ArrayMatchable", function () {
  assert( new ArrayEllipsis instanceof ArrayMatchable )
})

example("ArrayEllipsis[]: true if empty", function () {
  assert( new ArrayEllipsis().match([]).matched )
})

example("ArrayEllipsis[]: true with some elements", function () {
  assert( new ArrayEllipsis().match([2 , 4]).matched )
})

example("ArrayEllipsis[TypedValue]: true when there is an element of that type", function () {
  assert( new ArrayEllipsis(new TypedValue('string')).match(['a']).matched )
})

example("ArrayEllipsis[TypedValue]: false when there is no element of that type", function () {
  assert( ! new ArrayEllipsis(new TypedValue('string')).match([2]).matched )
})

example("ArrayEllipsis[non-matchable]: true when an element === the non matchable", function () {
  assert( new ArrayEllipsis(5).match([6, 5, 7]) )
})

example("ArrayEllipsis[non-matchable]: false when not found", function () {
  assert( ! new ArrayEllipsis(7).match([1, 2, 3]).matched )
})

example("ArrayEllipsis[non-matchable]: returns the remaining elements, non-greedy", function () {
  var result = new ArrayEllipsis(6).match([2, 6, 3, 6])

  assert.equal( result.unmatched.length, 2 )
  assert.equal( result.unmatched[0], 3 )
  assert.equal( result.unmatched[1], 6 )
})

module.exports = {
  Matchable: Matchable,
  WildcardProperty: WildcardProperty,
  ExactProperty: ExactProperty,
  Negator: Negator,
  ObjectPattern: ObjectPattern,
  WildcardValue: WildcardValue,
  TypedValue: TypedValue,
  ArrayPattern: ArrayPattern,
  ArrayElement: ArrayElement,
  ArrayWildcard: ArrayWildcard,
  ArrayEllipsis: ArrayEllipsis
}
