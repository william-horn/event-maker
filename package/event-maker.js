/*
@author:  William J. Horn
@file:    event-maker.js
@date:    09/05/2022
==================================================================================================================================

@info
=========
| ABOUT |
==================================================================================================================================

EventMaker was built from scratch by William J. Horn with yet another desperate attempt to re-invent the wheel 
just "because". On a real note though, this is a pretty neat and efficient implementation of custom event handling. 

Some features include:

  * Event bubbling
  * Event toggling
  * Dispatch validation
  * Creating event sequences (coming soon)
  * Creating event priorities
  * Built-in cooldown/interval handling in options
  * more coming soon

Documentation can be found here: https://github.com/william-horn/adventures-of-swindonia/blob/develop/public/lib/documentation/event-maker.md

@changelog
  [09-13/2022]
    - Removed event states "Listening" and "Paused" and replaced them with _pausePriority. 
      If _pausePriority === -1 then the state is assumed to be "Listening", otherwise if
      _pausePriority > -1 then the state is assumed to be "Paused".

    - connectWithPriority now defaults it's priority number to 1 if no priority is given.

==================================================================================================================================

@todo
========
| TODO |
==================================================================================================================================

todo: add event yielding (promise-based awaiting for event dispatches)
  * DONE - 09/14/2022
todo: create constructor for event sequences (events for sequential event dispatches, like key combinations)
todo: implement pause/resume mechanic for events
todo: implement event connection strength/priorities
  * DONE - 09/13/2022
todo: add error handling and centralize error messages
todo: flesh-out connection instance class by giving it more fields/methods
  * DONE - 09/17/2022

==================================================================================================================================
*/

/*
  Helper functions
*/
const {
  modelArgs,
  objectMeetsCriteria,
} = require('./lib');

const { v4: uuidv4 } = require('uuid');
const Connection = require('./connection-instance');
const EventEnums = require('./enums');

const isConnection = connection => {
  return typeof connection === 'object' 
    && connection._customType === EventEnums.InstanceType.EventConnection;
}

const isEvent = event => {
  return typeof event === 'object'
    && event._customType === EventEnums.InstanceType.EventInstance;
}

const recurseChildEvents = (event, callback) => {
  const recurse = event => {
    callback(event);

    const childEvents = event._childEvents;
    for (let i = 0; i < childEvents.length; i++) {
      recurse(childEvents[i]);
    }
  }

  recurse(event);
}

const collapseWaitingPromises = options => {
  const {
    resolve: doResolve,
    args = [],
    resolvers,
  } = options;

  // fire all waiting resolvers
  for (let i = resolvers.length - 1; i >= 0; i--) {
    const [resolve, reject, timeoutId] = resolvers[i];
    if (timeoutId) clearInterval(timeoutId);

    (doResolve ? resolve : reject)(args);
    resolvers.splice(i, 1);
  }
}

const searchEventConnections = (event, options, caseHandler) => {
  const { _connectionPriorities, _connectionPriorityOrder: _cpo } = event;

  const noOptions = !options;
  options = options || {};

  const {
    priority = 0,
    connection,
    name,
    handler
  } = options

  if (caseHandler.hasSearchParams) {
    caseHandler.hasSearchParams(!!(name || handler) === true);
  }

  const priorityIndex = _connectionPriorities[priority]?.orderIndex;

  // priority doesn't exist
  if (!priorityIndex && priorityIndex !== 0) {
    console.log(`Connection priority '${priority}' does not exist`);
    return;
  }

  // a connection instance was provided
  if (isConnection(connection)) {
    const connectionList = _connectionPriorities[connection.priority].connections;
    if (caseHandler.hasConnection) {
      caseHandler.hasConnection(
        connection,
        connectionList,
        connectionList.findIndex(conn => conn === connection)
      );
    }
    return;
  }

  // apply filter search
  const searchFilter = {
    name: { value: name },
    handler: { value: handler },
  };

  for (let i = 0; i <= priorityIndex; i++) {
    const connectionRow = _connectionPriorities[_cpo[i]];
    const connectionList = connectionRow.connections;

    for (let j = connectionList.length - 1; j >= 0; j--) {
      const _connection = connectionList[j];

      if (caseHandler.iterate) {
        caseHandler.iterate(_connection, connectionList, j);
      } else if (caseHandler.search) {
        if (noOptions || objectMeetsCriteria(_connection, searchFilter)) {
          if (caseHandler.search(_connection, connectionList, j)) break;
        }
      }

    }

    if (caseHandler.afterSearch) {
      caseHandler.afterSearch(connectionList, _connectionPriorities, _cpo, i);
    }
  }
}

