// https://ngrx.io/

// ######################################################################################################
// What is NgRx?
// ######################################################################################################

// NgRx is a framework for building reactive applications in Angular.
// It is a state management library that implements the Redux pattern using RxJS (Reactive Extensions for JavaScript)
//    to manage the application state in a reactive and predictable way.
// NgRx provides a set of libraries for managing the global state, side effects, and entity collections, among other functionalities.

// NgRx is particularly useful in large-scale applications where managing state in a scalable and maintainable way is critical.
// It helps developers maintain a predictable and centralized state, making debugging easier and
//    improving application performance by efficiently managing the state.

// @@@ General Flow of Application State in NgRx

// NgRx follows the Redux architecture pattern, which is a unidirectional data flow.
// Here's a high-level overview of how state management works in an NgRx application:

// The state management lifecycle flowchart: https://ngrx.io/generated/images/guide/store/state-management-lifecycle.png

// 1. Actions:
//     Actions are dispatched from components or services to express events or intentions in the application.
//     Each action is a simple object with a `type` property and an optional `payload` (additional data required for the action).

// 2. Reducers:
//     Reducers are pure functions which define how the state changes in response to actions.
//     They determine the new state based on the current state and the action dispatched.
//     They listen for actions and modify the state accordingly.

// 3. Store:
//     The Store is the single source of truth for the application state.
//     It holds the current state of the application and provides a way to access the state, dispatch actions, and subscribe to state changes.
//     The Store is an observable, and components can subscribe to it to get updates when the state changes.

// 4. Effects:
//     Effects handle side effects in NgRx, such as asynchronous operations (e.g., HTTP requests), logging, or interacting with external APIs.
//     Effects listen for specific actions and perform side effects without affecting the Store directly.
//     Once the side effect is completed, Effects can dispatch new actions to update the state.

// 5. Selectors:
//     Selectors are pure functions that extract and derive slices of state from the Store.
//     They are used to retrieve specific pieces of state or computed properties from the Store.
//     Selectors can be combined to create more complex selectors.

// ######################################################################################################
// Model
// ######################################################################################################

// The Model file is used to define the structure of data (interfaces or classes) that will be managed by the NgRx store.
// These models represent the current module's entities, ensuring strong typing. Example:

export interface ICustomer {
  customerId: number;
  firstName: string;
  lastName: string;
  orders: IOrder[];
}

export interface IOrder {
  orderId: number;
  orderDate: Date;
  products: IProduct[];
}

export interface IProduct {
  productId: number;
  productName: string;
  price: number;
  quantity: number; // quantity of the product in the order
}

// ######################################################################################################
// State
// ######################################################################################################

// State refers to an object that holds all the data of a module (normally, a screen with many related data objects) at a specific point in time.

// As an example, let's consider a screen (module) with the following structure
// (it doesn't seems realistic but demonstrates easy management of complex screens using understandable entities):
// * There is a list of customers.
// * When the user selects a customer, the screen displays the details form for that customer and a list of the customer's orders.
// * When the user selects an order, the screen displays the details form for that order and a list of the order's products.
// * When the user double-clicks a product, a details form dialog pops up.
// The Add/Edit/Delete functionality is omitted for simplicity.

// Here is the State datatype which holds the entire screen's data:

import { ICustomer, IOrder, IProduct } from 'src/models/customer.model';

export interface ICustomerState {
  customerList: ICustomer[]; // list of customers
  contextCustomer: ICustomer | null; // details form of the currently selected customer
  orderList: IOrder[]; // list of orders of the currently selected customer
  contextOrder: IOrder | null; // details form of the currently selected order
  productList: IProduct[]; // list of products of the currently selected order
  contextProduct: IProduct | null; // details form dialog for the double-clicked product
}

// State:
// * Centralizes data management providing a single source of truth for the module's data.
// * Ensures that all parts of the module are synchronized with the same version of the data.
// * Simplifies communication between components by avoiding direct data sharing and, worse, multiple copies of the same data.
// * Ensures that growing amounts of data are handled efficiently and predictably.

// In NgRx, State is immutable, meaning it cannot be directly modified.
// Instead, a new State is created whenever changes occur, ensuring predictability and enabling time-travel debugging.
// Eeach change creates a new snapshot, preventing accidental modifications and ensuring reliable debugging.

// The same State file must also define the Initial State object where all the properties are populated with default values:

export const initialCustomerState: ICustomerState = {
  customerList: [],
  contextCustomer: null,
  orderList: [],
  contextOrder: null,
  productList: [],
  contextProduct: null
};

