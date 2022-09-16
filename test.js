
const {modelArgs, modelArgs_beta, objectValuesAreUndefined} = require('./lib');
const inspect = require('util').inspect;
const { Event, EventEnums, dispatchEvent } = require('./event-maker');

const parent = Event();
const event2 = Event(parent);
const event = Event(event2);

parent.connect(() => console.log('parent fired'));
event2.connect(() => console.log('fired event 2'));
event.connect(() => console.log('fired event 1'));

// event.fire();

/*
  dispatchEvent({
    event: EventInstance,
    args: [...],
    headers: {
      dispatchOrder: [ ... ],
      enableSelf: boolean,
      linkedEvents: [],
      enableAscending: boolean,
      enableDescending: boolean
      enabledLinked: boolean
    }
*/

dispatchEvent({
  event: parent,
  headers: {
    // enableAscending: true,
    enableDescending: true,
    dispatchOrder: [
      EventEnums.DispatchOrder.DescendantEvents,
      EventEnums.DispatchOrder.LinkedEvents, 
      EventEnums.DispatchOrder.Catalyst, 
      EventEnums.DispatchOrder.AscendantEvents, 
    ],
  }
});

