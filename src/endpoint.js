var example = require("washington");
var assert  = require("assert");

// Two structures: Wildcard, Ellipsis, with optional names. The other is just string
// literal.
//
// All other OPN structures can be added later as extensions.

// Matchable
// =========
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
// forward the `match` to the matchable, if the propery exists.
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


// PropertySetMatcher
// ==================
//
// Returns the `&&` result of calling the `match` method in each `properties`,
// forwarding the argument.
//
// Usage:
// ```javascript
// var property = new PropertySetMatcher(
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
var PropertySetMatcher = function () {
  this.properties = []
  for (var i = 0, j = arguments.length; i < j; i ++)
    this.properties.push(arguments[i])
}

PropertySetMatcher.prototype = new Matchable

example("PropertySetMatcher is a Matchable", function () {
  assert(new PropertySetMatcher instanceof Matchable)
})

PropertySetMatcher.prototype.match = function (object) {
  for (var i = 0, j = this.properties.length; i < j; i ++)
    if (!this.properties[i].match(object)) return false

  return true
}

example("PropertySetMatcher: AND of three properties", function () {
  var property = new PropertySetMatcher(
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

example("PropertySetMatcher: AND of three properties (false)", function () {
  var property = new PropertySetMatcher(
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
var WildcardValue = function () {}

WildcardValue.prototype = new Matchable

WildcardValue.prototype.match = function (object) {
  return object !== undefined
}

example("WildcardValue is a Matchable", function () {
  assert(new WildcardValue instanceof Matchable)
})

example("WildcardValue: returns true if not undefined", function () {
  assert(
    new WildcardValue().match("anything") )
})

example("WildcardValue: returns false if undefined", function () {
  assert(
    ! new WildcardValue().match())
})

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
      break;
    case 'object':
      return (JSON.stringify(object) || '').substring(0, 1) === '{'
      break;
    case 'string':
      return JSON.stringify(object) === '"' + object + '"'
    default:
      return object instanceof this.type
  }
}

example("TypedValue: returns true if value is of type", function () {
  assert(new TypedValue(Matchable).match(new Matchable))
})

example("TypedValue: returns false if value is not of type", function () {
  assert( ! new TypedValue(TypedValue).match(new Matchable))
})

example("TypedValue + 'number': returns true if value is an integer", function () {
  assert(new TypedValue('number').match(3))
})

example("TypedValue + 'number': returns true if value is a float", function () {
  assert(new TypedValue('number').match(-2.4))
})

example("TypedValue + 'number': returns false if value is a string", function () {
  assert( ! new TypedValue('number').match('-1'))
})

example("TypedValue + 'string': returns true if value is a plain String", function () {
  assert(new TypedValue('string').match('some string'))
})

example("TypedValue + 'string': returns true if value is a String object", function () {
  assert(new TypedValue('string').match(new String('some string')))
})

example("TypedValue + 'string': returns false if value is a number", function () {
  assert( ! new TypedValue('string').match(3))
})

example("TypedValue + 'array': returns true if value is an Array", function () {
  assert(new TypedValue('array').match(new Array))
})

example("TypedValue + 'array': returns false if value is arguments object", function () {
  assert( ! new TypedValue('array').match(arguments))
})

example("TypedValue + 'array': returns false if value is a regular object", function () {
  assert( ! new TypedValue('array').match({}))
})

example("TypedValue + 'boolean': returns true if value is true", function () {
  assert(new TypedValue('boolean').match(true))
})

example("TypedValue + 'boolean': returns true if value is false", function () {
  assert(new TypedValue('boolean').match(false))
})

example("TypedValue + 'object': returns true if value is a regular object", function () {
  assert(new TypedValue('object').match({}))
})

example("TypedValue + 'object': returns false if value is a string", function () {
  assert( ! new TypedValue('object').match('string'))
})

example("TypedValue + 'object': returns false if value is a number", function () {
  assert( ! new TypedValue('object').match(-4))
})

example("TypedValue + 'object': returns false if value is a boolean", function () {
  assert( ! new TypedValue('object').match(true))
})

example("TypedValue + 'object': returns false if value is an array", function () {
  assert( ! new TypedValue('object').match([]))
})

example("TypedValue + 'object': returns false if value is a function", function () {
  assert( ! new TypedValue('object').match(new Function()))
})


//
//
// Property:
//   name: Wildcard|Ellipsis|value
//   value: Wildcard|Ellipsis|value
