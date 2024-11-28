// https://ngrx.io/

// ######################################################################################################
// What is NgRx?
// ######################################################################################################

// NgRx (Angular Reactive Extensions) is a framework for building reactive applications in Angular.
// It is a state management library that implements the Redux pattern using RxJS (Reactive Extensions for JavaScript)
//    to manage the application state in a reactive and predictable way.
// NgRx provides a set of libraries for managing the global state, side effects, and entity collections, among other functionalities.
// It's particularly useful in large-scale applications where managing state in an efficient, predictable, centralized, scalable and maintainable way is critical.

// CONTENTS:

// * Model
// * State
// * Store
// * Action
// * Service
// * Effect
// * Reducer
// * Selector

// ######################################################################################################
// * Model
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
// * State
// ######################################################################################################

// State refers to an object that holds all the data of a module (normally, a screen with many related data objects) at a specific point in time.

// As an example, let's consider a screen (module) with the following structure
// (it doesn't seems realistic but demonstrates easy management of complex screens using obvious entities):
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
  private _subscription: Subscription = new Subscription();

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

// If another component of the module will need to get, for example, the contexts customer, it will do the same:
this.contextCustomer$ = this._store.select('contextCustomer');
// That eliminates the need to pass that customer from the parent component's template as a the other component's input field.
// If any component changes contextCustomer property of the module's State, all the subscribing components are immediately aware of that.
// So, for example, their templates are automatically re-rendered to reflect the change. Reactive programming is magic!

// ######################################################################################################
// * Action
// ######################################################################################################

// Actions are dispatched from components or services to express events or intentions (usually, data manipulations, or changes in the application’s state).
// An Action is dispatched (launched) in one part of the application and captured in others, providing an easy global communication channel.
// NgRx automatically manages the chain of fired events when an Action is dispatched, ensuring the appropriate consumers respond to it seamlessly.
// Actions are one of the main building blocks in NgRx.

// Each action is a plain TypeScript object with a `type` property that describes a unique event, and an optional `payload` (additional data required for the action).

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

// IMPORTANT! The first parameter to createAction() must be unique across the entire application.
// This string serves as a unique identifier for each action, and having duplicate action types can lead to unintended consequences.
// For example, you have two modules - let's name them A and B. Each module has its own "Cleanup Before Destroy" Action.
// Declare in the Actions file of one module:
export const cleanupBeforeDestroyAction = createAction('[Module A] Cleanup Before Destroy');
// Declare in the Actions file of the other module:
export const cleanupBeforeDestroyAction = createAction('[Module B] Cleanup Before Destroy');
// The contants names are the same since they are in different files, but the descriptions, seen on the app level, are different from each other, so all is good.

// Hypothetically, different modules could have a same description, which would break the uniqueness.
// To be 100% safe, use the Action file name (without the .ts) as the module identifier in the square brackets.

// @@@ The 2nd parameter (optional) to createAction():

// Describes the payload (additional data) expected by the Action. That data must be provided when the Action is dispatched.
// The argument prevents sending wrong data, i.e. inforces strong typing.

// The payload is sent to createAction() as the 2nd parameter via the props<T>() function, for example:
import { createAction, props } from '@ngrx/store';
export const insTodoAction = createAction('[Todo List] Insert Todo', props<{ todoText: string }>());

// props<T>() takes a generic type parameter, which is the shape of the payload for compile-time type checking to ensure correct payload structure.
// In the example above, the props() defines that the action should carry a payload with a property `todoText` of type `string`:
this._store.dispatch(insTodoAction({ todoText: 'Learn NgRx' })); // correct!
// The next call will cause a compilation-time error:
this._store.dispatch(insTodoAction({ text: 'Learn NgRx' })); // doesn't match the required shape - 'text' is not defined in the props

// Note that the dispatch() method belongs to the Store singleton - that illustrates the application-wide scope of Actions.
// Usually, Action files are grouped in a folder under the app's Store folder, like src/app/Store/actions/.

// The next example describes the Action file which could exist for the Customer screen we used earlier.
// A dedicated Action is defined for each relevant CRUD operation of each component of the module.

// If the Action was executed sucsessfully, then its Success counterpart Action is dispatched by the Effect (Effects will be described later).
// For example, if delCustomerAction has deleted the requested customer, the Effect dispatches delCustomerSuccessAction.

// The props of the regular (non-Success) CRUD Actions describe Service input. These Actions accept data to be sent to the Service as parameters.