// The Initial State is crucial since it:
// * Provides a clear and consistent starting point for the module's State.
// * Ensures that the state is always defined, even before any data is retrieved.

// ######################################################################################################
// Store
// ######################################################################################################

// While State is a module-level data container, Store is an application-level data container.
// The Store instance is a singleton data object that holds the state of the whole application.
// In fact, Store is a container for States of multiple modules which are currently active.

// It should be regarded as one single source of data that is delivered to the application.
// By following this rule, the Store represents the application’s true and only state at any time.
// This makes it easier to predict and track changes of any data.

// The Store is a state-management solution inspired by the famous library Redux.
// Redux popularized the idea of organizing the application state into simple objects (use primitive and non-primitive types
// 		 in JavaScript) and updating this state by replacing it with a new state.
// This means that the object shouldn’t be mutated directly, but rather should be replaced with a new object.
// You can think of it as a database that you can get access to in order to retrieve or update the data that the application operates on.

// The module (screen) usually consists of a few components for different areas.
// Here is a sample component for the Customer List.
// It's incomplete and created only to demonstrate working with the Store:

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { ICustomer } from 'src/models/customer.model';

@Component({
  selector: 'app-customers-list',
  template: '<the HTML template URL>'
})
export class CustomerListComponent implements OnInit, OnDestroy {
  customerList$: Observable<ICustomer[]>;
  contextCustomer$: Observable<ICustomer>;
  private _customerList: ICustomer[] = [];
  private _contextCustomer!: ICustomer;
  private _subscription: Subscription = new Subscription();

  // Pay attention that a pointer to the application's Store is injected into the constructor:
  constructor(private _store: Store<{ customerList: ICustomer[]; contextCustomer: ICustomer }>) {
    // Populate observables from the Store:
    this.customerList$ = this._store.select('customerList');
    this.contextCustomer$ = this._store.select('contextCustomer');
    // IMPORTANT!
    // Note that the parameters passed to the select() functions are the State's properties' names as strings.
    // This way data is retrieved from the module's State which is a part of the application's Store.
  }

  ngOnInit(): void {
    this._subscription.add(
      this.customerList$.subscribe((customers: ICustomer[]) => { this._customerList = customers; })
    );

    this._subscription.add(
      this.contextCustomer$.subscribe((customer: ICustomer) => { this._contextCustomer = customer; })
    );
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }
}

// The _customerList and _contextCustomer vars are created for the sake of working with the data in the imperative way, if needed.

// If another component will need to get, for example, the selected customer, it will do the same:
this.contextCustomer$ = this._store.select('contextCustomer');
// That eliminates the need to pass that customer as an input field from the parent component's template.
// If any component changes contextCustomer property of the module's State, all the subscribing components are immediately aware of that
//    so, for example, their templates are automatically re-rendered to reflect the change. Reactive programming is magic!

// ######################################################################################################
// Action
// ######################################################################################################

// An Action is a plain TypeScript class that describes a unique event (usually, a data manipulation or a change in the application’s state).
// An Action is dispatched (launched) in one part of the application and captured in others, providing an easy global communication channel.
// NgRx automatically manages the chain of fired events when an Action is dispatched, ensuring the appropriate consumers respond to it seamlessly.
// Actions are one of the main building blocks in NgRx.

// An Action is created and returned by the createAction() factory function.
// The next example defines a few simple Actions.
// The good practice is to add the word "Action" to the names of Action objects:
import { createAction } from '@ngrx/store';
export const incrementAction = createAction('[Counter] Increment');
export const decrementAction = createAction('[Counter] Decrement');
export const resetAction = createAction('[Counter] Reset');

// @@@ The 1st parameter to createAction():

// It's a string that describes the action and this way represents its type. The naming convention:
"[Module] Description"
// "[Module]" (within square brackets) indicates the feature module where the action is used. For application-wide Actions, use [App].
// "Description" reflects the specific event that is fired.

// IMPORTANT! The first parameter to createAction() should be unique across the entire application.
// This string serves as a unique identifier for each action, and having duplicate action types can lead to unintended consequences:
// * In Reducers (described later): Multiple reducers might respond to the same action type, causing unexpected state changes.
// * In Effects (described later): Effects listening for specific action types could trigger multiple times or handle the wrong action.
// For example, you have two modules - let's name them A and B. Each module has its own Cleanup Before Destroy Action.
// Declare in the Actions file of one module:
export const cleanupBeforeDestroyAction = createAction('[Module A] Cleanup Before Destroy');
// Declare in the Actions file of the other module:
export const cleanupBeforeDestroyAction = createAction('[Module B] Cleanup Before Destroy');
// The contants names are the same since they are in different files, but the descriptions, seen on the app level, are different, so you are good.

