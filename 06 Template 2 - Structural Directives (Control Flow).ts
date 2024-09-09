// Structural Directives:
// * Change the DOM layout (the structure of the view) by adding, removing, or manipulating DOM elements based on conditions.
// * Prefixed with an asterisk (*) (the OLD syntax) or with a pound (@) (the NEW syntax, starting from Angular 17)
// * Examples: *ngIf, *ngFor, *ngSwitch
// * An element can have only one structural directive

////////////////////////////////////////////////////////////////////////
// The OLD syntax: /////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////

// The most common structural directives are *ngIf, `*ngFor`, and `*ngSwitch`.

// ######################################################################################################
// *ngIf
// ######################################################################################################

// Conditionally includes an element in the DOM based on a Boolean expression.

// app.component.ts
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  showElement = true;
}

// app.component.html
<div *ngIf="showElement">
  This element is conditionally displayed.
</div>

// In this example, the `div` element will only be rendered if `showElement` is `true`.

// The rendered HTML:
<div>
  This element is conditionally displayed.
</div>

// If showElement would be false, the <div> element would not be rendered at all.

// Notice that *ngIf can evaluate not only a boolean variable but also a function which returns boolean, for example:
<div *ngIf="isElementVisible()">
  This element is conditionally displayed.
</div>

// @@@ <ng-template> custom HTML tag

// It's not a structural directive, but it's widely used with structural directives, so it's described in this file.

// The <ng-template> directive defines a template that is not rendered by default.
// It serves as a container for an HTML block that Angular can conditionally add or remove from the DOM.
// The <ng-template> itself is never displayed directly, but its contents can be included in the DOM at runtime using structural directives
// 		such as *ngIf, *ngFor, *ngSwitch, or via manual rendering with ViewContainerRef and TemplateRef.

// The <ng-template> with an else condition in *ngIf is used to define content that should be displayed when the condition in *ngIf is false.
// It provides a way to specify alternative content without needing an additional *ngIf statement with the same but negative condition.

// Basic Structure:

<div *ngIf="condition; else elseBlock">
  Content to show when condition is true
</div>

<ng-template #elseBlock>
  Content to show when condition is false
</ng-template>

// If the condition is true, the div content is rendered.
// Otherwise, the content inside the <ng-template> with the matching reference variable (in this case, `#elseBlock`) is rendered instead.

// Example:

<div *ngIf="isLoggedIn; else loginButton">
  Welcome, {{username}}!
</div>

<ng-template #loginButton>
  <button (click)="login()">Login</button>
</ng-template>

// Advantages:
//    - It keeps related content (true and false cases) close together in the template.
//    - It's more efficient than using two separate *ngIf directives.
//    - It makes the intent of the code clearer.

// You can also use ng-template with `then` and `else`:
<div *ngIf="condition; then thenBlock else elseBlock"></div>
<ng-template #thenBlock>Content to render when condition is true.</ng-template>
<ng-template #elseBlock>Content to render when condition is false.</ng-template>

// @@@ *ngTemplateOutlet

// *ngTemplateOutlet is a directive that allows you to render the content of an ng-template dynamically in a view.
// It lets you insert a template reference into the DOM at runtime, giving you the flexibility to control what gets displayed based on your app logic.

// Use Cases for *ngTemplateOutlet
// Reusing Templates:
// 		If you have a template reused in multiple places, you can define it once and then use ngTemplateOutlet to insert it wherever needed.
// Dynamic Content Rendering:
//		When you need to render different templates based on conditions or inputs.
// Component Customization:
// 		Allowing consumers of a component to pass in a template for customized rendering.

// Example:

// 1. Define the Templates

// In your component's template, define a couple of templates using the <ng-template> directive:

<ng-template #templateA>
  <div>This is Template A</div>
</ng-template>

<ng-template #templateB>
  <div>This is Template B</div>
</ng-template>

// 2. Use *ngTemplateOutlet to Render the Template