// But the props of the Success CRUD Actions describe Service output. These Actions accept data, returned by the Service (i.e., usually retrieved from the DB).
// For example:
// * selCustomerListSuccessAction accepts the retrieved customers list (the Reducer will populate the State's customers array with it).
// * insCustomerSuccessAction accepts the inserted customer with the customerId just generated by the DB
//      (the Reducer will update the contextCustomer with it).
// * updCustomerSuccessAction accepts the updated customer (in the real app, it could have some fields, generated by the DB, such as updateTime and
//      updatedBy, or some calculated statistics, so the Reducer would update the contextCustomer with the new values).
// * delCustomerSuccessAction accepts the customerId of the deleted customer (the Reducer will remove it from the State's customers array).
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

// Note that the names of the properties passed to the props() methods follow the "actionXxx" naming convention.
// That will be helpful when the data is provided on dispatch ("actionCustomerId = customerId" is more clear than "customerId = customerId").

// There are a few rules to writing good actions within your application:
// * Upfront - write actions before developing features to understand and gain a shared knowledge of the feature being implemented.
// * Divide - categorize actions based on the event source.
// * Many - actions are inexpensive to write, so the more actions you write, the better you express flows in your application.
// * Event-Driven - capture events not commands as you are separating the description of an event and the handling of that event.

// ######################################################################################################
// * Service
// ######################################################################################################

// The file which declares the class with functions which call the Web Service directly.
// It's "the last station" of data flow within Angular before it's sent to the Web.
// The class is @Injectable since in will be injected into the Effect (described next).

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

  // < ...A SIMILAR FRAGMNENT FOR ORDER FUNCTIONS HERE... >

  // Product:

  // < ...A SIMILAR FRAGMNENT FOR PRODUCT FUNCTIONS HERE... >
}

// ######################################################################################################
// * Effect
// ######################################################################################################

// If your application needs to perform side effects, you would define Effects.
// Side effects are operations that occur outside the context of Angular, such as external/browser APIs calls, HTTP requests or accessing local storage.

// Effects are implemented using RxJS Observables and are set up to listen for specific Actions and perform side effects without affecting the Store directly.
// Once the side effect is successfully completed, Effects usually dispatch new Actions ("Success" Actions) to update the Store with the side effect results.
// That allows you to isolate side effects from components and reducers, keeping your state management pure, predictable and easy to test.

// Let's use the Customer screen to demonstrate how Effects can be used to handle side effects:

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
// * Reducer
// ######################################################################################################

// Reducers are pure functions which define how the State of your module changes in response to Actions.
// They listen for Actions and modify the State based on the current State and the Action dispatched.
// They do that in an immutable way, creating a new State object and discaring the old one.

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

// Reducers take two arguments - the current State and the latest Action dispatched:
export function customerReducer(state: ICustomerState | undefined, action: Action): ICustomerState {
  return reducerFunc(state, action);
}

// If the Action is handled in the reducer function, the new State replaces the exisitng one, otherwise the exisitng State remains untouched:
const reducerFunc = createReducer(
  initialCustomerState,

  // Customer:

  on(setContextCustomerAction, (state: ICustomerState, { actionCustomer: newContextCustomer }) => ({
    ...state, // copy all the properties of the old State to the new State...
    contextCustomer: newContextCustomer // ...except of contextCustomer which gets a new value
  })),

  on(selCustomerListSuccessAction, (state: ICustomerState, { actionCustomerList: selectedCustomerList }) => ({
    ...state,
    customerList: selectedCustomerList
  })),

  on(selCustomerSuccessAction, (state: ICustomerState, { actionCustomer: selectedCustomer }) => ({
    ...state,
    contextCustomer: selectedCustomer
  })),

  on(insCustomerSuccessAction, (state: ICustomerState, { actionCustomer: insertedCustomer }) => ({
    ...state,
    contextCustomer: insertedCustomer,
    // Also, add the inserted customer to the customers list:
    customerList: [...state.customerList, insertedCustomer]
  })),

  on(updCustomerSuccessAction, (state: ICustomerState, { actionCustomer: updatedCustomer }) => ({
    ...state,
    contextCustomer: updatedCustomer,
    // Also, copy the update to the entry of this customer in the customers list:
    customerList: state.customerList.map(
      (customerInList: ICustomer) => customerInList.customerId === updatedCustomer.customerId ? updatedCustomer : customerInList
    )
  })),

  on(delCustomerSuccessAction, (state: ICustomerState, { actionCustomerId: deletedCustomerId }) => ({
    ...state,
    contextCustomer: null,
    // Also, remove the deleted customer from the customers list:
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
// * Selector
// ######################################################################################################

// Selectors are pure functions that extract and derive slices of state from the Store.
// They are used to retrieve specific pieces of state or computed properties from the Store.
// Selectors can be combined to create more complex selectors.

// UNDER CONSTRUCTION