// Hypothetically, different modules could have a same description, which would break the uniqueness.
// To be 100% safe, use the Action file name (without the .ts) as the module identifier in the square brackets.

// @@@ The 2nd parameter (optional) to createAction():

// Describes the payload (additional data) expected by the Action. That data must be provided when the Action is dispatched.
// The argument prevents sending wrong data, i.e. inforces strong typing.

// The payload is sent to createAction() as the 2nd parameter via the props<T>() function, for example:
import { createAction, props } from '@ngrx/store';
export const insTodoAction = createAction('[Todo List] Insert Todo', props<{ todoText: string }>());

// props<T>() takes a generic type parameter, which is the shape of the payload for compile-time type checking to ensure correct payload structure.
// In the example above, the props defines that the action should carry a payload with a property `todoText` of type `string`:
this._store.dispatch(insTodoAction({ todoText: 'Learn NgRx' })); // correct!
// The next call will cause a compilation-time error:
this._store.dispatch(insTodoAction({ text: 'Learn NgRx' })); // doesn't match the required shape - 'text' is not defined in the props

// Note that the dispatch() method is in the State singleton - that illustrates the application-wide scope of Actions.
// Usually, Action files are grouped in a folder under the app's Store folder, like src/app/Store/actions/.

// The next example describes the Action file which could exist for the Customer screen we used earlier.
// A dedicated Action is defined for each relevant CRUD operation of each component of the module.

// If the Action was executed sucsessfully, then its Success counterpart Action is dispatched by the Effect (Effects will be described later).
// For example, if delCustomerAction has deleted the requested customer, the Effect dispatches delCustomerSuccessAction.

// Note that the props of the Success Actions represent data, returned by the Service (i.e., usually retrieved from the DB).
// For example:
// * selCustomerListSuccessAction has the retrieved customers list (the Reducer will populate the State's customers array with it).
// * insCustomerSuccessAction has the inserted customer with the customerId just generated by the DB
//      (the Reducer will update the contextCustomer with it).
// * updCustomerSuccessAction has the updated customer (in the real app, it could have some fields, generated by the DB, such as updateTime and
//      updatedBy, or some calculated statistics, so the Reducer would update the contextCustomer with the new values).
// * delCustomerSuccessAction has the customerId of the deleted customer (the Reducer will remove it from the State's customers array).
// If any CRUD Action failes, its xxxSuccessAction is not dispatched, so the State remains untouched.

import { createAction } from '@ngrx/store';
import { ICustomer, IOrder, IProduct } from 'src/models/customer.model';

const m = '[customer.action]'; // m = Module; supposing the file name is customer.action.ts
const c = 'Customer';
const o = 'Order';
const p = 'Product';

enum d { // the Actions "d"escriptions
  // Customer:
  SetContextCustomer = `${m} Set Context ${c}`, // displatched when a customer is highlighted in the customers list
  SelCustomerList = `${m} Select ${c} List`,
  SelCustomerListSuccess = `${SelCustomerList} Success`,
  SelCustomer = `${m} Select ${c}`,
  SelCustomerSuccess = `${SelCustomer} Success`,
  InsCustomer = `${m} Insert $c}`,
  InsCustomerSuccess = `${InsCustomer} Success`,
  UpdCustomer = `${m} Update ${c}`,
  UpdCustomerSuccess = `${UpdCustomer} Success`,
  DelCustomer = `${m} Delete ${c}`,
  DelCustomerSuccess = `${DelCustomer} Success`,
  // Order:
  SelOrderList = `${m} Select ${o} List`,
  SelOrderListSuccess = `${SelOrderList} Success`,
  SelOrder = `${m} Select ${o}`,
  SelOrderSuccess = `${SelOrder} Success`,
  InsOrder = `${m} Insert $o}`,
  InsOrderSuccess = `${InsOrder} Success`,
  UpdOrder = `${m} Update ${o}`,
  UpdOrderSuccess = `${UpdOrder} Success`,
  DelOrder = `${m} Delete ${o}`,
  DelOrderSuccess = `${DelOrder} Success`,
  // Product:
  SelProductList = `${m} Select ${p} List`,
  SelProductListSuccess = `${SelProductList} Success`,
  SelProduct = `${m} Select ${p}`,
  SelProductSuccess = `${SelProduct} Success`,
  InsProduct = `${m} Insert $p}`,
  InsProductSuccess = `${InsProduct} Success`,
  UpdProduct = `${m} Update ${p}`,
  UpdProductSuccess = `${UpdProduct} Success`,
  DelProduct = `${m} Delete ${p}`,
  DelProductSuccess = `${DelProduct} Success`,
}

