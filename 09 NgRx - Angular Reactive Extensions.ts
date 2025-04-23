// https://ngrx.io/

// ######################################################################################################
// What is NgRx?
// ######################################################################################################

// NgRx (Angular Reactive Extensions) is a framework for building reactive applications in Angular.
// It is a state management library that implements the Redux pattern using RxJS (Reactive Extensions for JavaScript)
//    to manage the application state in a reactive and predictable way.
// NgRx provides a set of libraries for managing the global state, side effects, and entity collections, among other functionalities.
// It's particularly useful in large-scale applications where managing state in an efficient, predictable, centralized, scalable and maintainable way is critical.

// CONTENTS (to jump to a section, copy it with the asterisk, like "* Reducer" -> Ctrl+F -> Ctrl+V):

// * Model
// * State
// * Store
// * Action
// * Service
// * Effect
// * Reducer
// * The Action's life cycle

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

// State refers to a singleton object that holds all the data of a module (normally, a screen) as it is at the current moment (i.e. the current state of the module).

// A module usually consists of a few components:
// - The parent, module-level component - the highest-level container.
//      Its HTML template defines the general outline of the window, as well as where each component is located using tags with the components' selectors.
// - Components for different areas of the screen. They are child components of the module-level component.

// As an example, let's consider a Customer screen (module). It's unrealistic, but convenient for explaining the concept.
// CustomerScreenComponent is the highest-level container. It has the following visual structure:
// * On the left side - a narrow vertical panel which is displayed always. It includes:
//    ** A customer search widget (CustomerSearchComponent) with input fields to search by, and a Search button.
//    ** A list of customers (CustomerListComponent) found by the entered search criteria.
// * When the user selects a customer in the list, the main part of the screen displays info for the selected customer:
//      ** The customer details form (CustomerComponent).
//      ** A list of the customer's orders (OrderListComponent).
// * When the user clicks an order, the screen displays info for the selected order:
//      ** The order details form (OrderComponent).
//      ** A list of the order's products (ProductListComponent).
//            When the user double-clicks a product in the list, a details form dialog pops up (ProductComponent).
// Each entity has the CRUD functionality.
// Notice the naming convention:
// - The screen-level component has "Screen" in its name: <Entity>ScreenComponent.
// - List components have "List" in their names: <Entity>ListComponent.
// - Form components don't have neither "Screen" nor "Form" in their names: <Entity>Component.

// Here is the State datatype which holds the entire screen's data:

import { ICustomer, IOrder, IProduct } from 'src/models/customer.model';

export interface ICustomerState {
  customerList: ICustomer[]; // list of customers
  customerListLoaded: boolean; // when false, display a progress bar in place of the data fields
  contextCustomer: ICustomer | null; // details form for the currently selected customer
  contextCustomerLoaded: boolean;

  orderList: IOrder[]; // list of orders of the currently selected customer
  orderListLoaded: boolean;
  contextOrder: IOrder | null; // details form for the currently selected order
  contextOrderLoaded: boolean;

  productList: IProduct[]; // list of products of the currently selected order
  productListLoaded: boolean;
  contextProduct: IProduct | null; // details form dialog for the double-clicked product
  contextProductLoaded: boolean;
}

// As you can see, the State doesn't hold references to component instances.  
// It only contains the data for them.  
// When components are created, they work with this data only.  
// Components may have properties for the same data, but these are just temporary storage until the changes are saved to the State.

// State:
// * Centralizes data management providing a single source of truth for the module's data.
// * Ensures that all parts of the module are synchronized with the same version of the data.
// * Simplifies communication between components by avoiding direct data sharing and, worse, multiple copies of the same data.
// * Ensures that growing amounts of data are handled efficiently and predictably.

// In NgRx, State is immutable, meaning it cannot be directly modified.
// Eeach change creates a new instance of State and makes the old instance subject to garbage collector.
// That prevents accidental modifications and ensures predictability and reliable debugging.

// @@@ The Initial State:

// You must also create the Initial State object of the declared type, with all the properties populated with default values:
export const initialCustomerState: ICustomerState = {
  // Customer:
  customerList: [],
  customerListLoaded: false,
  contextCustomer: null,
  contextCustomerLoaded: false,
  // Order:
  orderList: [],
  orderListLoaded: false,
  contextOrder: null,
  contextOrderLoaded: false,
  // Product:
  productList: [],
  productListLoaded: false,
  contextProduct: null,
  contextProductLoaded: false
};
// This object is usually created in same Model file which declares the State's data types.
// If those data types are changed later, it's convenient to synchronize the Initial State since it's right there at hand.

// The Initial State is crucial since it:
// * Provides a clear and consistent starting point for the module's State.
// * Ensures that the state is always defined, even before any data is retrieved.

// Later, when you learn about Reducers, you will see that the initialCustomerState object is passed to the createReducer function.

// ######################################################################################################
// * Store
// ######################################################################################################

// While State is a module-level data container, Store is an application-level data container.
// The Store instance is a singleton object that holds the States of multiple modules combined, which makes up the state of the whole application.

// The Store is the single source of truth for the current state of the whole application.
// It provides a way to access the state, dispatch actions, and subscribe to state changes.
// You can think of it as a database that you can get access in order to retrieve or update the data that the application operates on.
// The Store is an observable, and components can subscribe to it to get updates when the state changes.

// The Store is a state-management solution inspired by the famous library Redux.
// Redux popularized the idea of organizing the application state into simple objects and updating this state by replacing it with a new state.
// This means that the object shouldn't be mutated directly, but rather should be replaced with a new object which contains the new version of the data.

// You don't declare the Store data type, and don't instantiate it.
// Angular does all that for you, creating a Store instance as injectible.
// You only need to inject it into your components so they can read and update it.

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
  private _customerList: ICustomer[] = [];

  contextCustomer$: Observable<ICustomer>;
  private _contextCustomer!: ICustomer;

  private _s: Subscription = new Subscription();

  // A pointer to the application's Store is injected into the constructor:
  constructor(private _store: Store<any>) { }

  ngOnInit(): void {
    // Populate the observables from the Store:
    this.customerList$ = this._store.select('customerList');
    this.contextCustomer$ = this._store.select('contextCustomer');
    // The parameters passed to the select() functions are the names of the current module's State properties, as strings.  
    // Even though the entire Store is queried, only data from the current module's State is subscribed to.  
    // This means different modules (screens) can have fields with the same names in their States without interfering with each other.

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

// If another component of the module will need to get, for example, the context customer, it will do the same:
this.contextCustomer$ = this._store.select('contextCustomer');
// That eliminates the need to pass that customer from the parent component's template to the child components.
// If any component changes contextCustomer property of the module's State, all the subscribing components are immediately aware of that.
// So, for example, their templates are automatically re-rendered to reflect the change. Reactive programming is magic!

// @@@ What is an Angular application?

// As mentioned, the Store is a singleton — there's only one Store instance per Angular application.  
// You might ask: “What if I open several browser tabs for different customers? Shouldn't the properties of ICustomerState be arrays?”  
// Here's the clarification: Angular applications follow the SDI (Single Document Interface) model, not MDI (Multiple Document Interface).  
// Only one screen is active at a time, but you can open multiple instances of the application.  
// So, each browser tab runs its own separate instance of the Angular app with its own singleton Store.

// ######################################################################################################
// * Action
// ######################################################################################################

// An Action is a plain TypeScript object used to express an event or an intention (usually a data manipulation or a change in the application's state).  
// Actions are dispatched (launched) in one part of the application (usually in components or services) and captured in others.  
// NgRx automatically manages the chain of fired events when an Action is dispatched, ensuring the appropriate consumers respond to it seamlessly.  
// Actions provide an easy global communication channel. They are one of the main building blocks in NgRx.  

// An Action object has two properties:  
//   * type – a textual description of the intention.  
//   * payload (optional) – additional data required for the action (like retrieval parameters), used to enforce type safety when the Action is dispatched.  

// An Action is created and returned by the createAction() factory function, which accepts type and payload as its parameters.  
// The next example defines a few simple Actions. No payload, so only type is passed to createAction().  
// It is good practice to add the word "Action" to the names of Action objects:
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
// That allows different Modules to have Actions with a same Description, like '[Customer] Save' and '[Order] Save'.

// @@@ Action PAYLOAD - the 2nd parameter (optional) to createAction():

// Describes the payload (additional data) expected by the Action. That data must be provided when the Action is dispatched.
// The argument prevents sending wrong data to the Action, i.e. inforces strong typing.

// The payload is sent to createAction() as the 2nd parameter via the props<T>() function, for example:
import { createAction, props } from '@ngrx/store';
export const insTodoAction = createAction('[Todo List] Insert', props<{ todoText: string }>());

// props<T>() takes a generic type parameter, which is the data type of the payload for compile-time type checking to ensure correct payload structure.
// In the example above, the props() defines that the action should carry a payload with a property `todoText` of type `string`, so a correct dispatch looks like this:
this._store.dispatch(insTodoAction({ todoText: 'Learn NgRx' }));
// The next calls will cause compilation-time errors:
this._store.dispatch(insTodoAction({ todoText: 123 })); // doesn't match the required data type - 'todoText' must be a string
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

const m = '[Customer]'; // m = Module
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
  InsCustomer = `${m} Insert ${c}`,
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
  InsOrder = `${m} Insert ${o}`,
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
  InsProduct = `${m} Insert ${p}`,
  InsProductSuccess = `${InsProduct} Success`,
  UpdProduct = `${m} Update ${p}`,
  UpdProductSuccess = `${UpdProduct} Success`,
  DelProduct = `${m} Delete ${p}`,
  DelProductSuccess = `${DelProduct} Success`,
}