// Now, we can use ngTemplateOutlet to render one of these templates based on a condition in the component.
// The example will contain the <ng-container> custom HTML which will be described later in detail.
// For now, just know that it's like <div> but not rendered (just delimits HTML pieces which are processed as one block by the logic).
// Let's suppose that showTemplateA is aboolean property in the component class:

<div *ngIf="showTemplateA; else otherTemplate">
  <ng-container *ngTemplateOutlet="templateA"></ng-container>
</div>

<ng-template #otherTemplate>
  <ng-container *ngTemplateOutlet="templateB"></ng-container>
</ng-template>

// *ngTemplateOutlet is used inside an <ng-container> to insert the content of an <ng-template> at runtime.
// The template to be inserted is referenced using a template reference variable, like templateA or templateB in this example.

// You can also pass a context object to the template using *ngTemplateOutlet. This allows you to pass data into the template dynamically.
// Here, the templateWithContext template is rendered with a dynamic message passed via the context object:

<ng-template #templateWithContext let-msg="greetingMessage">
  <div>{{ msg }}</div>
</ng-template>

<ng-container *ngTemplateOutlet="templateWithContext; context: { greetingMessage: 'Hello from context!' }"></ng-container>

// When using the *ngTemplateOutlet directive to pass data to a template, the object used to pass that data is referred to as context.
// This is a required and specific property name in the syntax for *ngTemplateOutlet. You cannot rename this to something else; it must be context.

// Notice the let-msg declaration.
// The let- part is same as "let" in JS, it's not a part of the var name (which is msg in our example).
// The let- variables declared within a <ng-template> are template input variables.
// They're used to capture values from the context object passed to the template.
// The data type of a let- variable corresponds to the data type of the context object's property from which it's populated.

// IMPORTANT!!!
// The string, passed to a let- var, is not the initial value per se (as it would be in the JS "let") but the name of a property of the context object.
// The initial value is the value of that property.

// Another example of let- variables (pay attention that the naming convention for them is camelCase):

<ng-container *ngTemplateOutlet="greetTemplate; context: { name: 'Alice', age: 30 }"></ng-container>

<ng-template #greetTemplate let-personName="name" let-personAge="age">
  <p>Hello, {{ personName }}! You are {{ personAge }} years old.</p>
</ng-template>

// Let's compare `let-` variables and template reference variables (declared with #):

// Similarities:
// 1. Both are used within templates.
// 2. Both provide a way to reference values or elements in the template.
// 3. Both can be used in template expressions.

// Differences:

// 1. Declaration:
//    - `let-` variables: Declared in `<ng-template>` or structural directives.
//    - `#` variables: Declared on any element in the template.

// 2. Scope:
//    - `let-` variables: Scoped to the <ng-template> tag they're declared in.
//    - `#` variables: Available throughout the entire HTML template after the declaration point.

// 3. Purpose:
//    - `let-` variables: Used to capture values from a context object.
//    - `#` variables: Used to reference DOM elements or directive instances.

// 4. Usage context:
//    - `let-` variables: Typically used with `*ngTemplateOutlet` or structural directives.
//    - `#` variables: Can be used anywhere in the template.

// 5. Value assignment:
//    - `let-` variables: Values are assigned from a context object.
//    - `#` variables: Reference the element or component/directive they're declared on.

// @@@ *ngIf as an object existence guard

// The next <div> will be rendered only if the object named 'user' is defined and instantiated, even if it's an empty object = {}:
<div *ngIf="user">
  <h2>User Details</h2>
  <p>Name: {{user.name}}</p>
  <p>Email: {{user.email}}</p>
  <p>Age: {{user.age}}</p>
</div>
// The <div> will not be rendered if 'user' is undefined, null, or not declared at all.
// That makes *ngIf useful as a guard against accessing properties of undefined objects, which would cause errors if attempted:

// This approach allows you to safely access properties of user without using the Elvis operator on each property this way:
<h2>User Details</h2>
<p>Name: {{user?.name}}</p>
<p>Email: {{user?.email}}</p>
<p>Age: {{user?.age}}</p>
// In contrast to Elvis, *ngIf prevents rendering of the entire block if the object doesn't exist, which can be more efficient.
// It also more user-friendly - the labels with no values look as an obvious bug.