// Customer:
export const setContextCustomerAction = createAction(d.SetContextCustomer, props<{ actionCustomer: ICustomer | null }>());
export const selCustomerListAction = createAction(d.SelCustomerList);
export const selCustomerListSuccessAction = createAction(d.SelCustomerListSuccess, props<{ actionCustomerList: ICustomer[] }>());
export const selCustomerAction = createAction(d.SelCustomer, props<{ actionCustomerId: number }>());
export const selCustomerSuccessAction = createAction(d.SelCustomerSuccess, props<{ actionCustomer: ICustomer }>());
export const insCustomerAction = createAction(d.InsCustomer, props<{ actionCustomer: ICustomer }>());
export const insCustomerSuccessAction = createAction(d.InsCustomerSuccess, props<{ actionCustomer: ICustomer }>());
export const updCustomerAction = createAction(d.UpdCustomer, props<{ actionCustomer: ICustomer }>());
export const updCustomerSuccessAction = createAction(d.UpdCustomerSuccess, props<{ actionCustomer: ICustomer }>());
export const delCustomerAction = createAction(d.DelCustomer, props<{ actionCustomerId: number }>());
export const delCustomerSuccessAction = createAction(d.DelCustomerSuccess, props<{ actionCustomerId: number }>());
// Order:
export const selOrderListAction = createAction(d.SelOrderList, props<{ actionCustomerId: number }>());
export const selOrderListSuccessAction = createAction(d.SelOrderListSuccess, props<{ actionOrderList: IOrder[] }>());
export const selOrderAction = createAction(d.SelOrder, props<{ actionOrderId: number }>());
export const selOrderSuccessAction = createAction(d.SelOrderSuccess, props<{ actionOrder: IOrder }>());
export const insOrderAction = createAction(d.InsOrder, props<{ actionOrder: IOrder }>());
export const insOrderSuccessAction = createAction(d.InsOrderSuccess, props<{ actionOrder: IOrder }>());
export const updOrderAction = createAction(d.UpdOrder, props<{ actionOrder: IOrder }>());
export const updOrderSuccessAction = createAction(d.UpdOrderSuccess, props<{ actionOrder: IOrder }>());
export const delOrderAction = createAction(d.DelOrder, props<{ actionOrderId: number }>());
export const delOrderSuccessAction = createAction(d.DelOrderSuccess, props<{ actionOrderId: number }>());
// Product:
export const selProductListAction = createAction(d.SelProductList, props<{ actionOrderId: number }>());
export const selProductListSuccessAction = createAction(d.SelProductListSuccess, props<{ actionProductList: IProduct[] }>());
export const selProductAction = createAction(d.SelProduct, props<{ actionProductId: number }>());
export const selProductSuccessAction = createAction(d.SelProductSuccess, props<{ actionProduct: IProduct }>());
export const insProductAction = createAction(d.InsProduct, props<{ actionProduct: IProduct }>());
export const insProductSuccessAction = createAction(d.InsProductSuccess, props<{ actionProduct: IProduct }>());
export const updProductAction = createAction(d.UpdProduct, props<{ actionProduct: IProduct }>());
export const updProductSuccessAction = createAction(d.UpdProductSuccess, props<{ actionProduct: IProduct }>());
export const delProductAction = createAction(d.DelProduct, props<{ actionProductId: number }>());
export const delProductSuccessAction = createAction(d.DelProductSuccess, props<{ actionProductId: number }>());

// Note that the names of the properties passed to the props() methods follow the "actionXxx" naming convention.
// That will be helpful when the data is provided on dispatch ("actionCustomerId = customerId" is more clear than "customerId = customerId").

// There are a few rules to writing good actions within your application:
// * Upfront - write actions before developing features to understand and gain a shared knowledge of the feature being implemented.
// * Divide - categorize actions based on the event source.
// * Many - actions are inexpensive to write, so the more actions you write, the better you express flows in your application.
// * Event-Driven - capture events not commands as you are separating the description of an event and the handling of that event.

// ######################################################################################################
// Service
// ######################################################################################################

// UNDER CONSTRUCTION

// ######################################################################################################
// Effect
// ######################################################################################################

// If your application needs to perform side effects like API calls, you would define Effects.
// Side effects are operations that occur outside the context of a pure function, such as making HTTP requests, accessing local storage,
// 		interacting with browser APIs, or performing other asynchronous tasks.

// They are implemented using RxJS observables and are set up to listen for specific actions dispatched from your store.
// When an effect "hears" the subscribed action, it performs some side effect and then dispatches a new action to update the state in the store.

