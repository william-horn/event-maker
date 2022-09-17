

const { Event, EventEnums, dispatchEvent } = require('pseudo-events');
const Errors = require('pseudo-events/dist/error');

const event = new Event();
const child = new Event(event);

child.connect({ handler: () => console.log('child fired') });

event.disableAll();
child.disable();

child.fire();