// <ng-template> can be used with an *ngIf in this situation in the normal way:
<div *ngIf="user; else noUser">
  <h2>User Details</h2>
  <p>Name: {{user.name}}</p>
  <p>Email: {{user.email}}</p>
  <p>Age: {{user.age}}</p>
</div>

<ng-template #noUser>
  <h2>No user found</h2>
</ng-template>

// ######################################################################################################
// *ngFor
// ######################################################################################################

// Repeats an element for each item in a list.

// app.component.ts
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  beatles = ['Paul', 'John', 'George', 'Ringo'];
}

// app.component.html
<ul>
  <li *ngFor="let beatle of beatles">
    {{ beatle }}
  </li>
</ul>

// In this example, the `li` element will be repeated for each item in the `beatles` array and displayed as a list item.
// The rendered HTML:
<ul>
  <li>Paul</li>
  <li>John</li>
  <li>George</li>
  <li>Ringo</li>
</ul>

// @@@ index

// You can access the current loop index using the index variable:
<div *ngFor="let item of items; let i = index">
  <p>Index: {{ i }} - Item: {{ item.name }}</p>
</div>
// Notice that you cannot use the index var directly without declaring a variable (like i in the example) to hold its value within the *ngFor directive.

// @@@ trackBy

// Often, the looping is on an array of objects which have a unique identifier field.
// That usually happens when the array is populated from a DB table, and the PK field is included.
// In that case, use trackBy to specify the function which returns that unique identifier for each item in the loop.
// When the change detection mechanism finds that the array has been changed, Angular must re-render the HTML element (<ul> in our example).
// trackBy improves performance by helping Angular identify which items have changed and re-render only them - instead of re-rendering the entire list.

@Component({
  selector: 'app-user-list',
  template: `
    <ul>
      <li *ngFor="let user of users; trackBy: trackByUserId">
        {{ user.name }}
      </li>
    </ul>
  `
})
export class UserListComponent {
  users = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' }
  ];

  trackByUserId(index: number, user: any): number {
    return user.id;
  }
}

// ######################################################################################################
// *ngSwitch
// ######################################################################################################

// Conditionally includes one of several possible elements based on a switch expression.
// It works in conjunction with *ngSwitchCase and *ngSwitchDefault.

// app.component.ts
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  viewMode = 'map';
}

// app.component.html
<div [ngSwitch]="viewMode">
  <div *ngSwitchCase="'map'">Map View</div>
  <div *ngSwitchCase="'list'">List View</div>
  <div *ngSwitchDefault>Default View</div>
</div>

// In this example, the content displayed depends on the value of `viewMode`.
// If `viewMode` is `'map'`, the `Map View` div is displayed.
// If `viewMode` is `'list'`, the `List View` div is displayed.
// If `viewMode` has any other value, the `Default View` div is displayed.

// The rendered HTML:
<div>
  <div>Map View</div>
</div>

// @@@ <ng-container> custom HTML tag

// It's not a structural directive, but it's widely used with structural directives, so it's described in this file.

// <ng-container> groups several elements together without adding an extra node to the DOM.
// Allows to apply structural directives to multiple elements or a fragment of a template without rendering unnecessary <div> wrapper elements.

// Example of <ng-container>:
<ng-container *ngFor="let item of items">
  <div>{{ item }}</div>
</ng-container>

// Example of nested <ng-container> tags for multiple structural directives:
<ng-container *ngIf="isLoggedIn">
  <ng-container *ngFor="let item of items">
    <div>{{ item }}</div>
  </ng-container>
</ng-container>

// Why <ng-container> is often better than an extra `<div>`:
// - It doesn't add an extra element to the DOM, keeping your HTML cleaner.
// - It doesn't affect styling or layout, unlike a `<div>` which might interfere with CSS.
// - It's more semantically correct when you don't need an actual container element.
// Example:
<ng-container *ngIf="isVisible">
  <h1>Title</h1>
  <p>Paragraph</p>