// Effects allow you to describe asynchronous behavior in a declarative way.
// As an example of an asynchronous operation, you could use an effect that listens for specific actions and performs an HTTP request.

// NgRx Effects allow you to isolate side effects from components and reducers, keeping your state management pure, predictable and easy to test.

// You can easily compose effects with other observables, enabling complex asynchronous operations to be expressed in a readable manner.

// Let's use the previous example with increment, decrement, and reset actions to demonstrate how Effects can be used to handle side effects.
// We will create an Effect only for increment (the others would be similar).
// Let's assume that the increment action should trigger an asynchronous operation, such as logging the increment action to a server.
// We want to perform a side effect every time the counter is incremented, such as logging this action to an external service.

// The action for incrementing was described earlier:
export const increment = createAction('[Counter Component] Increment');
// Now, let's create in counter.actions.ts two more action to handle successful and unsuccessful logging of the increment action:
export const logIncrementSuccess = createAction('[Counter API] Log Increment Success');
export const logIncrementFailure = createAction('[Counter API] Log Increment Failure', props<{ error: any }>());

// We’ll use the same state and reducer as before, without any modifications needed for the counter operations themselves.

// Now we create an effect to handle the side effect of logging the increment action to an external service.

// Suppose, we have CounterLogger - an Angular service that is responsible for logging the increment action to an external service or API.
// Here’s how the CounterLogger might be implemented (the implementation is unimportant for the explanation of Effects,
//    just notice the logIncrement() method which returns an observable of type void, meaning it does not expect any response body):

// counter.logger.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CounterLogger {
  private apiUrl = 'https://example.com/api';  // Hypothetical API endpoint

  constructor(private http: HttpClient) {}

  // Method to log the increment action to an external service:
  logIncrement(): Observable<void> {
    // Send a POST request to log the increment action
    return this.http.post<void>(`${this.apiUrl}/log-increment`, {}).pipe(
      catchError((error) => {
        console.error('Error logging increment:', error);
        throw error;
      })
    );
  }
}

// And now let's write the effects class:

// counter.effects.ts
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { CounterLogger } from './counter.logger';
import * as CounterActions from './counter.actions';

@Injectable()
export class CounterEffects {

  constructor(
    private actions$: Actions,
    private counterLogger: CounterLogger
  ) {}

  // Effect to log increment action:
  logIncrement$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CounterActions.increment), // listen for the 'increment' action
      mergeMap(() =>
        this.counterLogger.logIncrement().pipe( // call the service to log increment
          // On successful HTTP request, map to a logIncrementSuccess action:
          map(() => CounterActions.logIncrementSuccess()), // dispatch success action
          // Catch any errors during the HTTP request and map them to a logIncrementFailure action:
          catchError(error => of(CounterActions.logIncrementFailure({ error }))) // dispatch failure action
        )
      )
    )
  );
}

// Notice that the logIncrement$ observer is declared public since it must be accessed from outside by:
// Automatic Subscription:
//    NgRx Effects uses Angular's dependency injection system to manage and subscribe to effects automatically.
//    For this to work, NgRx needs to have access to all the effect properties defined within the class.
// Detection:
//    NgRx detects effects by looking for properties that are initialized using the createEffect function.
//    These properties must be publicly accessible to be detected and managed by NgRx.

// createEffect() is a function in NgRx used to define and register effects.
// Parameters:
//    Factory function: A function that returns an observable, defining the logic for handling side effects based on actions.
//    Options object (optional): { dispatch: boolean } to indicate whether the effect should dispatch an action (true by default).
// Return Type:
//    EffectConfig: An observable managed by NgRx that triggers side effects and optionally dispatches actions.

// Let's break down each part of the previous code fragment.

// ofType()

// ofType is an operator from NgRx that filters an observable of actions, allowing only actions with specific types to pass through.
// It filters the actions$ observable stream to listen specifically for CounterActions.increment.
// This means the subsequent operators in the pipe will only run when an increment action is dispatched.

// of()

// of() is an RxJS function that creates an observable that emits the arguments you pass and then completes.
// It is used to create an observable that emits the logIncrementFailure action with an error payload.
// This is necessary for the catchError operator to return an observable in case of an error during the HTTP request.

// mergeMap()

// mergeMap is an RxJS operator that maps each value from the source observable into an observable and
//    flattens all of these inner observables into a single observable output.
// It takes the increment action and, instead of returning a simple value, it returns an observable from the logIncrement HTTP request.
// mergeMap allows multiple HTTP requests to be active simultaneously without waiting for one to complete before starting the next.

// pipe()

