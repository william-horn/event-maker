

const { Event, Enums, dispatchEvent } = require('pseudo-events');
const schemaArgs = require('pseudo-events/lib/schemaArgs');
// const Report = require('pseudo-events/dist/report');

const par = new Event();
const e = new Event(par, { ghost: true, dispatchAscendants: true  });

par.connect({ handler: () => console.log('asdasdasd') });
e.fire();

e.pause(); // pauses event at priority 0 (_pausePriority = 0)

e.pause(0);
e.pause();
e.pause({ priority: 0, where: { name: 'lol' }});

e.connect({ name: 'lol', handler: f });
e.connect({ name: 'lol', handler: f });

e.disconnect({ where: { name: 'lol', handler: f }}); // prio 0

e.disconnect({ priority: n, where: { name: 'lol', handler: f }});



e.pause(); // pause all event connections at prio 0
e.disconnect(); // disconnect all event connections at prio 0

const globalEnums = new EventEnums({

});

const localEnums = new event.Enums({
  Char: 0,
  Movement: 1,
  Render: 2
});


e.pauseAll(); // pause all at 0
e.pauseAll(priority); // pause all at n
e.pauseAll(priority, { where: { name: 'lol', handler: f }}); // pause all with filter at n
e.pauseAll({ where: { name: 'lol', handler: f }}) // pause all with filter at 0


e.pauseAll(); // pause all at prio 0
e.disconnectAll(); // disconnect all at prio 0


