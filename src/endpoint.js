var example = require("washington");
var assert  = require("assert");

// Two structures: Wildcard, Ellipsis, with optional names. The other is just string
// literal.
//
// All other OPN structures can be added later as extensions.

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

//
//
// Property:
//   name: Wildcard|Ellipsis|value
//   value: Wildcard|Ellipsis|value