/*
  dispatchEvent(payload, ...args)

  The internal function call for dispatching events

  @param payload<object>
    The data describing the dispatched event. The payload
    object is structured as such:

    payload {
      caller<EventInstance> { ... },
      event<EventInstance> { ... },
      extensions?<object> {
        bubbling?<boolean>,
        continuePropagation?<boolean>
      }
    }

  @param ...args<any>
    The rest of the arguments passed by the user
      
  @returns <void>
*/


const onDispatchReady = (dispatchStatus, payload, globalContext) => {
  const DispatchStatus = EventEnums.DispatchStatus;

  const {
    eventBlacklist,
    headers: globalHeaders
  } = globalContext;

  const {
    event,
    args = [],
    headers: _headers = {},
  } = payload;

  const {
    _connectionPriorities,
    _connectionPriorityOrder: _cpo,
    _pausePriority,
    _resolvers,
    _parentEvent,
    _childEvents,
    settings: eventSettings,
    stats
  } = event;

  // list of temporary settings for event
  const headers = {
    ...eventSettings,
    ..._headers
  }

  const {
    linkedEvents,
    dispatchOrder
  } = headers;

  stats.dispatchCount++;
  event._propagating = true;

  // SELF DISPATCH TYPE
  const runEventHandlers = () => {
    if (headers.enableSelf) {
      for (let i = _cpo.length - 1; i > _pausePriority; i--) {
        const connectionRow = _connectionPriorities[_cpo[i]];
        const connectionList = connectionRow.connections;

        for (let j = 0; j < connectionList.length; j++) {
          const connection = connectionList[j];
          if (connection._active) {
            connection.handler(globalContext.catalyst, ...args);
          }
        }
      }
    }

    collapseWaitingPromises({
      resolve: true,
      resolvers: _resolvers,
      args
    });
  }

  // LINKED DISPATCH TYPE
  const runLinkedEventHandlers = () => {
    if (linkedEvents.length > 0 && headers.enableLinked) {
      for (let i = 0; i < linkedEvents.length; i++) {
        const linkedEvent = linkedEvents[i];

        if (eventBlacklist[linkedEvent._id]) {
          throw 'Detected cyclic linked events';
        }

        eventBlacklist[linkedEvent._id] = true;

        globalContext._dispatchEvent({
          event: linkedEvent,
          args
        });

        delete eventBlacklist[linkedEvent._id]
      }
    }
  }

  // DESCENDANT DISPATCH TYPE
  const runDescendantEventHandlers = () => {
    if (globalHeaders.enableDescending) {
      for (let i = 0; i < _childEvents.length; i++) {
        const childEvent = _childEvents[i];

        globalContext._dispatchEvent({
          event: childEvent,
          args
        });
      }
    }
  }

  // ASCENDANT DISPATCH TYPE
  const runAscendantEventHandlers = () => {
    if (globalHeaders.enableAscending && _parentEvent && event._propagating) {
      globalContext._dispatchEvent({
        event: _parentEvent,
        args
      });
    }
  }

  const dispatchSequence = [
    runEventHandlers, 
    runLinkedEventHandlers, 
    runDescendantEventHandlers, 
    runAscendantEventHandlers
  ]

  for (let i = 0; i < dispatchOrder.length; i++) {
    dispatchSequence[dispatchOrder[i]]();
  }
}

const onDispatchRejected = dispatchStatus => {
  console.log('dispatch failed: ', dispatchStatus);
}

