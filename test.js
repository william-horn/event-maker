
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

// event.connect({
//   name: 'lol1',
//   handler: f
// });

event2.connect({ handler: () => console.log('conn 2') });
parent.connect({ name: 'bob', handler: () => console.log('parent fires') });

// parent.disconnect({ name: 'bob' });
parent.disableAll();
parent.enableAll();
parent.fire();
event2.disableAll();
event2.enableAll();
event.fire();


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


