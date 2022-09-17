
const {modelArgs, objectValuesAreUndefined, objectMeetsCriteria} = require('./lib');
const inspect = require('util').inspect;
const { Event, EventEnums, dispatchEvent } = require('./event-maker');

// const f = () => console.log('connection 1')

// const obj = {
//   name: 'lol',
//   handler: undefined
// }

// const meets = objectMeetsCriteria(obj, {
//   name: { value: 'lol' },
//   handler: { value: undefined, inputRequired: true }
// }, { includeUndefined: true });

// console.log(meets);


const parent = Event();
const event2 = Event(parent);
const event = Event(event2);

const f = () => console.log('connection 1')

const c = event.connect({
  name: 'lol1',
  handler: f
});

event.connect({
  name: 'lol2',
  handler: f
});

// event.connect({
//   name: 'lol1',
//   handler: f
// });

parent.connect({ priority: 20, name: 'josh1', handler: () => console.log('josh on parent') });
event2.connect({ name: 'jeff', handler: () => console.log('conn 2') });
parent.connect({ name: 'bob', handler: () => console.log('parent fires') });

event.connect({ priority: 1, name: 'will', handler: () => console.log('prio 1a') });
event.connect({ priority: 100, handler: () => console.log('really high') });
event.connect({ priority: 20, handler: () => console.log('123') });

const y = event.connect({ priority: 1, name: 'josh', handler: () => console.log('prio 1b') });

// parent.disconnect({ name: 'bob' });
// parent.disconnectAll();});;
parent.pauseAll({ priority: 20 });
parent.fire();
event.fire();
// console.log(event);

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

// dispatchEvent({
//   event: parent,
//   headers: {
//     // enableAscending: true,
//     enableDescending: true,
//     dispatchOrder: [
//       EventEnums.DispatchOrder.DescendantEvents,
//       EventEnums.DispatchOrder.LinkedEvents, 
//       EventEnums.DispatchOrder.Catalyst, 
//       EventEnums.DispatchOrder.AscendantEvents, 
//     ],
//   }
// });


