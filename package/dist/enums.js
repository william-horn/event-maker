
const EventEnums = {}

EventEnums.ConnectionPriority = {
  Weak: 0,
  Strong: 1,
  Factory: 2
}

// todo: make each enum item an object: { name: '...', value: ... }
EventEnums.StateType = {
  Listening: 'Listening',
  Paused: 'Paused',
  Disabled: 'Disabled',
  DisabledAll: 'DisabledAll',
}

EventEnums.InstanceType = {
  EventConnection: 'EventConnection',
  EventInstance: 'EventInstance'
}

EventEnums.DispatchStatus = {
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

EventEnums.DispatchOrder = {
  Catalyst: 0,
  BoundEvents: 1,
  DescendantEvents: 2,
  AscendantEvents: 3
}

module.exports = EventEnums;
