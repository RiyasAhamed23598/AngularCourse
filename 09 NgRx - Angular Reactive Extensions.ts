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
  CustomerList: ICustomer[]; // list of customers
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
  CustomerList: [],
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
  CustomerList$: Observable<ICustomer[]>;
  contextCustomer$: Observable<ICustomer>;
  private _CustomerList: ICustomer[] = [];
  private _contextCustomer!: ICustomer;
  private _subscription: Subscription = new Subscription();

  // Pay attention that a pointer to the application's Store is injected into the constructor:
  constructor(private _store: Store<{ CustomerList: ICustomer[]; contextCustomer: ICustomer }>) {
    // Populate observables from the Store:
    this.CustomerList$ = this._store.select('CustomerList');
    this.contextCustomer$ = this._store.select('contextCustomer');
    // IMPORTANT!
    // Note that the parameters passed to the select() functions are the State's properties' names as strings.
    // This way data is retrieved from the module's State which is a part of the application's Store.
  }

  ngOnInit(): void {
    this._subscription.add(
      this.CustomerList$.subscribe((customers: ICustomer[]) => { this._CustomerList = customers; })
    );

    this._subscription.add(
      this.contextCustomer$.subscribe((customer: ICustomer) => { this._contextCustomer = customer; })
    );
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }
}

// The _CustomerList and _contextCustomer vars are created for the sake of working with the data in the imperative way, if needed.

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
export const selCustomerListAction = createAction(d.SelCustomerList, props<{ actionLastName: string }>());
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

// The file which declares the class with functions which call the Web Service directly.
// It's "the last station" of data flow within Angular before it's sent to the Web.
// The class is @Injectable since in will be injected into the Reducer (described soon).

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { baseUrl } from 'src/app/common/navigation';
import { Observable } from 'rxjs';
import { ICustomer, IOrder, IProduct } from 'src/models/customer.model';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private readonly _customersUrl = `${baseUrl}/customers`;
  private readonly _ordersUrl = `${baseUrl}/orders`;
  private readonly _productsUrl = `${baseUrl}/products`;

  constructor(private http: HttpClient) {}

  // Customer:

  selCustomerList(lastName: string): Observable<ICustomer[]> {
    return this.http.get<ICustomer[]>(`${this._customersUrl}/list/${lastName}`);
  }

  selCustomer(customerId: number): Observable<ICustomer> {
    return this.http.get<ICustomer>(`${this._customersUrl}/${customerId}`);
  }

  insCustomer(customer: ICustomer): Observable<ICustomer> {
    return this.http.post<ICustomer>(`${this._customersUrl}/ins`, customer)
  }

  updCustomer(customer: ICustomer): Observable<ICustomer> {
    return this.http.put<ICustomer>(`${this._customersUrl}/upd/${customer.customerId}/`, customer);
  }

  delCustomer(customerId: number): Observable<void> {
    return this.http.delete<void>(`${this._customersUrl}/del/${customerId}/`);
  }

  // Order:

  // < ...A SIMILAR FRAGMNENT FOR ORDER FUNCTIONS HERE... >

  // Product:

  // < ...A SIMILAR FRAGMNENT FOR PRODUCT FUNCTIONS HERE... >
}

// ######################################################################################################
// Effect
// ######################################################################################################

// If your application needs to perform side effects like API calls, you would define Effects.
// Side effects are operations that occur outside the context of a pure function, such as making HTTP requests, accessing local storage,
// 		interacting with browser APIs, or performing other asynchronous tasks.

// They are implemented using RxJS Observables and are set up to listen for specific actions dispatched from your store.
// When an effect "hears" the subscribed action, it performs some side effect and then dispatches a new action to update the state in the store.

// Effects allow you to describe asynchronous behavior in a declarative way.
// As an example of an asynchronous operation, you could use an effect that listens for specific actions and performs an HTTP request.

// NgRx Effects allow you to isolate side effects from components and reducers, keeping your state management pure, predictable and easy to test.

// You can easily compose effects with other Observables, enabling complex asynchronous operations to be expressed in a readable manner.

// Let's use the previous example with increment, decrement, and reset actions to demonstrate how Effects can be used to handle side effects.
// We will create an Effect only for increment (the others would be similar).
// Let's assume that the increment action should trigger an asynchronous operation, such as logging the increment action to a server.
// We want to perform a side effect every time the counter is incremented, such as logging this action to an external service.

