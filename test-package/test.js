

const { Event, EventEnums, dispatchEvent } = require('pseudo-events');
const Errors = require('pseudo-events/dist/error');

const event = new Event();
const child = new Event(event, { requireConnection: false });

// child.connect({ handler: () => console.log('child fired') });

child.validateNextDispatch({
  customValidation: { requireConnection: true },
  ready: [msg => console.log('ready: ', msg)],
  rejected: [msg => console.log('rejected: ', msg)]
});

console.log(child.settings.requireConnection);
