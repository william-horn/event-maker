
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

  const conn = {
    _customType: EventEnums.InstanceType.EventConnection,
    priority: options.priority,
    _active: true,
    name: options.name,
    handler: options.handler,

    pause,
    resume,
  }

  conn.connectionInstance = conn;

  return conn;
}


module.exports = Connection;