// pipe() is a method that combines (chains) multiple operators together.
// It takes operators as arguments and applies them sequentially to the observable.
// In this example pipe() is used twice:
// * On actions$ to compose the ofType and mergeMap operators.
// * On the observable returned by this.counterService.logIncrement() to handle the response with map (on success) and catchError (on failure).

// >>> The last step: Register the Effect in EffectsModule, and CounterLogger in the app's providers array

// The created Effect must be registered it in EffectsModule.
// EffectsModule is provided by NgRx and used to set up and manage effects in an Angular application.

// Key Functions of EffectsModule:
// * Registers Effects:
//    It registers one or more effects classes that define side effects.
// * Manages Effects Lifecycle:
//    It handles the lifecycle of effects, including initializing, listening for dispatched actions, and cleaning up when they are no longer needed.
// * Configures Global and Feature Effects:
//    It supports configuring both global (root) effects and feature-specific effects, making it flexible for different parts of an application.

// The next fragment shows how you would typically write those registerations.
// We will just add new stuff (marked with <<<) to the app.module.ts file we already used to demonstrate reducers:

// app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { StoreModule } from '@ngrx/store';
import { counterReducer } from './counter.reducer';
import { EffectsModule } from '@ngrx/effects'; // <<<
import { CounterEffects } from './counter.effects'; // <<<
import { CounterLogger } from './counter.logger'; // <<<

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    StoreModule.forRoot({ counter: counterReducer }),
    EffectsModule.forRoot([CounterEffects]) // <<< register the CounterEffects
  ],
  providers: [CounterLogger], // <<< register the logging used in effects as an application's provider
  bootstrap: [AppComponent]
})
export class AppModule {}

// Registering CounterLogger the providers array of the root module ensures that Angular's dependency injection system
//    creates a singleton instance of the service, making it available throughout the entire application.
// This means the service can be injected into any component, service, or effect throughout the app without creating multiple instances.
// Having a singleton ensures that all parts of the application using CounterLogger have a consistent view of any state or behavior it manages, 
//    preventing issues with state duplication or synchronization.


// ######################################################################################################
// Reducer
// ######################################################################################################

// Reducers are responsible for handling transitions from one state to the next state in your application.
// Reducer functions handle these transitions by determining which actions to handle based on the action's type..

// Reducers take two arguments:
// 1. The current state
// 2. The latest Action dispatched
// They then determine whether to return a newly modified state (based on the action type and payload), or the original state.
// Reducers are responsible for updating the state in an immutable way, returning a new state object without mutating the existing state.

// Let's go through an example to understand how reducers work in NgRx.
// We'll create a simple counter application that manages its state using NgRx.

// >>>
// >>> Step 1: Define Actions
// >>>

// First, we define actions that represent the events that can change the state of the counter:

// counter.actions.ts
import { createAction } from '@ngrx/store';

export const increment = createAction('[Counter Component] Increment');
export const decrement = createAction('[Counter Component] Decrement');
export const reset = createAction('[Counter Component] Reset');

// >>>
// >>> Step 2: Define State and Initial State
// >>>

// Next, we define the shape of our state and provide an initial state.

// Define the shape of the state according to what you are capturing, whether it be a single type such as a number,
//		or a more complex object with multiple properties.

// Provide the initial state which gives the state an initial value, or provides a value if the current state is undefined.
// You set the initial state with defaults for your required state properties:

// counter.state.ts
export interface CounterState {
  count: number;
}

export const initialState: CounterState = {
  count: 0
};

// >>>
// >>> Step 3: Create the Reducer
// >>>

// Now we create the reducer function that will handle the state transitions based on the actions dispatched:

// counter.reducer.ts
import { createReducer, on } from '@ngrx/store';
import { increment, decrement, reset } from './counter.actions';
import { initialState, CounterState } from './counter.state';

// Create the reducer function
export const counterReducer = createReducer(
  initialState,
  on(increment, (state) => ({ ...state, count: state.count + 1 })),
  on(decrement, (state) => ({ ...state, count: state.count - 1 })),
  on(reset, (state) => ({ ...state, count: 0 }))
);

// on(increment, ...): When the increment action is dispatched, increase the count by 1.
// on(decrement, ...): When the decrement action is dispatched, decrease the count by 1.
// on(reset, ...): When the reset action is dispatched, set the count to 0.

// In the example above, the reducer is handling 3 actions. Each action is strongly-typed.

// Each action handles the state transition immutably.
// This means that the state transitions are not modifying the original state, but are returning a new state object using the spread operator.
// The spread syntax (...state) copies the properties from the current state into the object, creating a new reference.
// This ensures that a new state is produced with each change, preserving the purity of the change.
// This also promotes referential integrity, guaranteeing that the old reference was discarded when a state change occurred.

