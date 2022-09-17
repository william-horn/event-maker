
const EventEnums = require('./enums');

const pause = function() {
  this._active = false;
}

const resume = function() {
  this._active = true;
}

const isActive = function() {
  return this._active;
}

const Connection = function(options) {
  this._customType = EventEnums.InstanceType.EventConnection;
  this.priority = options.priority;
  this._active = true;
  this.name = options.name;
  this.handler = options.handler;
  this.connectionInstance = this;
}

Connection.prototype.pause = pause;
Connection.prototype.resume = resume;
Connection.prototype.isActive = isActive;

module.exports = Connection;
