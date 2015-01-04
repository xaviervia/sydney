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
// `false` otherwise.
//
// Usage:
//
// ```javascript
// var wildcardProperty = new WildcardProperty("public")
// wildcardProperty.match({"project": "public"}) // => true
// ```
var WildcardProperty = function (value) {
  this.value = value
}

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

//
//
// Property:
//   name: Wildcard|Ellipsis|value
//   value: Wildcard|Ellipsis|value
