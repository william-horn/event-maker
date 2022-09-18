

const { Event, EventEnums, dispatchEvent } = require('pseudo-events');
const Errors = require('pseudo-events/dist/error');

const clockUpdate = new Event();
const clockSecondsUpdate = new Event();
const clockMinutesUpdate = new Event();
const clockHoursUpdate = new Event();

const logger = msg => (_, time) => console.log(msg + time);

clockSecondsUpdate.connect({
  handler: logger('We are on second: ')
});

clockMinutesUpdate.connect({
  handler: logger('We are on minute: ')
});

clockHoursUpdate.connect({
  handler: logger(' We are on hour: ')
});

const clockUpdateHandler = () => {
  const now = Date.now();
  const realSeconds = Math.floor(now / 1000);
  const realMinutes = Math.floor(realSeconds / 60);
  const realHours = Math.floor(realMinutes / 60);

  const seconds = realSeconds % 60;
  const minutes = realMinutes % 60;
  const hours = realHours % 60;
  
  if (now % 1000 > 900) {
    clockSecondsUpdate.fire(seconds);
    clockSecondsUpdate.disable();
  } else {
    clockSecondsUpdate.enable();
  }
  
  if (seconds % 60 === 0) clockMinutesUpdate.fire(minutes);
  if (minutes % 60 === 0) clockHoursUpdate.fire(hours);

  // console.log(now % 1000);
}

clockUpdate.connect({
  name: 'onClockUpdate',
  handler: clockUpdateHandler
});

setInterval(() => clockUpdate.fire());


