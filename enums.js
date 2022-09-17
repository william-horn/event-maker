
const EventEnums = {}

EventEnums.ConnectionPriority = {
  Weak: 0,
  Strong: 1,
  Factory: 2
}

EventEnums.StateType = {
  Listening: 'Listening',
  Paused: 'Paused',
  Disabled: 'Disabled'
}

EventEnums.InstanceType = {
  EventConnection: 'EventConnection',
  EventInstance: 'EventInstance'
}

EventEnums.DispatchStatus = {
  Disabled: 'Disabled',
  Ghost: 'Ghost',
  NoConnection: 'NoConnection',
  PriorityPaused: 'PriorityPaused',
  DispatchLimitReached: 'DispatchLimitReached',
  AllListening: 'AllListening',
  PriorityListening: 'PriorityListening'
}

EventEnums.DispatchOrder = {
  Catalyst: 0,
  LinkedEvents: 1,
  DescendantEvents: 2,
  AscendantEvents: 3
}

module.exports = EventEnums;
