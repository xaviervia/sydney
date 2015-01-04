var example = require("washington");
var assert  = require("assert");

// Two structures: Wildcard, Ellipsis, with optional names. The other is just string
// literal.
//
// All other OPN structures can be added later as extensions.


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
  for (key in object) if (object[key] === this.value) return true

  return false
}

example("WildcardProperty + string value #match: correct value, true", function () {
  assert(
    new WildcardProperty("value")
      .match({"something": "value"}) )
})

example("WildcardProperty + string value #match: incorrect value, false", function () {
  assert(
    !(new WildcardProperty("value"))
      .match({"something": "not-value"}) )
})

example("WildcardProperty + number value #match: correct value, true", function () {
  assert(
    new WildcardProperty(4)
      .match({"otherThing": 4}) )
})

//
//
// Property:
//   name: Wildcard|Ellipsis|value
//   value: Wildcard|Ellipsis|value