import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { CustomerService } from '../services/customer.service';
import { ICustomer, IOrder, IProduct } from 'src/models/customer.model';
import {
  // Customer:
  selCustomerListAction,
  selCustomerListSuccessAction,
  selCustomerAction,
  selCustomerSuccessAction,
  insCustomerAction,
  insCustomerSuccessAction,
  updCustomerAction,
  updCustomerSuccessAction,
  delCustomerAction,
  delCustomerSuccessAction,
  // Order:
  // < ...ORDER ACTIONS HERE... >
  // Product:
  // < ...PRODUCT ACTIONS HERE... >
} from '../actions/customer.action';
import { switchMap, map, catchError } from 'rxjs/operators';
import { EMPTY } from 'rxjs';

@Injectable()
export class CustomerEffect {
  constructor(private _actions$: Actions, private _svc: CustomerService) {}

  // Customer:

  // createEffect() is an NgRx function used to define and register effects.
  // It accepts a factory function that returns an Observable, defining the logic for handling side effects based on Actions,
  //    and returns EffectConfig - an Observable managed by NgRx that triggers side effects and optionally dispatches Actions.
  selCustomerList$ = createEffect(() =>
    this._actions$.pipe(
      // ofType() is an NgRx operator that allows only Actions with specific types to pass through.
      // It filters the Observable stream to listen specifically for the Action it handles.
      // This means the subsequent operators in the pipe will only run when the apropriate Action is dispatched.
      ofType(selCustomerListAction),
      switchMap((action) => {
        // The passed function calls the respective WEB Service function passing to it the input data, according to the Action's props:
        return this._svc.selCustomerList(action.actionLastName).pipe(
          // If no errors, dispatch the counterpart Success Action passing to it the WEB Service function's output, according to the Success Action's props:
          map((customerList: ICustomer[]) => selCustomerListSuccessAction({ actionCustomerList: customerList })),
          catchError(() => EMPTY),
        );
      }),
    ),
  );

  selCustomer$ = createEffect(() =>
    this._actions$.pipe(
      ofType(selCustomerAction),
      switchMap((action) => {
        return this._svc.selCustomer(action.actionCustomerId).pipe(
          map((customer: ICustomer) => selCustomerSuccessAction({ actionCustomer: customer })),
          catchError(() => EMPTY),
        );
      }),
    ),
  );

  insCustomer$ = createEffect(() =>
    this._actions$.pipe(
      ofType(insCustomerAction),
      switchMap((action) => {
        return this._svc.insCustomer(action.actionCustomer).pipe(
          map((customer: ICustomer) => insCustomerSuccessAction({ actionCustomer: customer })),
          catchError(() => EMPTY),
        );
      }),
    ),
  );

  updCustomer$ = createEffect(() =>
    this._actions$.pipe(
      ofType(updCustomerAction),
      switchMap((action) => {
        return this._svc.updCustomer(action.actionCustomer).pipe(
          map((customer: ICustomer) => updCustomerSuccessAction({ actionCustomer: customer })),
          catchError(() => EMPTY),
        );
      }),
    ),
  );

  delCustomer$ = createEffect(() =>
    this._actions$.pipe(
      ofType(delCustomerAction),
      switchMap((action) => {
        return this._svc.delCustomer(action.actionCustomerId).pipe(
          map(() => delCustomerSuccessAction( { actionCustomerId: action.actionCustomerId })),
          catchError(() => EMPTY),
        );
     }),
    ),
  );

  // Order:

  // < ...A SIMILAR FRAGMNENT FOR ORDER ACTIONS HERE... >

  // Product:

  // < ...A SIMILAR FRAGMNENT FOR PRODUCT ACTIONS HERE... >

}

// Notice that all the Observables (such as selCustomerList$) are declared public since they must be accessed from outside by:
// Automatic Subscription:
//    NgRx Effects uses Angular's dependency injection system to manage and subscribe to effects automatically.
//    For this to work, NgRx needs to have access to all the effect properties defined within the class.
// Detection:
//    NgRx detects effects by looking for properties that are initialized using the createEffect function.
//    These properties must be publicly accessible to be detected and managed by NgRx.

// ######################################################################################################
// Reducer
// ######################################################################################################

// Reducers are responsible for handling transitions from one state to the next state in your application.
// Reducer functions handle these transitions by determining which actions to handle based on the action's type.

// Reducers take two arguments:
// 1. The current state
// 2. The latest Action dispatched
// They then determine whether to return a newly modified state (based on the action type and payload), or the original state.
// Reducers are responsible for updating the state in an immutable way, returning a new state object without mutating the existing state.

// Let's go through an example to understand how reducers work in NgRx.

// Now we create the reducer function that will handle the state transitions based on the actions dispatched:

// UNDER CONSTRUCTION

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