// Then, the Action file declares the Action objects themselves.

// In most enterprise applications, dispatching an Action calls a function of a Web Service, so our example reflects that.
// The props parameter to the createAction() function describes the Action's payload:
//   * The payload of a regular (non-Success) CRUD Action defines the INPUT of the Web Service function the Action calls.
//   * The payload of a Success CRUD Action defines the OUTPUT of the same Web Service function.

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

// The class that directly calls the Web Service.  
// It's the “last station” of data flow within Angular before the data is sent to the middle tier on the Web.  
// The class name simply says "Service" for brevity, but keep in mind that it refers to a "Web Service."  
// Strictly speaking, this class is not part of the NgRx library, but it's commonly found in apps that interact with a Web Service, which is the standard architecture.  
// It will be injected into the Side Effect class (described next), which is why it has the @Injectable decorator:

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

  constructor(private _http: HttpClient) {}

  // Customer:

  selCustomerList(lastName: string): Observable<ICustomer[]> {
    return this._http.get<ICustomer[]>(this._customersUrl, lastName);
  }

  selCustomer(customerId: number): Observable<ICustomer> {
    return this._http.get<ICustomer>(`${this._customersUrl}/${customerId}`, customerId);
  }

  insCustomer(customer: ICustomer): Observable<ICustomer> {
    return this._http.post<ICustomer>(`${this._customersUrl}/ins`, customer)
  }

  updCustomer(customer: ICustomer): Observable<ICustomer> {
    return this._http.put<ICustomer>(`${this._customersUrl}/upd`, customer);
  }

  delCustomer(customerId: number): Observable<void> {
    return this._http.delete<void>(`${this._customersUrl}/del`, customerId);
  }

  // Order:

  // < ... A SIMILAR FRAGMNENT FOR ORDER FUNCTIONS HERE, USING this._ordersUrl ... >

  // Product:

  // < ... A SIMILAR FRAGMNENT FOR PRODUCT FUNCTIONS HERE, USING this._productsUrl ... >
}

// ######################################################################################################
// * Effect
// ######################################################################################################

// Side effects are operations that happen outside the Angular context, such as calling external APIs, making HTTP requests, or accessing local storage.  
// If your application needs to perform a side effect, you define an Effect class.  