const dispatchEvent = function(payload) {
  const globalContext = {
    eventBlacklist: { [payload.event._id]: true },
    catalyst: payload.event,
    headers: {
      ...payload.event.settings, 
      ...(payload.headers || {})
    },

    _dispatchEvent: function(_payload) {
      _payload.event.validateNextDispatch({
        ready: [onDispatchReady, [_payload, this]],
        rejected: [onDispatchRejected]
      });
    }
  }

  if (globalContext.headers.enableAscending && globalContext.headers.enableDescending) {
    throw 'Cannot use two mutually exclusive headers (enableAscending and enableDescending)';
  }

  globalContext._dispatchEvent(payload);
}


/*
  Method functions
*/

/*
  event.connect(name, func)

  Connects a handler function to an event

  @param name?<string>
    Name of the event connection

  @param handler<function>
    handler function that runs when the event is fired

  @returns connectionInstance<object>
*/
const connect = function(options = {}) {
  const { _connectionPriorities, _connectionPriorityOrder: _cpo } = this;

  const { 
    priority = 0,
    handler,
    name
  } = options;

  /*
    connectionRow = {orderIndex: number, connections: ConnectionInstance[]}
  */
  let connectionRow = _connectionPriorities[priority];
  let connectionList;
  const connection = new Connection(options);

  // self reference for filtering
  connection.connectionInstance = connection;

  // creating a new connection priority list if one doesn't exist
  if (!connectionRow) {
    connectionList = [];
    connectionRow = {
      orderIndex: _cpo.length, 
      connections: connectionList
    };

    _connectionPriorities[priority] = connectionRow;
    _cpo.push(priority);

    // sort connection priority indices
    if (_cpo.length > 1) {
      for (let now = _cpo.length - 1; now > 0; now--) {
        const last = now - 1;

        if (_cpo[now] < _cpo[last]) {
          const lastRow = _connectionPriorities[_cpo[last]];

          // swap order index then swap places
          [connectionRow.orderIndex, lastRow.orderIndex] = [lastRow.orderIndex, connectionRow.orderIndex];
          [_cpo[last], _cpo[now]] = [_cpo[now], _cpo[last]];

        } else {
          break;
        }
      }
    }
  } else {
    connectionList = connectionRow.connections;
  }

  connectionList.push(connection);
  return connection;
}


/*
  event.stopPropagation()

  Stops the caller event from propagating through 
  event bubbling

  @params <void>
  @returns <void>
*/
const stopPropagating = function() {
  this._propagating = false;
}

/*
  event.fire(...args)

  The interface method for dispatching event connections

  @params ...args<any>
    The arguments passed down to the handler function callbacks

  @returns <void>
*/
const fire = function(...args) {
  dispatchEvent({
    event: this,
    args: [...args]
  });
}

/*
  event.fireAll(...args)

  @params ...args<any>
    The arguments passed down to the handler function callbacks

  @returns <void>
*/
const fireAll = function(...args) {
  dispatchEvent({
    event: this,
    args: [...args],
    headers: {
      enableDescending: true,
    }
  });
}

/*
  event.disconnect(connectionName?<string, connectionInstance>, handlerFunction?<function>)

  @param connectionName<string>
    The name of the connection instance to be disconnected

  @param connectionName<connectionInstance>
    The literal connection instance returned from event.connect() to be
    disconnected

  @param handlerFunction<function>
    The literal handler function used in the event connections to be
    disconnected

  @note In the future these arguments will probably be replaced with
  an options object for more filtering options

  @returns <void>
*/

/*
  disconnect()
  disconnect({
    priority: number,
    name: 'thing',
    handler: f,
    connection: conn
  })
*/



const disconnect = function(options) {
  searchEventConnections(this, options, {
    hasConnection: (_, connectionList, index) => connectionList.splice(index, 1),
    search: (_, connectionList, index) => connectionList.splice(index, 1),
    afterSearch: (connectionList, _connectionPriorities, _cpo, index) => {
      if (connectionList.length === 0) {
        delete _connectionPriorities[_cpo[index]];
        _cpo.splice(index, 1);
      }
    }
  });
}

