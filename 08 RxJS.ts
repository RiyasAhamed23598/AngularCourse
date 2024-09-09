// https://ngrx.io/

// ######################################################################################################
// Reactive vs. Imperative programming
// ######################################################################################################

// Imperative Programming:

// Focuses on describing how a program operates through a sequence of statements that change the program state.
// It uses statements that explicitly describe the steps a computer must take to complete a task ("Do this, then do that").

// 1. Sequential Execution: Code typically executes in a linear, step-by-step fashion.
// 2. Synchronous by Default: Asynchronous operations often require special handling.
// 3. State-Centric: Focuses on changing and maintaining state.
// 4. Pull-based: Data is typically pulled when needed.
// 5. Imperative: You specify the exact sequence of steps to perform a task.
// 6. Request-Driven: Often centered around handling specific requests or inputs.

// Reactive Programming:

// A paradigm that focuses on working with asynchronous data streams and the propagation of changes.
// It's an approach to building software that emphasizes responsiveness to data changes and events ("When this happens, respond by doing that").

// 1. Data Streams: Everything is considered a stream of data that can be observed and reacted to.
// 2. Asynchronous by Default: It's designed to handle asynchronous operations elegantly.
// 3. Data Flow: Focuses on the flow of data through the application.
// 4. Push-based: Data is pushed to the consumers as it becomes available.
// 5. Declarative: You declare the relationships between streams and how to react to changes.
// 6. Event-Driven: Heavily relies on events and their propagation.

// Key Differences:

// 1. Handling Asynchronous Operations:
//    - Imperative: Requires additional constructs like callbacks, promises, or async/await.
//    - Reactive: Built-in support for async operations, making them easier to manage.

// 2. Scalability:
//    - Imperative: Can struggle with high-concurrency scenarios.
//    - Reactive: Better suited for handling large volumes of data and events.

// 3. Complexity Management:
//    - Imperative: Simpler for basic tasks, but can become complex with async operations.
//    - Reactive: Can simplify complex async workflows, but has a learning curve.

// 4. Error Handling:
//    - Imperative: Typically relies on try-catch blocks or promise rejections.
//    - Reactive: Often provides built-in error handling for streams of data.

// 5. Resource Efficiency:
//    - Imperative: May not be as efficient when dealing with real-time data or many concurrent operations.
//    - Reactive: Can be more efficient with resources, especially in high-load scenarios.

// 6. Learning Curve:
//    - Imperative: More intuitive for beginners and widely understood.
//    - Reactive: Steeper learning curve, requires a shift in thinking.

// ######################################################################################################
// What is RxJS?
// ######################################################################################################

// RxJS (Reactive Extensions for JavaScript) is a powerful library for reactive programming using Observables.

// Purpose: RxJS helps manage asynchronous data streams and events in a more organized and efficient manner.

// Key Concepts:
// 1. Observables: Represent a stream of data or events over time.
// 2. Observers: Consume the values emitted by Observables.
// 3. Operators: Functions that transform, filter, or combine Observables.
// 4. Subscriptions: Connect Observers to Observables.

// Main Features:
// - Composability: Easily combine and transform data streams.
// - Lazy evaluation: Computations only run when subscribed to.
// - Error handling: Built-in mechanisms for dealing with errors in asynchronous operations.
// - Cancellation: Ability to stop ongoing operations.

// Use Cases:
// - Handling user input events
// - Making and managing HTTP requests
// - Real-time data updates
// - State management in applications

// Integration:
// - Widely used in Angular framework
// - Can be used with other frameworks or vanilla JavaScript

// Benefits:
// - Simplifies complex asynchronous code
// - Improves performance in handling data streams
// - Provides a consistent way to work with various types of events and data

// Learning Curve:
// - Can be challenging for beginners due to its functional and reactive nature
// - Requires a shift in thinking from imperative to reactive programming

// RxJS is particularly valuable in scenarios involving complex data flows, real-time updates,
// or when dealing with multiple interdependent asynchronous operations.
// It's a cornerstone of reactive programming in the JavaScript ecosystem.

// ######################################################################################################
// Observable
// ######################################################################################################

