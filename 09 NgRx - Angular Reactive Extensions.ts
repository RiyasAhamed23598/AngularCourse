// https://ngrx.io/

// ######################################################################################################
// What is NgRx?
// ######################################################################################################

// NgRx (Angular Reactive Extensions) is a framework for building reactive applications in Angular.
// It is a state management library that implements the Redux pattern using RxJS (Reactive Extensions for JavaScript)
//    to manage the application state in a reactive and predictable way.
// NgRx provides a set of libraries for managing the global state, side effects, and entity collections, among other functionalities.
// It's particularly useful in large-scale applications where managing state in an efficient, predictable, centralized, scalable and maintainable way is critical.

// CONTENTS (to jump to a section, copy it with the asterisk, like "* Reducer", and Ctrl+F by it):

// * Model
// * State
// * Store
// * Action
// * Service
// * Effect
// * Reducer
// * The Action's life cycle
// * Selector

// ######################################################################################################
// * Model
// ######################################################################################################

// The Model file declares the data types which represent the module's entities, ensuring strong typing.
// These types define the data structures that will be managed by the NgRx State (will be described soon). Example:

export interface ICustomer {
  customerId: number;
  firstName: string;
  lastName: string;
  orders: IOrder[];
  updatedBy string;
  updatedAt Date;
}

export interface IOrder {
  orderId: number;
  orderDate: Date;
  products: IProduct[];
  updatedBy string;
  updatedAt Date;
}

export interface IProduct {
  productId: number;
  productName: string;
  price: number;
  quantity: number; // quantity of the product in the order
  updatedBy string;
  updatedAt Date;
}

// ######################################################################################################
// * State
// ######################################################################################################

// State refers to a singleton object that holds all the data of a module (normally, a screen with many related data objects) as it is at the current moment (i.e. the current state of the module)

// As an example, let's consider a screen (module) with the following structure
// (it doesn't seems realistic but uses obvious entities to demonstrate easy management of complex screens):
// * The screen (CustomerScreenComponent) shows a list of customers (CustomerListComponent).
//      There is a Last Name input field by which the list is restricted (only customers whose last name contains the entered value are retrieved).
// * When the user highlights a customer, the screen displays the details form for that customer (CustomerComponent) and a list of the customer's orders (OrderListComponent).
// * When the user highlights an order, the screen displays the details form for that order (OrderComponent) and a list of the order's products (ProductListComponent).
// * When the user double-clicks a product, a details form dialog pops up (ProductComponent).
// Each entity has the CRUD functionality.

// Here is the State datatype which holds the entire screen's data:

import { ICustomer, IOrder, IProduct } from 'src/models/customer.model';

export interface ICustomerState {
  customerList: ICustomer[]; // list of customers
  customerListLoaded: boolean; // when false, display a progress bar in place of the data fields

  contextCustomer: ICustomer | null; // details form of the currently selected customer
  contextCustomerLoaded: boolean;

  orderList: IOrder[]; // list of orders of the currently selected customer
  orderListLoaded: boolean;

  contextOrder: IOrder | null; // details form of the currently selected order
  contextOrderLoaded: boolean;

  productList: IProduct[]; // list of products of the currently selected order
  productListLoaded: boolean;

  contextProduct: IProduct | null; // details form dialog for the double-clicked product
  contextProductLoaded: boolean;
}

// State:
// * Centralizes data management providing a single source of truth for the module's data.
// * Ensures that all parts of the module are synchronized with the same version of the data.
// * Simplifies communication between components by avoiding direct data sharing and, worse, multiple copies of the same data.
// * Ensures that growing amounts of data are handled efficiently and predictably.

// In NgRx, State is immutable, meaning it cannot be directly modified.
// Instead, a new State is created whenever changes occur, ensuring predictability and enabling time-travel debugging.
// Eeach change creates a new snapshot, preventing accidental modifications and ensuring reliable debugging.

// The same State file must also creates the Initial State object of the declared type, with all the properties populated with default values:

export const initialCustomerState: ICustomerState = {
  customerList: [],
  customerListLoaded: false,
  contextCustomer: null,
  contextCustomerLoaded: false,
  orderList: [],
  orderListLoaded: false,
  contextOrder: null,
  contextOrderLoaded: false,
  productList: [],
  productListLoaded: false,
  contextProduct: null,
  contextProductLoaded: false
};

// The Initial State is crucial since it:
// * Provides a clear and consistent starting point for the module's State.
// * Ensures that the state is always defined, even before any data is retrieved.

// ######################################################################################################
// * Store
// ######################################################################################################

