var Matchables = require("../src/matchables")
var util = require('util');

var op = new Matchables.ObjectPattern(
  new Matchables.WildcardProperty(
    new Matchables.Negator(
      new Matchables.TypedValue( Error )
    )
  ),

  new Matchables.ExactProperty(
    "exact",
    new Matchables.ArrayPattern(
      new Matchables.ArrayElement(
        new Matchables.WildcardValue
      ),

      new Matchables.ArrayWildcard(),

      new Matchables.ArrayEllipsis( "termination" )
    )
  )
)

var object = {
  anyProperty: "notAnError",
  exact: [
    "anything",
    "will",
    "do",
    "termination"
  ]
}

console.log(util.inspect(op, { showHidden: true, depth: null }));

console.log(op.match(object))