// An Observable is an object that can emit one or more values over time.
// It represents a stream of data that can be observed by subscribers.
// Instead of getting a single value, you can subscribe to an Observable to receive multiple values over time.
// Observables are a way to handle asynchronous data streams like HTTP requests, user input, and more.
// Observable variables' names end with $. It's not a must but an accepted naming convention.

// The next example uses of() - a utility function that creates an Observable which emits the values provided as arguments, one after the other.
// After emitting the last value, the Observable completes (i.e., it doesn't emit any more values).
// It is a quick and simple way to create an Observable from a static set of values.

import { of } from 'rxjs';

// Create an object of type Observable<number> that emits the values 1, 2, and 3:
const observable$ = of(1, 2, 3);

// Subscribe to the observable and log each emitted value:
observable$.subscribe(value => {
  console.log(value);  // outputs: 1, 2, 3
});

// Observables are lazy by default. This means that an Observable does not start emitting values until it is subscribed to.
// The subscribe() method is what "activates" the Observable and begins the flow of data.

// ######################################################################################################
// RxJS operators
// ######################################################################################################

// RxJS operators are functions that allow you to transform, filter, and manipulate the data emitted by Observables.
// They reduce data streams that take an Observable as input and return another Observable.
// Typically used within the pipe() method (will be described soon) of an Observable, allowing you to chain multiple operations together.
// They're fundamental to working with Observables and are frequently used in Angular applications for handling asynchronous data flows and events.

// Here's a brief description of some popular operators:

// @@@ map:
// Purpose: Transforms each emitted value by applying a provided function.
// Usage: map(value => transformedValue)
// Example:
of(1, 2, 3).pipe(map(x => x * 2)) // emits 2, 4, 6

// @@@ filter:
// Purpose: Emits only values that pass a specified condition.
// Usage: filter(value => boolean)
// Example:
of(1, 2, 3, 4, 5).pipe(filter(x => x % 2 === 0)) // emits 2, 4

// @@@ take:
// Purpose: Emits only the first n values and completes
// Usage: take(n)
// Example:
of(1, 2, 3, 4, 5).pipe(take(3)) // emits 1, 2, 3 and completes

// @@@ takeUntil:
// Purpose: Emits values until another Observable emits a value and completes.
// Usage: takeUntil(notifier$)
// Example:
interval(1000).pipe(takeUntil(timer(5000))) // emits every second for 5 seconds and completes

// @@@ first:
// Purpose: Emits only the first value (or first value that meets a condition) and completes.
// Usage: first() or first(predicate)
// Examples:
of(1, 2, 3, 4, 5).pipe(first()); // emits 1 and completes
of(1, 2, 3, 4, 5).pipe(first(x => x > 2)) // emits 3 and completes

// @@@ last:
// Purpose: Emits only the last value (or last value that meets a condition) and completes.
// Usage: last() or last(predicate)
// Exampls:
of(1, 2, 3, 4, 5).pipe(last()); // emits 5 and completes
of(1, 2, 3, 4, 5).pipe(last(x => x < 4)) // emits 3 and completes

// ######################################################################################################
// pipe()
// ######################################################################################################

// REMARK: Not to be confused with Angular Pipes used for data transformations in templates!

// pipe() is an RxJS function that combines and chains multiple RxJS operators together to transform or manipulate streams of data (Observables).
// Typically, it accepts a series of RxJS operators to process or modify the data emitted by an Observable - map(), filter(), take()
// pipe() takes those operators as arguments and applies them sequentially (!) to the Observable for which it's called.
// This chaining makes it easier to manage complex data transformations and handle asynchronous operations in a clean and readable manner.

// Key Point: pipe() is reactive. It automatically subscribes to the Observable and updates the view whenever a new value is emitted.
// This makes it efficient for handling dynamic data that changes over time (a very common use - capturing user input).

import { of } from 'rxjs';
import { map, filter, take } from 'rxjs/operators';

const observable$ = of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10); // an observable that emits numbers from 1 to 10

// Use pipe() to chain multiple RxJS operators together:
observable$.pipe(
  filter(value => value > 5), // its output stream is the values from the input stream greater than 5: 6, 7, 8, 9, 10
  map(value => value * 2),    // its output stream is the values from the input stream multiplied by 2: 12, 14, 16, 18, 20
  take(3)                     // its output stream is the first 3 values from the input stream: 12, 14, 16
).subscribe(result => {
  console.log(result);        // 12, 14, 16
});

