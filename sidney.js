var example   = require("washington")
var assert    = require("assert")

example("Async: by default")

example("Endpoint: match with glob style wildcards")

example("Repeater: Repeat events back and forth on repeater venue")

example("Repeater: Scope out prefix when sending to repeater")

example("Repeater: Add prefix when receiving from repeater")

example("Configuration: disable async per call")

example("Configuration: disable async per venue")

example("Configuration: set event clone to shallow per call")

example("Configuration: set event clone to disabled per call")

example("Configuration: set event clone to shallow per venue")

example("Configuration: set event clone to disabled per venue")

console.log("Notes: add Mediador as static dependency (Bower instead of NPM)")

console.log("Notes: develop Sidney on src/ dir, expose build on root")

console.log("Notes: use tasks for static building of sidney")