/*
  event.disconnectAll(...args)

  The interface method for disconnecting event connections
  and descendant event connections based on filter arguments

  @params (same as event.disconnect)

  @returns <void>
*/
const disconnectAll = function(options) {
  recurseChildEvents(this, event => event.disconnect(options));
}

const wait = function(timeout) {
  return new Promise((resolve, reject) => {
    const resolver = [resolve, reject];

    if (timeout !== undefined) {
      resolver[2] = setTimeout(
        () => reject('Event timed out'), 
        timeout*1000
      );
    }

    this._resolvers.push(resolver);
  });
}

const getHighestPriority = function() {
  const { _connectionPriorityOrder: _cpo } = this;
  return _cpo[_cpo.length - 1];
} 

const pause = function(options = { priority: 0 }) {
  this._pausePriority = Math.max(-1, Math.min(options.priority, this.getHighestPriority()));

  searchEventConnections(this, options, {
    search: connection => {
      // connection.pause();
    }
  });
}

const pauseAll = function(options) {
  recurseChildEvents(this, event => event.pause(options));
}


const resume = function() {

}

const resumeAll = function() {

}

const isDisabledAll = function() {
  return this._state === EventEnums.StateType.DisabledAll;
}

const isDisabledOne = function() {
  return this._state === EventEnums.StateType.Disabled;
}

const isEnabled = function() {
  return !this._state === EventEnums.StateType.Disabled 
    && !this._state === EventEnums.StateType.DisabledAll;
}

const isDisabled = function() {
  return this._state === EventEnums.StateType.Disabled 
    || this._state === EventEnums.StateType.DisabledAll;
}

const getState = function() {
  return this._state;
}

const disable = function() {
  if (this.isDisabled()) {
    console.log(`Cannot disable event in state: '${this.getState()}' (event must be enabled first)`);
    return;
  }

  this._prevState = this._state;
  this._state = EventEnums.StateType.Disabled;
}

const disableAll = function() {
  if (this.isDisabled()) {
    console.log(`Cannot disable event in state: '${this.getState()}' (event must be enabled first)`);
    return;
  }

  this._prevState = this._state;
  this._state = EventEnums.StateType.DisabledAll;

  recurseChildEvents(this, event => event._disables++);
}

const enable = function() {
  if (!this.isDisabledOne()) {
    console.log(`Cannot do 'enable' in state: '${this.getState()}'`);
    return;
  }

  this._state = EventEnums.StateType._prevState;
}

const enableAll = function() {
  if (!this.isDisabledAll()) {
    console.log(`Cannot do 'enableAll' in state: '${this.getState()}'`);
    return;
  }

  this._state = EventEnums.StateType._prevState;

  recurseChildEvents(this, event => event._disables--);
}

const isListening = function() {
  return this._pausePriority === -1;
}

const disableListeners = function() {
  this.settings.enableSelf = false;
}

const enableListeners = function() {
  this.settings.enableSelf = true;
}


const validateNextDispatch = function(caseHandler = {}) {
  const { 
    _connectionPriorityOrder: _cpo, 
    _pausePriority,
    settings: { dispatchLimit, ghost },
    stats: { 
      timeLastDispatched,
      dispatchCount
    },
  } = this;

  const highestPriority = this.getHighestPriority();

  const sendStatus = (state, status) => {
    const _case = caseHandler[state];

    if (_case) {
      const [handler, args] = _case;
      handler(status, ...(args || []))
    }
  }

  /*
    Begin case-checking 
  */

  const DispatchStatus = EventEnums.DispatchStatus;

  // event has been disabled
  if (this.isDisabled()) {
    sendStatus('rejected', DispatchStatus.Disabled);
    return false;
  }

  if (this._disables > 0) {
    sendStatus('rejected', DispatchStatus.DisabledByAncestor);
    return false;
  }

  if (ghost) {
    sendStatus('ready', DispatchStatus.Ghost);
    return true;
  }

  // connections list is empty; no connections exist
  if (_cpo.length === 0) {
    sendStatus('rejected', DispatchStatus.NoConnection);
    return false;
  }

  // all connections are paused
  if (_pausePriority >= highestPriority) {
    sendStatus('rejected', DispatchStatus.PriorityPaused);
    return false;
  }

  // event exceeded dispatch limit set by user
  if (dispatchCount >= dispatchLimit) {
    sendStatus('rejected', DispatchStatus.DispatchLimitReached);
    return false;
  }

  // event is in listening state
  if (this.isListening()) {
    sendStatus('ready', DispatchStatus.AllListening);
    return true;
  }
  
  // event state is paused but higher connection priorities exist
  if (highestPriority > _pausePriority) {
    sendStatus('ready', DispatchStatus.PriorityListening);
    return true;
  }
}

