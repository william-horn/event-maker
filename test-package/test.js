

const { Event, EventEnums, dispatchEvent } = require('pseudo-events');
const Errors = require('pseudo-events/dist/error');


const clockTickUpdate = new Event();


setInterval(
  () => clockTickUpdate.fire(), 
  1000
);