// The spread operator only does shallow copying and does not handle deeply nested objects.
// You need to copy each level in the object to ensure immutability.
// There are libraries that handle deep copying including lodash and immer.
 
// The on() functions specify how the state should change in response to each action.
// It associates one or more actions with a state change function when creating a reducer.
// In this example,
on(increment, (state) => ({ ...state, count: state.count + 1 }))
// means "when the increment action is dispatched, take the current state and return a new state with count incremented by 1".
// If CounterState would have more properties, they would be unchanged in the returned new state.
// Basic Syntax:
on(actionCreator | actionCreators, reducerFunction)
// The second argument is a reducer function that defines how the state should change in response to the action(s).

// >>>
// >>> Step 4: Register the Reducer in the Store
// >>>

// The reducer must be registered in the NgRx store module so that the application knows about it.

// StoreModule is an Angular module provided by the NgRx library.
// StoreModule provides the infrastructure for setting up and managing the store in your Angular application.
// To register the reducer, import both StoreModule and the reducer into your application's root module:

// app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { StoreModule } from '@ngrx/store';
import { counterReducer } from './counter.reducer';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    StoreModule.forRoot({ counter: counterReducer }) // <<< register the reducer in StoreModule here
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}

// StoreModule.forRoot() method initializes the NgRx store at the root level.
// It takes an object where keys are state variable names (e.g., 'counter') and values are reducer functions (e.g., counterReducer).
// By passing { counter: counterReducer } to StoreModule.forRoot(), you are registering the counterReducer to manage a state var called counter.

// >>>
// >>> Step 5: Use the Reducer in a Component
// >>>

// In the component, we can now:
//    dispatch actions (to modify the state),
//    dispatch subscribes (to reactively receive state updates), and
//    select state from the store.

// counter.component.ts
import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { increment, decrement, reset } from './counter.actions';
import { CounterState } from './counter.state';

@Component({
  selector: 'app-counter',
  template: `
    <div>
      <h1>Counter: {{ count$ | async }}</h1>
      <button (click)="increment()">Increment</button>
      <button (click)="decrement()">Decrement</button>
      <button (click)="reset()">Reset</button>
    </div>
  `,
})
export class CounterComponent {
  count$: Observable<number>;

  constructor(private _store: Store<{ counter: CounterState }>) {
    this.count$ = _store.select(state => state.counter.count);
  }

  increment() {
    this._store.dispatch(increment());
  }

  decrement() {
    this._store.dispatch(decrement());
  }

  reset() {
    this._store.dispatch(reset());
  }
}

// count$: An observable of the counter's current state, which is retrieved using the select method.
// Dispatching Actions: The increment, decrement, and reset methods dispatch their respective actions to update the state.

// How Reducers Are Called from a Component:
// 1. Component Interaction: When a user interacts with the component (clicks a button), an action is dispatched using the store's dispatch method.
// 2. Action Dispatch: The action is sent to the NgRx store, which then forwards it to the reducer.
// 3. Reducer Execution: The reducer function checks the type of the action and updates the state accordingly, returning a new state.
// 4. State Update: The store updates its state with the new state returned by the reducer.
// 5. Component Update: The component, which is subscribed to the store, automatically receives the updated state and re-renders the view.

// ######################################################################################################
// Another comprehensive example of all the features described so far
// ######################################################################################################

// UNDER CONSTRUCTION

#### Example Scenario

We have a simple application that displays a list of users. We want to fetch this list from an API when the application starts.

// >>>
// >>> Step 1: Define Actions
// >>>

First, we define the actions that represent the events related to fetching users.

```typescript
// user.actions.ts
import { createAction, props } from '@ngrx/store';
import { User } from './user.model';

// Action to initiate the user loading process
export const loadUsers = createAction('[User API] Load Users');

// Action to handle successful user data loading
export const loadUsersSuccess = createAction(
  '[User API] Load Users Success',
  props<{ users: User[] }>()
);

// Action to handle errors during user data loading
export const loadUsersFailure = createAction(
  '[User API] Load Users Failure',
  props<{ error: any }>()
);
```

// >>>
// >>> Step 2: Define the State and Reducer
// >>>

Next, we define the initial state and the reducer that will handle these actions and update the state.

