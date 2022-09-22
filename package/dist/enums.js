
const schemaArgs = require('../lib/schemaArgs');

const Enums = {}

// const Enum = function(name, value, info) {
//   [name, value, info] = schemaArgs([
//     { rule: ['string'], required: true },
//     { rule: ['number'] },
//     { rule: ['string'] }
//   ], name, value, info);

// }

// new Enum('Weak', 0, 'does weak stuff');
// new Enum({ ... });

Enums.ConnectionPriority = {
  Weak: 0,
  Strong: 1,
  Factory: 2
}

// todo: make each enum item an object: { name: '...', value: ... }
Enums.StateType = {
  Listening: 'Listening',
  Paused: 'Paused',
  Disabled: 'Disabled',
  DisabledAll: 'DisabledAll',
}

Enums.InstanceType = {
  EventConnection: 'EventConnection',
  EventInstance: 'EventInstance'
}

Enums.DispatchStatus = {
  Disabled: 'Disabled',
  UnknownRejectionError: 'UnknownRejectionError',
  DisabledByAncestor: 'DisabledByAncestor',
  Ghost: 'Ghost',
  NoConnection: 'NoConnection',
  PriorityPaused: 'PriorityPaused',
  DispatchLimitReached: 'DispatchLimitReached',
  AllListening: 'AllListening',
  PriorityListening: 'PriorityListening'
}

Enums.DispatchOrder = {
  Catalyst: 0,
  LinkedEvents: 1,
  DescendantEvents: 2,
  AscendantEvents: 3
}

Enums.Report = {
  Style: {
    Reset: "\x1b[0m",
    Bright: "\x1b[1m",
    Dim: "\x1b[2m",
    Underscore: "\x1b[4m",
    Blink: "\x1b[5m",
    Reverse: "\x1b[7m",
    Hidden: "\x1b[8m",
    
    Primary: {
        Black: "\x1b[30m",
        Red: "\x1b[31m",
        Green: "\x1b[32m",
        Yellow: "\x1b[33m",
        Blue: "\x1b[34m",
        Magenta: "\x1b[35m",
        Cyan: "\x1b[36m",
        White: "\x1b[37m",
        Crimson: "\x1b[38m"
    },

    Secondary: {
        Black: "\x1b[40m",
        Red: "\x1b[41m",
        Green: "\x1b[42m",
        Yellow: "\x1b[43m",
        Blue: "\x1b[44m",
        Magenta: "\x1b[45m",
        Cyan: "\x1b[46m",
        White: "\x1b[47m",
        Crimson: "\x1b[48m"
    }
  },

  Errors: {
    InvalidType: 'Invalid type: \'$(0)\' (expected \'$(1)\')'
  }
}


module.exports = Enums;