// Effects are built using RxJS Observables and are designed to listen for specific Actions and perform side effects without directly modifying the Store.  
// The Effect class captures a dispatched main Action and calls the corresponding method in the Web Service class.  
// It is also the “first station” within Angular to handle the data returned from the middle tier via the Web Service.  
// Once a side effect is successfully completed, the Effect typically dispatches the respective "Success" Action to update the Store with the external results.  

// We'll use the Customer screen to demonstrate how Effects handle side effects.  
// The class name uses just "Effect" for brevity, but it stands for "Side Effect":

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
  // Note the Service injected into the Effect through its constructor:
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
          catchError(() => EMPTY), // a real app would include an error handler, but let's leave that out for now.
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

// The mission of the Reducer is critical – it's responsible for updating the State with the results of the Web Service calls when a ...Success Action is dispatched by the Effect.

// Also, you can create and dispatch an Action which updates the State without calling side effects - like those without "Success" in the example below.
// That is the correct way, we don't update the State in other spots of the application. Instead, these spots dispatch Actions which signal the Reducer to change the State.
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
  initialCustomerState, // notice that the initialCustomerState object is passed to the createReducer function

  // Customer:

  on(setContextCustomerAction, (state: ICustomerState, { actionCustomer: newContextCustomer }) => ({
    ...state, // copy all the properties of the old State to the new State unchanged...
    contextCustomer: newContextCustomer // ...and override contextCustomer whith the new value
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
    // Add the INSERTed Table to the Customers List:
    customerList: [...state.customerList, insertedCustomer]
  })),

  on(updCustomerSuccessAction, (state: ICustomerState, { actionCustomer: updatedCustomer }) => ({
    ...state,
    // Refresh the context Customer to populate the DB-generated fields - updatedBy & updatedAt:
    contextCustomer: updatedCustomer,
    // Refresh the UPDATEd Customer in the Customers List:
    customerList: state.customerList.map(
      (customerInList: ICustomer) => customerInList.customerId === updatedCustomer.customerId ? updatedCustomer : customerInList
    )
  })),

  on(delCustomerSuccessAction, (state: ICustomerState, { actionCustomerId: deletedCustomerId }) => ({
    ...state,
    // Dispose of the DELETEd Customer:
    contextCustomer: null,
    // Remove the DELETEd Customer from the Customers List:
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

// As you've seen, Actions fall into three categories:

// 1. Actions that are called from business logic and trigger external Effects (usually web services). They have corresponding Success Actions.
// A typical example is Actions for CRUD operations.
// Such Actions do not change the State with business data (only turn on the progress bar display flag).

// 2. Success Actions. Called from the Effect class in case of successful execution of the main Action.
// As you remember, their task is to update the State with the result, retuned by the Effect.
// By the way, some applications also use Failure Actions, called from the Effect class in case of an error in the main Action, if the State must be updated with the failure info.

// 3. Actions that are called from business logic and DO NOT trigger external Effects.
// Their task is to change the State by writing into it the data passed as payload by the calling business code.
// For example, SetContextCustomer receives data as a whole ICustomer object that was already stored on the client side because it was received from the web service earlier.
// Actions of this category are also used to "manually" change a specific field of the State - for example, write calculation results.
// Let me remind you once again that any physical changes to the State must be made only inside the Reducer.
// Despite the fact that any component has access to the State, changes must be made by dispatching Actions, and not by assigning values ​​to the State fields directly.

// Let's briefly summarize the life cycle stages that an Action goes through:

// Actions related to Effects (categories 1 & 2):

// 1. The component dispatches a regular (not Success) Action.
// 2. The Reducer captures it and updates the State to display the progress bar.
// 3. The Effect captures the Action and calls the corresponding function of the Service, passing the payload as an input.
// 4. The Service sends an HTTP request to the web service and is waiting for its result.
// 5. When an HTTP response is received, the Service function passes its output to the Effect.
// 6. If the call was successful, the Effect dispatches the respective Success Action, passing the results returned by the web service.
// 7. The Reducer captures the Success Action, updates the State with those results, and turns off the progress bar flag.

// Actions unrelated to Effects (category 3):

// 1. The component dispatches an Action.
// 2. The Reducer captures it and writes the payload to the State.