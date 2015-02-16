var Sydney = function (endpoint, callback, context) {
  this.endpoint = endpoint
  this.callback = callback
  this.context  = context
}

Sydney.prototype.notify = function () {
  if (!this.match()) return

  if (process && process.nextTick)
    process.nextTick(function () {
      this.callback.call(this.context)
    }.bind(this))
  else if (setImmediate)
    setImmediate(function () {
      this.callback.call(this.context)
    }.bind(this))
  else
    setTimeout(function () {
      this.callback.call(this.context)
    }.bind(this))
}

Sydney.prototype.match = function (event) {
  return this.endpoint.match(event)
}

module.exports = Sydney
