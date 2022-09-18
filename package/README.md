

# pseudo-events

The `pseudo-events` package was developed by [William J. Horn](https://github.com/william-horn) as a side project during the development of an online browser game called **Adventures of Swindonia**. It is intended to make interfacing with event-driven tasks much easier by allowing the developer to create their own custom events which they can manipulate in a wide variety of ways.

* *Website for documentation coming in the future*
* *If you have any questions or issues with this package please send me an email: williamjosephhorn@gmail.com*
* ***Important:*** *documentation may be outdated as this package is still in early development*

## Table of Contents
* [**About**](#about)
  * [Priority manipulation](#priority-manipulation)
  * [Event dispatch order](#event-dispatch-order)
  * [Filtering](#filtering)
  * [Event toggling](#event-toggling)
* [**Install**](#install)
  * [npm](#npm)
* [**API**](#api)
  * [Creating events](#event-instantiation) | `Event`
  * [Connecting events](#connecting-events) | `connect`
  * [Dispatching/firing events](#dispatching-events) | `fire`, `fireAll`
  * [Disconnecting events](#disconnecting-events) | `disconnect`, `disconnectAll`
  * [Waiting for events](#waiting-for-event-signals) | `wait`
  * [Toggling events](#disablingtoggling-events) | `disable`, `disableAll`, `enable`, `enableAll`
  * [Pausing/Resuming events](#pauseresume-events) | `pause`, `pauseAll`, `resume`, `resumeAll`
  * [Dispatching events w/ headers](#using-dispatchevent-w-headers) | `dispatchEvent`
* [**Concepts**](#concepts)
  * [Linked events](#linked-events)
  * [Event dispatch order](#event-dispatch-order)
  * [Event validation & error handling](#dispatch-validation-order)
* [**Usage**](#usage)
  * [Keyboard input example](#keyboard-input-example) *(not available yet)*
  * [Clock update example](#clock-update-example)
* [**License**](#license)
  * [ISC](#isc-license)

## About

With `pseudo-events` you can link events together, use them individually, create event chains, or create event hierarchies with an intuitive API. Whether you're using one event or a tree of events, you will always have access to the core features:


  * #### **Priority manipulation**
    - Create stronger event connections by defining higher priority level fields
    - Efficient access to all connections of a given priority level
  * #### **Event dispatch order**
    - Full control over which order events will begin dispatching in.
    - Selectively enable or disable individual dispatch procedures *(such as event bubbling, dispatching all descendants, etc)*
  * #### **Filtering**
    - Manipulate events by searching for their `name`, `handler`, or `priority` fields.
    - If no filtering fields are provided, the default behavior is to affect **all** connections with priority level `0`
  * #### **Event toggling**
    - Disable/Enable individual events
    - Disable/Enable entire event hierarchies
  * #### **Event sequences** *(not available yet)*
  * #### **Interface for user input (if on client)** *(not available yet)*
  * etc



[-> Back to table of contents](#table-of-contents)

## Install

### npm
```
npm i pseudo-events
```
[-> Back to table of contents](#table-of-contents)

## API

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

[-> Back to table of contents](#table-of-contents)

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

**`Event(settings)` constructor example:**
```js
const { Event } = require('pseudo-events');

const event = new Event({
  dispatchLimit: 5,
  cooldown: {
    interval: 5,
    duration: 3,
    reset: 2
  }
});
```

**`Event(parentEvent)` constructor example:**

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

**`Event(parentEvent, settings)` constructor example:**
```js
const parent = new Event();

const child = new Event(parent, {
  dispatchAscendants: true
});
```

[-> Back to table of contents](#table-of-contents)

### **Connecting Events**

You can create a new event connection by calling the `connect` method on the event instance. The connect method takes one options argument which can have up to 3 fields:

*Optional fields are denoted with the '?' symbol next to their name. All fields without the `?` tag are **required***

- **name**? *&lt;string>*
  * The name of the connection. Only needed if you intend on disconnecting or filtering events by name later on. If no name is given, the event connection is considered anonymous.

* **handler** *&lt;function>*
  - The handler function that executes when the event is dispatched.

- **priority**? *&lt;number>*
  * The priority number of the connection. If no priority number is given, it defaults to `0`.



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

[-> Back to table of contents](#table-of-contents)

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

*It is worth noting that every time an event is dispatched, that event is passed as the first argument to all of the event handlers (see below)*

**Example:**
```js
event.connect({
  handler: (event, ...args) => console.log('event fired with args: ', ...args) 
});

// dispatch the event with args
event.fire('hello', 'there', 'world!');
```
##
    =>  event fired with args: hello   there   world!

[-> Back to table of contents](#table-of-contents)

### **Disconnecting Events**

If you no longer need an event connection then you may disconnect it from the event instance by using `disconnect` or `disconnectAll`.
  
You can disconnect event connections by *name*, *handler function*, or by the *connection instance* returned from the `connect` method.


The `disconnect` method takes one 'options' object as an argument which can contain the following fields:


* **name**? *&lt;string>*
  - The name of the connection to disconnect

- **handler**? *&lt;function>*
  * The handler function literal that was passed to a `connect` method

* **connection**? *&lt;Connection Object>*
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

// start disconnecting with filter
event.disconnect({ name: 'someName' });
event.disconnect({ handler: someHandler });
event.disconnect({ connection: connectionThree });

// finally, disconnect the rest
event.disconnect();

event.fire();
```
##
    =>  <Empty>


The `disconnectAll` method will recursively call `disconnect` on all descendant events. This method takes the same options argument as `disconnect`.

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
childEvent.connect({ name: 'someName', handler: () => console.log('child event #1') });
childEvent.connect({ handler: () => console.log('child event #2') });

parentEvent.disconnectAll({ name: 'someName' });

// we can use fireAll() instead of individually firing the events
parentEvent.fireAll();
```
##
    =>  parent event #1
        child event #2

[-> Back to table of contents](#table-of-contents)

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
*after 2 seconds:*
##
    =>  got back: [1, 'a', false]

[-> Back to table of contents](#table-of-contents)
### **Disabling/Toggling Events**

Events can be enabled/disabled temporarily without needing to disconnect them. To do so, you can use the `disable` and `disableAll` methods.


**Example:**

```js
const event = new Event();

event.connect({ handler: () => console.log('handler ran!') });

event.disable();
event.fire() //=> nothing
```

To enable the event again, simply use the `enable` or `enableAll` methods.

**Note:** *The `enable` methods and `disable` methods are mutually exclusive to each other. If you disable an event using `disableAll`, then you can only re-enable it by using `enableAll`. Likewise with disable/enable.*

Invalid:
```js
event.disableAll();
event.enable();

// or
event.disable();
event.enableAll();
```
Valid:
```js
event.disableAll();
event.enableAll();

// or
event.disable();
event.enable();
```

Contrary to the norm thus far, `disableAll` does not call `disable` recursively behind the scenes. It will call `disable` on the initial event, but descendant events will not have their state changed to `'Disabled'`. 

Instead, they internally track how many ancestor events have been disabled (using `disableAll`) and if that number is greater than one the descendant event will not fire.

This means while you cannot call a disable method on an already-disabled event, you *can* call a disable method on a descendant of a disabled event. 

**Example:**

```js
const parent = new Event();
const child = new Event(parent);

child.connect({ handler: () => console.log('child fired') });

parent.disableAll();
child.disable(); // this is valid

child.fire(); // => Disabled

child.enable();
child.fire() // => DisabledByAncestor

parent.enableAll();
child.fire() // => child fired
```

More coming soon.

[-> Back to table of contents](#table-of-contents)

### **Pause/Resume Events**
*[ In Development ]*

[-> Back to table of contents](#table-of-contents)

### **Using dispatchEvent w/ Headers**
As mentioned before, you can also fire events using the `dispatchEvent` function. This function gives you full customizable control over how an event will be dispatched and what effects it will have.

For example, the `fire` method is called like this:
```js
dispatchEvent({ 
  event: targetEvent,
  args: [...args]
});
```
whereas the `fireAll` method is called like this:
```js
dispatchEvent({
  event: targetEvent,
  args: [...args],
  headers: {
    dispatchDescendants: true
  }
});
```

Here is a list describing the different options you can pass to `dispatchEvent`:

* **event** *&lt;EventInstance>*
  - The target event to be dispatched.

* **args** *&lt;any[]>*
  - An array of arguments that will be passed to the event handler callback functions

* **headers** *&lt;object>*
  - An list of modified event settings that the event will use for this one-time dispatch. Any setting inside of event settings is a valid header to pass. Here are the common ones:

    - **dispatchSelf** *&lt;boolean>*
      * Determines whether the handler functions associated with the target event will be dispatched. If `true`, the connections on the target event will fire. If `false`, the connections will not fire but the dispatch will still be registered and the event can still bubble up or trickle down.
    - **dispatchAscendants** *&lt;boolean>*
      * Determines whether or not the event will bubble. If `true`, the event will bubble. If `false`, it will not. **This option is mutually exclusive with `dispatchDescendants`**
    - **dispatchDescendants** *&lt;boolean>*
      * Determines whether or not the event will trickle down and fire all descendant events. If `true`, it will trickle. If `false`, it will not.
      **This option is mutually exclusive with `dispatchAscendants`**
    - **dispatchOrder** *&lt;number[]>*
      * Determines the order in which the event signals propagate throughout the hierarchy. ([See event dispatch order](#event-dispatch-order))

## Concepts

In concepts you will find all information relating to event config options, ordering of event behavior, and insight to what's happening under the hood.

### **Linked Events**
You can bind multiple events to a target event without creating a hierarchy when one isn't necessary by using the `linkedEvents` option. This event settings allows you to pass an array containing all event instances that should be fired when the target event is fired. 

**Example:**

```js
const newHandler = msg => () => console.log(msg);

// create events
const linkedOne = new Event();
const linkedTwo = new Event();
const linkedThree = new Event();

// connect events to handlers
linkedOne.connect({ handler: newHandler('linked event one') });
linkedTwo.connect({ handler: newHandler('linked event two') });
linkedThree.connect({ handler: newHandler('linked event three') });

// create a target event that binds 
const targetEvent = new Event({
  requiresConnection: false,
  linkedEvents: [linkedOne, linkedTwo, linkedThree],
});

targetEvent.fire();
```
##
    =>  bound event one
        bound event two
        bound event three

*Note: If an event has no connections then any dispatch method to it will fail with a `'NoConnection`' status. However, if you include `requiresConnection: false` in event settings then this will bypass that default behavior.*

**Cyclic Linked Events**

It is possible that an event inside the `linkedEvents` array may reference a previous node up the event tree. If this happens, an error message will be thrown indicating that you cannot have cyclic event calls.

**Example:**

```js
const linkedOne = new Event({ requiresConnection: false });
const linkedTwo = new Event({ requiresConnection: false });

linkedOne.settings.linkedEvents = [linkedTwo];
linkedTwo.settings.linkedEvents = [linkedOne];

linkedOne.fire();
```
##
    => ERROR: Detected cyclic linked events

[-> Back to table of contents](#table-of-contents)

### **Event Dispatch Order**
...

[-> Back to table of contents](#table-of-contents)
### **Dispatch Validation Order**
...

[-> Back to table of contents](#table-of-contents)

## Usage

### Keyboard input example
...

[-> Back to table of contents](#table-of-contents)

### Clock update example


Say we want a program that let's us keep track of clock time, and we need an event for **seconds**, **minutes**, and **hour** changes. Here is a potential implementation using this package:

```js
const { Event } = require('pseudo-events');
```

*(Coming soon)*


## License

* #### [**ISC License**](https://opensource.org/licenses/ISC)

[-> Back to table of contents](#table-of-contents)

## Author

**Package author and documentation by:** *William J. Horn*

**Reach me at:**

* *github:* https://github.com/william-horn
* *email:* williamjosephhorn@gmail.com

[-> Back to table of contents](#table-of-contents)