// While State is a module-level data container, Store is an application-level data container.
// The Store instance is a singleton object that holds the States of multiple modules combined, which makes up the state of the whole application.

// The Store is the single source of truth for the current state of the application.
// It provides a way to access the state, dispatch actions, and subscribe to state changes.
// You can think of it as a database that you can get access to in order to retrieve or update the data that the application operates on
// The Store is an observable, and components can subscribe to it to get updates when the state changes.

// The Store is a state-management solution inspired by the famous library Redux.
// Redux popularized the idea of organizing the application state into simple objects (use primitive and non-primitive types
// 		 in JavaScript) and updating this state by replacing it with a new state.
// This means that the object shouldn’t be mutated directly, but rather should be replaced with a new object.

// A module usually consists of a few components for different areas of the screen.
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
  private _s: Subscription = new Subscription();

  // Pay attention that a pointer to the application's Store is injected into the constructor:
  constructor(private _store: Store<any>) { }

  ngOnInit(): void {
    // Populate the observables from the Store:
    this.customerList$ = this._store.select('customerList');
    this.contextCustomer$ = this._store.select('contextCustomer');
    // IMPORTANT!
    // Note that the parameters passed to the select() functions are the State's properties' names as strings.
    // In fact, the data is retrieved from the module's State which is a part of the application's Store.

    // Populate the regular vars from the observables (to work with the data in the imperative way, if needed):
    this._s.add(
      this.customerList$.subscribe((customers: ICustomer[]) => { this._customerList = customers; })
    );
    this._s.add(
      this.contextCustomer$.subscribe((customer: ICustomer) => { this._contextCustomer = customer; })
    );
  }

  ngOnDestroy = () => this._s.unsubscribe;
}

// If another component of the module will need to get, for example, the contexts customer, it will do the same:
this.contextCustomer$ = this._store.select('contextCustomer');
// That eliminates the need to pass that customer from the parent component's template as a the other component's input field.
// If any component changes contextCustomer property of the module's State, all the subscribing components are immediately aware of that.
// So, for example, their templates are automatically re-rendered to reflect the change. Reactive programming is magic!

// ######################################################################################################
// * Action
// ######################################################################################################

// Action is a plain TypeScript object used to express an intention (usually, a data manipulation, or a change in the application’s state).
// Actions are dispatched from components or services to express events or intentions (usually, data manipulations, or changes in the application’s state).
// An Action is dispatched (launched) in one part of the application and captured in others, providing an easy global communication channel.
// NgRx automatically manages the chain of fired events when an Action is dispatched, ensuring the appropriate consumers respond to it seamlessly.
// Actions are one of the main building blocks in NgRx.

// An Action object has two properties:
//   * type - a textual description of the intention.
//   * payload (optional) - additional data required for the action (like retrieval parameters) - to enforce type safety when the Action is dispatched.

// An Action is created and returned by the createAction() factory function which accepts type and payload as its parameters.
// The next example defines a few simple Actions. No payload, so only type is passed to createAction().
// The good practice is to add the word "Action" to the names of Action objects:
import { createAction } from '@ngrx/store';
export const incrementAction = createAction('[Counter] Increment');
export const decrementAction = createAction('[Counter] Decrement');
export const resetAction = createAction('[Counter] Reset');

// @@@ Action TYPE - the 1st parameter to createAction():

// Must be unique across the entire application since it serves as a unique identifier for each Action.
// Having duplicate action types can lead to unintended consequences.

// Conventionally, the Action type's structure is:
"[Module] Description"
// "[Module]" (within square brackets) indicates the feature module where the action is used. For application-wide Actions, use [App].
// "Description" reflects the specific event that is fired.
// That allows different Modules to have Actions with a same Description.

// For example, we have two modules - Customer and Order. Each module has its own "Cleanup" Action.
// Declare in the Actions file of the Customer module:
export const cleanupAction = createAction('[Customer] Cleanup');
// Declare in the Actions file of the Order module:
export const cleanupAction = createAction('[Order] Cleanup');
// The constants names can be the same since they are in different scopes, but the descriptions, consumed on the app level, are different from each other, so all is good.

// Hypothetically, different modules could have a same description, which would break the uniqueness.
// To be 100% safe, use the Action file name (without the .ts) as the module identifier in the square brackets.

// @@@ Action PAYLOAD - the 2nd parameter (optional) to createAction():

// Describes the payload (additional data) expected by the Action. That data must be provided when the Action is dispatched.
// The argument prevents sending wrong data to the Action, i.e. inforces strong typing.