/*
  event(parentEvent?<EventInstance>, settings?<object>)

  @param parentEvent<EventInstance>
    Another event instance that will act as the parent for the current event.

  @param settings<object>
    An object of additional settings that will configure the behavior of the 
    current event.

  @returns event<EventInstance>
*/
const Event = function(parentEvent, settings) {
  const DispatchOrder = EventEnums.DispatchOrder;

  [parentEvent, settings] = modelArgs([
    { rule: [parentEvent, EventEnums.InstanceType.EventInstance] },
    { rule: [settings, 'object'], default: {} }
  ]);

  this._id = uuidv4();
  this._customType = EventEnums.InstanceType.EventInstance;
  this._parentEvent = parentEvent;
  this._connectionPriorityOrder = [];
  this._connectionPriorities = {};
  this._childEvents = [];
  this._resolvers = [];
  this._propagating = false;
  this._disables = 0;

  this._pausePriority = -1;
  this._prevState = EventEnums.StateType.Listening;
  this._state = EventEnums.StateType.Listening; // Listening, Paused, Disabled, DisabledAll

  this.stats = {
    timeLastDispatched: 0,
    dispatchCount: 0,
    dispatchWhilePausedCount: 0,
  };

  this.settings = {
    /*
    cooldown: { 
      interval: 1, 
      duration: 0,
      reset: 0,
    },
    */
    dispatchLimit: Infinity,
    linkedEvents: [],

    dispatchOrder: [
      DispatchOrder.Catalyst,
      DispatchOrder.LinkedEvents,
      DispatchOrder.DescendantEvents,
      DispatchOrder.AscendantEvents
    ],

    enableDescending: false,
    enableLinked: true,
    enableAscending: false,
    enableSelf: true,

    // custom event settings
    ...settings
  };

  // add the new event instance to the parent event's child-event list
  if (parentEvent) parentEvent._childEvents.push(this);
}

// event methods
Event.prototype.connect = connect;
Event.prototype.fire = fire;
Event.prototype.fireAll = fireAll;
Event.prototype.disconnect = disconnect;
Event.prototype.disconnectAll = disconnectAll;
Event.prototype.pause = pause;
Event.prototype.pauseAll = pauseAll;
Event.prototype.resume = resume;
Event.prototype.resumeAll = resumeAll;
Event.prototype.validateNextDispatch = validateNextDispatch;
Event.prototype.wait = wait;
Event.prototype.isEnabled = isEnabled;
Event.prototype.isDisabled = isDisabled;
Event.prototype.isListening = isListening;
Event.prototype.disableListeners = disableListeners;
Event.prototype.enableListeners = enableListeners;
Event.prototype.disableAll = disableAll;
Event.prototype.enableAll = enableAll;
Event.prototype.isDisabledOne = isDisabledOne;
Event.prototype.isDisabledAll = isDisabledAll;
Event.prototype.getState = getState;
Event.prototype.stopPropagating = stopPropagating;
Event.prototype.enable = enable;
Event.prototype.disable = disable;
Event.prototype.getHighestPriority = getHighestPriority;

module.exports = {
  Event,
  EventEnums,
  isConnection,
  isEvent,
  dispatchEvent,
}