</ng-container>
// This is better than:
<div *ngIf="isVisible">
  <h1>Title</h1>
  <p>Paragraph</p>
</div>
// Because it doesn't introduce an extra `<div>` in the DOM when `isVisible` is true. The rendered HTML would be:
// Using <ng-container>:
<h1>Title</h1>
<p>Paragraph</p>
// Using <div>:
<div>
  <h1>Title</h1>
  <p>Paragraph</p>
</div>
// When isVisible is false, nothing would be rendered in both the cases.

// When <ng-container> might be worse than <div>:
// - If you actually need a container element for styling or layout purposes.
// - If you're working with a third-party library that expects a real DOM element.

// Example of using <ng-container> with *ngSwitch:
@Component({
  selector: 'app-switch-example',
  templateUrl: './switch-example.component.html'
})
export class SwitchExampleComponent {
  selectedOption: string = '';
}
// switch-example.component.html:
<select [(ngModel)]="selectedOption">
  <option value="option1">Option 1</option>
  <option value="option2">Option 2</option>
  <option value="option3">Option 3</option>
</select>

<ng-container [ngSwitch]="selectedOption">
  <ng-container *ngSwitchCase="'option1'">
    <h2>You selected Option 1</h2>
    <p>This is the content for Option 1.</p>
  </ng-container>
  
  <ng-container *ngSwitchCase="'option2'">
    <h2>Option 2 is your choice</h2>
    <p>Here's what we have for Option 2.</p>
    <ul>
      <li>Feature 1</li>
      <li>Feature 2</li>
    </ul>
  </ng-container>
  
  <ng-container *ngSwitchCase="'option3'">
    <h2>Option 3 it is!</h2>
    <p>Option 3 comes with special content.</p>
    <img src="option3-image.jpg" alt="Option 3 image">
  </ng-container>
  
  <ng-container *ngSwitchDefault>
    <p>Please select an option.</p>
  </ng-container>
</ng-container>

// <ng-container> vs <ng-template>:
// <ng-container>:
//		Used to logically group elements without adding extra DOM nodes. Useful for applying structural directives to multiple elements.
//		Example: Grouping elements for conditional rendering or iteration.
//		Characteristics: No DOM representation, logical grouping.
// <ng-template>:
//		Used for defining template fragments that are rendered conditionally or programmatically (not rendered by default).
//		Example: Defining reusable templates, conditional templates, lazy rendering.
//		Characteristics: No default rendering, used for template references, supports lazy rendering.

// The new syntax (described next) implicitly groups the content inside the directive block, so there is no need for <ng-container> anymore.
// The directives themselves handle the grouping and conditional rendering directly within the template syntax.

// @@@ Template input variables

// The let- syntax within an <ng-container> tag is used to declare a template input variable.
// This allows you to create a variable that can be used within the scope of the template.
// The let- syntax is often used in conjunction with structural directives like *ngFor or *ngIf to access data within the template.





// @@@ Example of *ngSwitch using <ng-template> with *ngTemplateOutlet

// Let's create an example where we use *ngSwitch to conditionally render different templates based on a variable's value.

// Component Template (app.component.html) (supposing currentView is a string property in the component):

<div [ngSwitch]="currentView">
  <ng-container *ngSwitchCase="'home'">
    <ng-container *ngTemplateOutlet="homeTemplate"></ng-container>
  </ng-container>
  <ng-container *ngSwitchCase="'about'">
    <ng-container *ngTemplateOutlet="aboutTemplate"></ng-container>
  </ng-container>
  <ng-container *ngSwitchCase="'contact'">
    <ng-container *ngTemplateOutlet="contactTemplate"></ng-container>
  </ng-container>
  <ng-container *ngSwitchDefault>
    <ng-container *ngTemplateOutlet="defaultTemplate"></ng-container>
  </ng-container>
</div>