// The payload is sent to createAction() as the 2nd parameter via the props<T>() function, for example:
import { createAction, props } from '@ngrx/store';
export const insTodoAction = createAction('[Todo List] Insert', props<{ todoText: string }>());

// props<T>() takes a generic type parameter, which is the data type of the payload for compile-time type checking to ensure correct payload structure.
// In the example above, the props() defines that the action should carry a payload with a property `todoText` of type `string`, so a correct dispatch looks like this:
this._store.dispatch(insTodoAction({ todoText: 'Learn NgRx' }));
// The next call will cause a compilation-time error:
this._store.dispatch(insTodoAction({ text: 'Learn NgRx' })); // doesn't match the required data type - 'text' is not defined in the props

// Note that the dispatch() method belongs to the Store singleton - that illustrates the application-wide scope of Actions.
// Usually, Action files of different modules are grouped together in a folder under the app's Store folder, like src/app/Store/actions/.

// The next example describes the Action file which could exist for the Customer screen we used earlier.
// Firstly, the file declares a private enum each constant of which will be used as the type of an Action.

// Note that:
//   * Each CRUD operation of each entity has its dedicated Action.
//   * Each main CRUD Action has its own ...Success action. The Success action is dispatched if its main Action was executed successfully.

import { createAction } from '@ngrx/store';
import { ICustomer, IOrder, IProduct } from 'src/models/customer.model';

const m = '[customer.action]'; // m = Module; supposing the Action file name is "customer.action.ts".
const c = 'Customer';
const o = 'Order';
const p = 'Product';

enum d { // the Actions' "d"escriptions
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

// Then, the Action file declares the Action objects themselves.
// In most enterprise applications, dispatching an Action calls a function of a Web Service, so our example reflects that.
// The props parameter to the createAction() function describes the Action’s payload:
//   * The payload of a regular (non-Success) CRUD Action fits the input of the Web Service function the Action calls.
//   * The payload of a Success CRUD Action fits the output of the same Web Service function, which will become the input of the Success Action.

// Customer:
export const setContextCustomerAction = createAction(d.SetContextCustomer, props<{ actionCustomer: ICustomer | null }>());
export const selCustomerListAction = createAction(d.SelCustomerList, props<{ actionLastName: string }>()); // grab customers whose last name contains actionLastName
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
export const selOrderListAction = createAction(d.SelOrderList, props<{ actionCustomerId: number }>()); // grab orders of this customer
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
export const selProductListAction = createAction(d.SelProductList, props<{ actionOrderId: number }>()); // grab products of this order
export const selProductListSuccessAction = createAction(d.SelProductListSuccess, props<{ actionProductList: IProduct[] }>());
export const selProductAction = createAction(d.SelProduct, props<{ actionProductId: number }>());
export const selProductSuccessAction = createAction(d.SelProductSuccess, props<{ actionProduct: IProduct }>());
export const insProductAction = createAction(d.InsProduct, props<{ actionProduct: IProduct }>());
export const insProductSuccessAction = createAction(d.InsProductSuccess, props<{ actionProduct: IProduct }>());
export const updProductAction = createAction(d.UpdProduct, props<{ actionProduct: IProduct }>());
export const updProductSuccessAction = createAction(d.UpdProductSuccess, props<{ actionProduct: IProduct }>());
export const delProductAction = createAction(d.DelProduct, props<{ actionOrderId: number, actionProductId: number }>()); // delete the product from the order
export const delProductSuccessAction = createAction(d.DelProductSuccess, props<{ actionProductId: number }>());

// === END OF THE Action FILE ===

// Here are sample lines in the CustomerComponent which dispatch some Actions (of course, they would be in different parts of the component class):
this._store.dispatch(selCustomerListAction({ actionLastName: this._lastName }));
this._store.dispatch(selCustomerAction({ actionCustomerId: highlightedCustomerId })); // highlightedCustomerId is a param of delCustomer() function called from the template
this._store.dispatch(insCustomerAction({ actionCustomer: this._contextCustomer }));
this._store.dispatch(updCustomerAction({ actionCustomer: this._contextCustomer }));
this._store.dispatch(delCustomerAction({ actionCustomerId: this._contextCustomer.customerId }));

// There are a few rules to writing good actions within your application:
// * Upfront - write actions before developing features to understand and gain a shared knowledge of the feature being implemented.
// * Divide - categorize actions based on the event source.
// * Many - actions are inexpensive to write, so the more actions you write, the better you express flows in your application.
// * Event-Driven - capture events not commands as you are separating the description of an event and the handling of that event.

// ######################################################################################################
// * Service
// ######################################################################################################

// The class which calls the Web Service directly.
// It's "the last station" of data flow within Angular before it's sent to the Middle tier.
// The class name says just "Service" for shortness, but keep in mind that "Web Service" is meant.
// Strictly speacking, this class is not a part of the NgRx library, but it usually exists in apps which call a Web Service.
// It will be injected into the Side Effect class (described next), that's why it has the @Injectable decorator:

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
    return this.http.get<ICustomer[]>(this._customersUrl, lastName);
  }

  selCustomer(customerId: number): Observable<ICustomer> {
    return this.http.get<ICustomer>(`${this._customersUrl}/${customerId}`, customerId);
  }

  insCustomer(customer: ICustomer): Observable<ICustomer> {
    return this.http.post<ICustomer>(`${this._customersUrl}/ins`, customer)
  }

  updCustomer(customer: ICustomer): Observable<ICustomer> {
    return this.http.put<ICustomer>(`${this._customersUrl}/upd`, customer);
  }

  delCustomer(customerId: number): Observable<void> {
    return this.http.delete<void>(`${this._customersUrl}/del`, customerId);
  }

  // Order:

  // < ... A SIMILAR FRAGMNENT FOR ORDER FUNCTIONS HERE, USING this._ordersUrl ... >

  // Product:

  // < ... A SIMILAR FRAGMNENT FOR PRODUCT FUNCTIONS HERE, USING this._productsUrl ... >
}

