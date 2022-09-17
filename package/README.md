
# About

The `pseudo-events` package was developed by [William J. Horn](https://github.com/william-horn) as a side project during the development of an online browser game called **Adventures of Swindonia**. It is intended to make interfacing with event-driven tasks much easier by allowing the developer to create their own custom events which they can manipulate in a wide variety of ways.

With `pseudo-events` you can link events together, create event chains, and create event hierarchies with an intuitive API. No matter how you structure an event system, you always have access to the same features:

* **Event priority control**
* **Event dispatch order**
* **Filtering out event connections**
* **Recursive event toggling**
* **Event sequences**
* etc



**Important:** *documentation will be outdated until this project leaves early stages of development.*

## Install

Simple installation with npm:
```
npm i pseudo-events
```

## Usage

Require main library package
```js
const PseudoEvents = require('pseudo-events');
```

Package can also be destructured for easy access of included utility functions:

```js
const {
  Event,
  isEvent,
  isConnection,
  dispatchEvent
} = require('pseudo-events');
```

More on that later.

### **Event Instantiation**

You can create a new event by using the `Event` constructor

```js
const event = new PseudoEvents.Event();
```

The `Event` constructor takes two arguments; both are optional. Arguments listed in order:
- **parentEvent** *&lt;Event Instance>*
  * Another `EventInstance` which will now contain the new instantiated event. Behavior affecting the parent event can ripple down to descendant events, and vice-versa.

* **settings** *&lt;Object>*
  - The settings object contains all additional config data about the event and how it will behave.


Here is a simple hierarchy of event instances using the `parentEvent` argument in the `Event` constructor:

```js
const { Event } = require('pseudo-events');

const grandparent = new Event();
const parent = new Event(grandparent);
const child = new Event(parent);
```
Internally, the hierarchy looks something like this:
##
    grandparent {
      ...
      childEvents {
        parent {
          ...
          childEvents {
            child {
              ...
              childEvents {}
            }
          }
        }
      }
    }
  
When an event is fired, only the connections made to that event will dispatch. The signal will not trickle down to descendant events unless it is dispatched using `fireAll` or `dispatchEvent` with headers.

### **Connecting Events**

You can create a new event connection by calling the `connect` method on the event instance. The connect method takes up to two options; one is optional:

*Optional arguments are denoted with the '?' symbol next to their name*

* **name**? *&lt;string>*
  - Only needed if you intend on disconnecting or filtering events by name later on. If no name is given, the event connection is considered anonymous.

- **handler** *&lt;function>*
  * The handler function that executes when the event is dispatched.

Below are some examples of creating event connections using a variation of arguments:

```js
const event = new Event();

const eventHandler = function() {
  console.log('event was fired!');
}

// anonymous connection
event.connect({ handler: eventHandler });

// named connection
event.connect({ name: 'someName', handler: eventHandler });
```

Events have no limit to how many connections they can have. All connections will be dispatched when the dispatcher methods are called.

### **Dispatching Events**

Events are dispatched by using the `fire` and `fireAll` methods, or by using the `dispatchEvent` function. Internally, both firing methods call the `dispatchEvent` function behind the scenes. This is because you can set dispatch headers using `dispatchEvent`, but for common use it's simpler to use the firing methods.

Both firing methods take the same arguments (variadic):

* `fire(...args)`
  - Dispatch all event connections established on that event. Does **NOT** trickle downward to descendant events.

- `fireAll(...args)`
  * Dispatch all event connections established on that event **INCLUDING** all connections established on all descendant events.


For now we will just focus on the `fire` method, since it's behavior carries over to `fireAll`. 

**Example**:

```js
// create event instance
const event = new Event();

// create event connection
event.connect({ handler: () => console.log('event fired!') });

// dispatch the event
event.fire();
```
##
    =>  event fired!

You may also pass any number of arguments to the dispatcher methods. This means you can include parameters in your event handler functions if you would like to receive some data from your dispatcher. 

**Example:**
```js
event.connect({
  handler: (a, b, c) => console.log('event fired with args: ', a, b, c) 
});

// dispatch the event with args
event.fire('hello', 'there', 'world!');
```
##
    =>  hello there world!

As mentioned before, you can create as many connections to an event instance as you like. They will all be fired once the dispatcher is called.

**Example:**

```js
event.connect({ handler: () => console.log('event connection #1') });
event.connect({ handler: () => console.log('event connection #2') });
event.connect({ handler: () => console.log('event connection #3') });

event.fire();
```
##
    =>  event connection #1
        event connection #2
        event connection #3

### **Disconnecting Events**

If you no longer need an event connection then you may disconnect it from the event instance by using `disconnect` or `disconnectAll`.
  
You can disconnect event connections by *name*, *handler function*, or by the *connection instance* returned from the `connect` method.


The `disconnect` method takes up to three options; all of them are optional.


* `name`? **&lt;string>**
  - The name of the connection to disconnect

- `handler`? **&lt;function>**
  * The handler function literal that was passed to a `connect` method

* `connection`? **&lt;Connection Object>**
  - The connection object returned from the `connect` method


If no options object is passed to `disconnect`, then **all** connections with `priority: 0` will be disconnected from the event instance.
```js
const event = new Event();

event.connect({ handler: () => console.log('connection #1 fired!') });
event.connect({ handler: () => console.log('connection #2 fired!') });

event.disconnect(); // disconnect all connections
event.fire();
```
##
    =>  <Empty>

Example using connection filters in `disconnect`:

```js
const someHandler = () => console.log('connection handler');

// set up connections
event.connect({
  handler: () => console.log('connection #1')
});

event.connect({
  handler: someHandler
});

event.connect({
  name: 'someName',
  handler: () => console.log('connection #3')
});

const connectionThree = event.connect({
  name: 'anotherName'
});

// start disconnecting by filter
event.disconnect({ name: 'someName' });
event.disconnect({ handler: someHandler });
event.disconnect({ connection: connectionThree });

// finally, disconnect the rest
event.disconnect();

event.fire();
```
##
    =>  <Empty>


The `disconnectAll` method will recursively call `disconnect` on all descendant events.

This method takes the same arguments as `disconnect`. If no arguments are passed to `disconnectAll`, then **all** connections with `priority: 0` will be disconnected from the event instance and all of it's descendant events.

**Example:**
```js
const parentEvent = new Event();
const childEvent = new Event(parentEvent);

parentEvent.connect({ handler: () => console.log('parent event #1') });
childEvent.connect({ handler: () => console.log('child event #1') });

parentEvent.disconnectAll();

parentEvent.fire();
childEvent.fire();
```
##
    =>  <Empty>

Since `disconnectAll` calls `disconnect` recursively, the same argument filtering will be applied to all descendant event instances if any arguments are provided.

**Example:**
```js
const parentEvent = new Event()
const childEvent = new Event(parentEvent);

parentEvent.connect({ handler: () => console.log('parent event #1') });
childEvent.connect({ handler: 'someName', () => console.log('child event #1') });
childEvent.connect({ handler: () => console.log('child event #2') });

parentEvent.disconnectAll({ name: 'someName' });

// we can use fireAll() instead of individually firing the events
parentEvent.fireAll();
```
##
    =>  parent event #1
        child event #2


*Since we created a hierarchy with `childEvent` and `parentEvent`, doing:*
```js
parentEvent.fireAll();
```
*is the same as:*
```js
parentEvent.fire();
childEvent.fire();
```

### **Waiting for Event Signals**

If you want to wait until an event is fired you can use the `wait` method. This function is promise-based, so you can use standard *async/await/thenable* syntax. This method takes one argument; it is optional:

* **timeout** *&lt;number>*
  - The amount of seconds until the wait promise times out and is rejected. If no timeout is provided then the wait will happen indefinitely until the event fires.

**returns:** The arguments passed down from the dispatcher as an array. 

**Example with `async`:**

```js
const event = new Event();

(async () => {
  try {
    const result = await event.wait();
    console.log('got back: ', result);
  } catch(err) {
    console.log('event timed out');
  }
})();

setTimeout(
  () => event.fire(1, 'a', false), 
  2000
);
```
*(after 2 seconds)*
##
    =>  got back: [1, 'a', false]

### **Disabling/Toggling Events**

Events can be enabled/disabled temporarily without needing to disconnect them. To do so, you can use the `disable` and `disableAll` methods.

Behind the scenes, the `disableAll` method just recursively calls `disable` on all descendant events. These methods take no arguments.

**Example:**

```js
const event = new Event();

event.connect({ handler: () => console.log('handler ran!') });

event.disable();
event.fire() //=> nothing
```

To enable the event again, simply use the `enable` or `enableAll` methods.

**Note:** *The `enable` methods and `disable` methods are mutually exclusive to each other. If you disable an event using `disableAll`, then you can only re-enable it by using `enableAll`. Likewise with disable/enable.*

More coming soon.

### **Pause/Resume Events**
...

### **Using dispatchEvent w/ Headers**
...

### **Event Dispatch Order**
...
### **Dispatch Validation Order**
...

## License

[ISC License (ISC)](https://opensource.org/licenses/ISC)

## Author

**William J. Horn**

*@github:* https://github.com/william-horn

*@email:* williamjosephhorn@gmail.com