<!-- Templates -->
<ng-template #homeTemplate>
  <h2>Home</h2>
  <p>Welcome to the home page!</p>
</ng-template>

<ng-template #aboutTemplate>
  <h2>About</h2>
  <p>Learn more about us on this page.</p>
</ng-template>

<ng-template #contactTemplate>
  <h2>Contact</h2>
  <p>Get in touch with us here.</p>
</ng-template>

<ng-template #defaultTemplate>
  <h2>Not Found</h2>
  <p>The page you are looking for does not exist.</p>
</ng-template>

// Explanation:
// [ngSwitch] Directive:
//		This directive is used on the parent <div> to switch between different cases based on the value of currentView.
//*ngSwitchCase and *ngSwitchDefault:
//		These directives are used to define the cases and the default case. Instead of placing HTML directly within these directives,
//		we use <ng-container> with *ngTemplateOutlet to reference the predefined <ng-template> blocks.
//		The HTML pieces in these blocks are short in the example, but they can be long in real life.
// 		So, placing them inside the ngSwitch would make the logic harder to understand.
//<ng-template>:
//		These blocks contain the actual HTML content for each case.
//		They are defined separately and referenced using their template reference variables (#homeTemplate, #aboutTemplate, etc.).
//<ng-container>:
//		This is used as a wrapper to apply structural directives like *ngSwitchCase and *ngTemplateOutlet without adding extra elements to the DOM.

////////////////////////////////////////////////////////////////////////
// The NEW syntax: /////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////

// The new control flow syntax (@if, @for, @switch) was introduced in Angular 17, which was released on November 8, 2023.
// This was a significant update to Angular's template syntax, aiming to make templates more intuitive, readable and efficient.

// ######################################################################################################
// @if
// ######################################################################################################

@if (condition) {
  <p>Condition is true</p>
} @else if (anotherCondition) {
  <p>Another condition is true</p>
} @else {
  <p>All conditions are false</p>
}

// Replaces the old syntax:

<p *ngIf="condition">Condition is true</p>
<p *ngIf="!condition && anotherCondition">Another condition is true</p>
<p *ngIf="!condition && !anotherCondition">All conditions are false</p>

// Key differences:
// - @if allows for more readable, block-style conditionals
// - Easier to handle multiple conditions with @else if
// - No need for <ng-template> for else conditions

// ######################################################################################################
// @for
// ######################################################################################################

// https://blog.angular-university.io/angular-for/

@for (item of items; track item.id) {
  <p>{{item.name}}</p>
} @empty {
  <h2>No items found</h2>
}

// The @empty section specifies what will be rendered if the array is empty.

// Replaces the old syntax:

<p *ngFor="let item of items; trackBy: trackByFn">{{item.name}}</p>
<p *ngIf="items.length === 0">No items found</p>

// Key differences:
// - Built-in empty state handling with @empty
// - Simpler syntax for trackBy functionality
// - No need for separate *ngIf for empty state

// @@@ $index

// You can access the current loop index using the $index variable:
<div @for="let item of items; let i = $index">
  <p>Index: {{ i }} - Item: {{ item.name }}</p>
</div>
// Notice that it has the dollar sign - in contrast to the old syntax.

// @@@ track
// A simplified way to specify a unique identifier for each item in the loop.
// Serving the same purpose as `trackBy` in the old syntax but with no need to create a trackBy...() function - the property is mentioned directly:

@Component({
  selector: 'app-user-list',
  template: `
    <ul>
      @for (user of users; track user.id) {
        <li>{{ user.name }}</li>
      }
    </ul>
  `
})
export class UserListComponent {
  users = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' }
  ];
}

// Even though you don't have to write the "track by" function in the new syntax, you still can do so:
interface User {
  id: number;
  name: string;
}

@Component({
  selector: 'app-user-list',
  template: `
    <ul>
      <li *ngFor="let user of users; trackBy: trackUserId">{{ user.name }}</li>
    </ul>
  `
})
export class UserListComponent {
  users: User[] = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
    { id: 3, name: 'Charlie' }
  ];

  trackUserId(user: User): number {
    return user.id;
  }
}
// If the array is not strongly typed, the parameter to the "track by" function can by "any".