// ######################################################################################################
// * Effect
// ######################################################################################################

// Side effects are operations that occur outside the context of Angular, such as external APIs calls, HTTP requests or accessing local storage.
// If your application needs to perform a side effect, you will define an Effect class.

// Effects are implemented using RxJS Observables and are set up to listen for specific Actions and perform side effects without affecting the Store directly.
// The Effect class captures a dispatched main Action and calls the corresponding function of the Web Service class.
// Also, the Effect is "the first station" within Angular to process data returned from the Middle tier.
// Once a side effect is successfully completed, the Effect object usually dispatches a new Action ("Success" Action) to update the Store with the results returned from outside.

// Let's use the Customer screen to demonstrate how Effects can be used to handle side effects.
// The class name says just "Effect" for shortness, but keep in mind that "Side Effect" is meant:

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
} from 'src/app/Store/actions/customer.action';
import { switchMap, map, catchError } from 'rxjs/operators';
import { EMPTY } from 'rxjs';

@Injectable()
export class CustomerEffect {
  constructor(private _actions$: Actions, private _svc: CustomerService) {}

  // Customer:

  // createEffect() is an NgRx function used to define and register effects.
  // It accepts a factory function that returns an Observable, defining the logic for handling side effects based on Actions,
  //    and returns EffectConfig - an Observable managed by NgRx that triggers side effects and optionally dispatches Actions:
  selCustomerList$ = createEffect(() =>
    this._actions$.pipe(
      // ofType() is an NgRx operator that allows only Actions with specific types to pass through.
      // It filters the Observable stream to listen specifically for the Action it handles.
      // This means the subsequent operators in the pipe will only run when the apropriate Action is dispatched.
      ofType(selCustomerListAction),
      switchMap((action) => {
        // The passed function calls the respective Web Service function passing to it the input data:
        return this._svc.selCustomerList(action.actionLastName).pipe(
          // If no errors, dispatch the counterpart Success Action passing to it the Web Service function's output:
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

// ######################################################################################################
// * Reducer
// ######################################################################################################

// Reducer is a pure function which defines how the State of your module changes in response to Actions.
// It listens for dispatched Actions; when an Action, requiring handling, is captured, the Reducer modifies the State based on the current State and the Action's data.
// That is done in an immutable way, creating a new State object. Angular discards the old State object, replacing it with the new one.

// The mission of the Reducer is critical – it’s responsible for updating the State with the results of the Web Service calls when a ...Success Action is dispatched by the Effect.

// Also, you can create and dispatch an Action which updates the State without calling side effects - like those without "Success" in the example below.
// That is the correct way, we don’t update the State in other spots of the application. Instead, these spots dispatch Actions which signal the Reducer to change the State.
// Reducer is one centralized file with all State updates for the given module, that significantly simplifies debugging.

// Here is an example Reducer file for our Customer module:

import { Action, createReducer, on } from '@ngrx/store';
import * as _ from 'lodash';
import { ICustomerState, initialCustomerState } from '../states/customer.state';
import { ICustomer, IOrder, IProduct } from 'src/models/customer.model';
import {
  // Customer:
  setContextCustomerAction,
  selCustomerListAction,
  selCustomerListSuccessAction,
  selCustomerSuccessAction,
  insCustomerSuccessAction,
  updCustomerSuccessAction,
  delCustomerSuccessAction,
  // Order:
  // < ...ORDER ACTIONS HERE... >
  // Product:
  // < ...PRODUCT ACTIONS HERE... >
} from 'src/app/Store/actions/customer.action';

// A Reducer function takes two arguments - the current State and the latest Action dispatched - and returns a new State:
export function customerReducer(oldState: ICustomerState | undefined, action: Action): ICustomerState {
  return getNewState(oldState, action);
}

// If the Action is handled in the reducer function, the new State replaces the exisitng one, otherwise the exisitng State remains untouched:
const getNewState = createReducer(
  initialCustomerState,

  // Customer:

  on(setContextCustomerAction, (state: ICustomerState, { actionCustomer: newContextCustomer }) => ({
    ...state, // copy all the properties of the old State to the new State unchanged...
    contextCustomer: newContextCustomer // ...except of contextCustomer which gets a new value
  })),

  on(selCustomerListAction, (state: ICustomerState) => ({
    ...state,
   customerListLoaded: false // the retrieval has started, so display the progress bar
  })),

  on(selCustomerListSuccessAction, (state: ICustomerState, { actionCustomerList: selectedCustomerList }) => ({
    ...state,
    customerList: selectedCustomerList,
    customerListLoaded: true // the retrieval has finished, so hide the progress bar
  })),
  
  on(selCustomerAction, (state: ICustomerState) => ({
    ...state,
    customerLoaded: false // the retrieval has started, so display the progress bar
  })),

  on(selCustomerSuccessAction, (state: ICustomerState, { actionCustomer: selectedCustomer }) => ({
    ...state,
    contextCustomer: selectedCustomer,
    customerLoaded: true // the retrieval has finished, so hide the progress bar
  })),

  on(insCustomerSuccessAction, (state: ICustomerState, { actionCustomer: insertedCustomer }) => ({
    ...state,
    // Refresh the context Customer to populate the DB-generated fields - customerId, updatedBy & updatedAt:
    contextCustomer: insertedCustomer,
    // Also, add the INSERTed Table to the Customers List:
    customerList: [...state.customerList, insertedCustomer]
  })),

  on(updCustomerSuccessAction, (state: ICustomerState, { actionCustomer: updatedCustomer }) => ({
    ...state,
    // Refresh the context Customer to populate the DB-generated fields - updatedBy & updatedAt:
    contextCustomer: updatedCustomer,
    // Also, refresh the UPDATEd Customer in the Customers List:
    customerList: state.customerList.map(
      (customerInList: ICustomer) => customerInList.customerId === updatedCustomer.customerId ? updatedCustomer : customerInList
    )
  })),

  on(delCustomerSuccessAction, (state: ICustomerState, { actionCustomerId: deletedCustomerId }) => ({
    ...state,
    // Dispose of the DELETEd Customer:
    contextCustomer: null,
    // Also, remove the DELETEd Customer from the Customers List:
    customerList: state.customerList.filter(
      (customerInList: ICustomer) => customerInList.customerId !== deletedCustomerId
    )
  })),

  // Order:

  // < ...A SIMILAR FRAGMNENT FOR ORDER ACTIONS HERE... >

  // Product:

  // < ...A SIMILAR FRAGMNENT FOR PRODUCT ACTIONS HERE... >
);

// The spread operator (...state) only does shallow copying and does not handle deeply nested objects.
// You need to copy each level in the object to ensure immutability.
// There are libraries that handle deep copying including lodash and immer.


// ######################################################################################################
// * The Action's life cycle
// ######################################################################################################

// Let's briefly summarize the life cycle stages that an Action goes through:

// 1. The component dispatches a regular (not Success) Action.
// 2. The Reducer captures it (if a handler exists) and updates the State with the requested changed.
// 3. The Effect captures it (if a handler exists) and calls the corresponding function of the Service, passing the payload as an input.
// 4. The Service sends an HTTP request to the Web Service and is waiting for its result.
// 5. When an HTTP response is received, Angular passes its output to the waiting Effect.
// 6. If the call was successful, the Effect dispatches the respective Success Action, passing the results returned by the Web Service.
// 7. The Reducer captures it and updates the State with those results.

// ######################################################################################################
// * Selector
// ######################################################################################################

// Selectors are pure functions that extract and derive slices of state from the Store.
// They are used to retrieve specific pieces of state or computed properties from the Store.
// Selectors can be combined to create more complex selectors.

// UNDER CONSTRUCTION