```typescript
// user.reducer.ts
import { createReducer, on } from '@ngrx/store';
import { loadUsers, loadUsersSuccess, loadUsersFailure } from './user.actions';
import { User } from './user.model';

// Define the shape of the user state
export interface UserState {
  users: User[];
  error: any;
}

// Define the initial state
export const initialState: UserState = {
  users: [],
  error: null
};

// Create the reducer function
export const userReducer = createReducer(
  initialState,
  on(loadUsers, state => ({ ...state, users: [], error: null })),
  on(loadUsersSuccess, (state, { users }) => ({ ...state, users })),
  on(loadUsersFailure, (state, { error }) => ({ ...state, error }))
);
```

// >>>
// >>> Step 3: Create the Effect
// >>>

Now, we create an effect to handle the side effect of fetching the users from an API.

```typescript
// user.effects.ts
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { UserService } from './user.service';
import * as UserActions from './user.actions';

@Injectable()
export class UserEffects {

  constructor(
    private actions$: Actions,
    private userService: UserService
  ) {}

  // Define the effect to load users
  loadUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.loadUsers),  // Listen for the 'loadUsers' action
      mergeMap(() =>
        this.userService.getUsers().pipe(  // Call the service to fetch users
          map(users => UserActions.loadUsersSuccess({ users })),  // Dispatch success action
          catchError(error => of(UserActions.loadUsersFailure({ error })))  // Dispatch failure action
        )
      )
    )
  );
}
```

// >>>
// >>> Step 4: Register the Reducer and Effect
// >>>

Register the reducer and effect in the NgRx store module and NgRx effects module.

```typescript
// app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { userReducer } from './user.reducer';
import { UserEffects } from './user.effects';
import { UserService } from './user.service';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    StoreModule.forRoot({ user: userReducer }),  // Register the reducer
    EffectsModule.forRoot([UserEffects])         // Register the effect
  ],
  providers: [UserService],  // Provide the user service
  bootstrap: [AppComponent]
})
export class AppModule {}
```

// >>>
// >>> Step 5: Dispatch Actions from a Component
// >>>

Finally, in your component, you can dispatch the action to load users when the component initializes.

```typescript
// user.component.ts
import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import * as UserActions from './user.actions';
import { Observable } from 'rxjs';
import { UserState } from './user.reducer';
import { User } from './user.model';

@Component({
  selector: 'app-user',
  template: `
    <div *ngIf="users$ | async as users">
      <ul>
        <li *ngFor="let user of users">{{ user.name }}</li>
      </ul>
    </div>
    <div *ngIf="error$ | async as error">
      <p>Error: {{ error }}</p>
    </div>
  `
})
export class UserComponent implements OnInit {
  users$: Observable<User[]>;
  error$: Observable<any>;

  constructor(private store: Store<{ user: UserState }>) {
    this.users$ = this.store.select(state => state.user.users);
    this.error$ = this.store.select(state => state.user.error);
  }

  ngOnInit() {
    this.store.dispatch(UserActions.loadUsers());  // Dispatch the action to load users
  }
}
```

### Explanation of the Example

1. Actions: Defined three actions:
   - `loadUsers`: Dispatched to initiate the user loading process.
   - `loadUsersSuccess`: Dispatched when users are successfully loaded.
   - `loadUsersFailure`: Dispatched if there is an error loading users.

2. State and Reducer: Defined a state for managing users and a reducer to update the state based on the actions.

3. Effect: 
   - `UserEffects` Class: Contains the `loadUsers$` effect, which listens for the `loadUsers` action.
   - `createEffect`: Used to create the effect. It takes a function that returns an observable. This function uses the `actions$` stream (an observable of all actions dispatched in the application) and the `ofType` operator to filter for specific actions.
   - Service Call: Calls `userService.getUsers()` to fetch users.
   - `mergeMap`: Used to switch to a new observable for fetching users and handle the response.
   - Dispatch Success or Failure Actions: Depending on the outcome of the API call, it dispatches either `loadUsersSuccess` or `loadUsersFailure`.

4. Registering Reducer and Effect: Registered both the reducer and effect in the root module (`AppModule`).

5. Component: 
   - Subscribes to the `users` and `error` from the store.
   - Dispatches the `loadUsers` action when the component initializes.

### Summary

Effects in NgRx are used to handle side effects such as asynchronous operations and interactions with external systems or APIs. By isolating side effects, NgRx Effects help keep your application’s state management pure and predictable. The example above demonstrates how to set up an effect to fetch user data, handle success and failure, and dispatch appropriate actions to update the state accordingly.

// ######################################################################################################
// Selectors
// ######################################################################################################

// Selectors allow us to retrieve and derive specific pieces of state from the Store.
// Not extensively used.

import { createSelector, createFeatureSelector } from '@ngrx/store';

export const selectCounter = createFeatureSelector<number>('count');

// If we need more complex derived state, we can use createSelector to combine selectors.