// The input stream of the first RxJS operator - filter() - is the steam emitted by observable$.
// The input stream of each subsequent operator is the output steam of the operator prior to it.

// In an RxJS-based codebase, using pipe() is a consistent and standardized way to apply operators, regardless of how many you use.
// We use pipe() even if only one RxJS operator exists and, so, there is nothing to chain (like in the RxJS operators section examples above).
// This keeps the codebase uniform and easier to maintain as other developers expect operators to always be applied via pipe().
// If you need to add more operators later, the pipe() is already there, making it easy to extend the Observable's behavior without refactoring.
// This is the current standard, and the older "dot chaining" style, like
observable$.map(value => value * 2)
// has been deprecated.

// ######################################################################################################
// Subscription
// ######################################################################################################

// While JavaScript's garbage collector (GC) does handle the automatic deallocation of memory for objects that are no longer referenced, 
//    subscriptions to Observables can prevent proper garbage collection if they aren't manually cleaned up.

// If an Observable remains active after a component has been destroyed or if the user navigates away from the page, the component may
//    never be fully garbage-collected because the Observable is still holding a reference to it.

// Some Observables involve active processes (e.g., WebSockets or timers).
//    These processes may continue running even if the component or context they are part of has been destroyed:
interval(1000).subscribe(value => {
  console.log(value); // will log a value every second indefinitely
});

// To stop the emitting, you need to unsubscribe. To unsubscribe, you need a reference to the subscription.
// This is where the Subscription object comes to our aid.

// Subscription is an RxJS object that represents the execution of an Observable.
// It allows you to manage and control the lifecycle of the Observable stream.

// When you subscribe to an Observable, the subscribe() function returns a Subscription object (ignored in the previous examples):
const intervalSubscription = interval(1000).subscribe(value => {
  console.log(value);
});
 
// When a component is destroyed (typically in the ngOnDestroy() hook), you should unsubscribe from any active subscriptions to avoid memory leaks:
intervalSubscription.unsubscribe();

// It's especially important to unsubscribe from long-lived Observables (like those tied to user input).
// Here’s an example of how you use a Subscription in a component to subscribe to an Observable (e.g., valueChanges from a form control):

import { Component, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-example',
  template: `<input [formControl]="searchControl">`
})
export class ExampleComponent implements OnDestroy {
  searchControl = new FormControl('');
  searchControlValueChangesSubscription: Subscription;

  constructor() {
    // Subscribing to form control value changes:
    this.searchControlValueChangesSubscription = this.searchControl.valueChanges.subscribe(value => {
      console.log('Search input:', value);
    });
  }

  // Unsubscribing when the component is destroyed:
  ngOnDestroy(): void {
    if (this.searchControlValueChangesSubscription) {
      this.searchControlValueChangesSubscription.unsubscribe();
    }
  }
}

// Scenarios When Unsubscribing Is Necessary:

// * Component Destruction:
//     When a component is destroyed (e.g., during route navigation or page closure),
//     any active subscriptions tied to that component should be cleaned up to avoid keeping the component in memory.
// * Event Streams:
//     Observables like those created by fromEvent() for DOM events will continue to listen for events unless explicitly unsubscribed.
// * Long-lived Observables:
//     Streams like interval(), timer(), or WebSocket-based Observables may never complete on their own and require explicit unsubscription.

// Scenarios When Unsubscription Is Not Needed:

// * Finite Observables:
//    Observables that complete on their own (like HTTP requests in Angular's HttpClient) automatically clean themselves up after completion:
      httpClient.get('/api/data').subscribe(data => {
        console.log(data);
      });
// * Using the async Pipe:
//    In Angular templates, the async pipe automatically subscribes to an Observable and unsubscribes when the component is destroyed.
      <div *ngIf="data$ | async as data">
        {{ data }}
      </div>
// * Using Operators like take():
//     RxJS operators like take(), takeUntil(), and first() automatically unsubscribe once a certain condition is met
//     or a specified number of emissions has occurred.