// In the new syntax, track is mandatory - in contrast to trackBy in the old syntax.
// If you forget it, you will get the "NG5002: @for loop must have a "track" expression" error.
// What if there is nothing unique about the looped elements?
// In the case of an array of strings or objects, you can use the looping var itself since references are guaranteed to be unique:
<ul>
	@for (course of courses; track course) {
		<li>{{ course }}</li>
	}
</ul>
// You can also use $index as a unique field with an array of any type. That is the only possible option for primitive non-reference types:
@Component({
  selector: 'app-number-list',
  template: `
    <ul>
      @for (let number of numbers; track $index) {
        <li>Number: {{ number }}</li>
      }
    </ul>
  `
})
export class NumberListComponent {
  numbers = [1, 2, 3, 4, 5];
}

// ######################################################################################################
// @switch
// ######################################################################################################

@switch (condition) {
  @case (value1) {
    <p>Value is 1</p>
  }
  @case (value2) {
    <p>Value is 2</p>
  }
  @default {
    <p>Value is neither 1 nor 2</p>
  }
}

// Replaces the old syntax:

<div [ngSwitch]="condition">
  <p *ngSwitchCase="value1">Value is 1</p>
  <p *ngSwitchCase="value2">Value is 2</p>
  <p *ngSwitchDefault>Value is neither 1 nor 2</p>
</div>

// Key differences:
// - More concise and readable block-style syntax
// - No need for a container element
// - Closer to traditional switch-case syntax in programming languages

// General advantages of the new syntax:
// 1. More intuitive and closer to standard programming constructs
// 2. Improved type checking and error detection at compile-time
// 3. Better performance due to optimized change detection
// 4. Easier to read and maintain, especially for complex templates
// 5. Reduced need for auxiliary variables in templates

// While these new control flow syntax options provide improvements, the older syntax is still supported for backwards compatibility.
// Developers can choose to adopt the new syntax gradually in their projects.

////////////////////////////////////////////////////////////////////////
// Creating a Custom Structural Directive: /////////////////////////////
////////////////////////////////////////////////////////////////////////

// You can also create custom structural directives to meet specific requirements. 
// For that:
// * use the `@Directive` decorator with a "selector" property which defines the Custom Structural Directive (must be in square brackets), and
// * implement the directive's logic in the class. It must be a setter which is:
//		named as the Custom Structural Directive;
//		decorated with @Input();
//		accepting one boolean parameter.

// highlight.directive.ts
import { Directive, ElementRef, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appHighlight]'
})
export class HighlightDirective {
  @Input() set appHighlight(condition: boolean) {
    if (condition) {
      this.renderer.setStyle(this.el.nativeElement, 'backgroundColor', 'yellow');
    } else {
      this.renderer.removeStyle(this.el.nativeElement, 'backgroundColor');
    }
  }

  constructor(private el: ElementRef, private renderer: Renderer2) {}
}

// app.component.html
<p [appHighlight]="true">This text will be highlighted.</p>
<p [appHighlight]="false">This text will not be highlighted.</p>

// In this example, the `HighlightDirective` changes the background color of the element based on a condition.

// The rendered HTML for custom directive [appHighlight] when true:
<p style="background-color: yellow;">This text will be highlighted.</p>
<p>This text will not be highlighted.</p>

// Another example of a custom structural directive that conditionally adds or removes an element from the DOM:
import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[applyUnless]'
})
export class UnlessDirective {
  private hasView = false;

  @Input() set applyUnless(condition: boolean) {
    if (!condition && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (condition && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }

  constructor(private templateRef: TemplateRef<any>, private viewContainer: ViewContainerRef) { }
}

// Usage in Template:
<div *applyUnless="condition">
  Content displayed only when 'condition' is false.
</div>

// For more detailes, you can refer to the official Angular documentation on structural directives: https://angular.io/guide/structural-directives).