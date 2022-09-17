

const { Event, EventEnums, dispatchEvent } = require('pseudo-events');
const Errors = require('pseudo-events/dist/error');

const event = new Event();
console.log(Errors);

const child = new Event(event);

console.log(child);


