// ######################################################################################################
// Local Template Querying, @ViewChild & @ViewChildren decorators
// ######################################################################################################

// Local Template Querying allows the component class to access and manipulate elements, components and drectives of its template.
// "Local" means "locally in the component class".

//### @ViewChild

// The @ViewChild decorator is used to query a single element, directive, or component from the component's template.

import { Component, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <h1 #header>Title</h1>
    <button (click)="changeTitle()">Change Title</button>
  `
})
export class AppComponent {
  @ViewChild('header') // <<<<<<< the template variable's name is sent with no pound sign (#)!!!
  header: ElementRef;

  changeTitle() {
    this.header.nativeElement.textContent = 'New Title';
  }
}

// @ViewChild returns the first encountered element with the given template reference variable.
// In this example, @ViewChild  is used to get a reference to the <h1> element with the template var #header.
// The changeTitle() method then modifies the text content of this element.

//### @ViewChildren

// The @ViewChildren decorator is used to query multiple elements, directives, or components from the component's template.
// It returns a QueryList of items, which can be iterated over or manipulated as needed.

import { Component, ViewChildren, QueryList, ElementRef } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <div #item>Item 1</div>
    <div #item>Item 2</div>
    <div #item>Item 3</div>
    <button (click)="changeItems()">Change Items</button>
  `
})
export class AppComponent {
  @ViewChildren('item')
  items: QueryList<ElementRef>;

  changeItems() {
    this.items.forEach(item => {
      item.nativeElement.style.color = 'red';
    });
  }
}

// @ViewChildren returns ALL the elements with the given template reference variable, not only the first as @ViewChild does.
// In this example, @ViewChildren is used to get references to all <div> elements with the template reference variable #item.
// The changeItems() method then changes the text color of all these elements to red.

// @ViewChild and @ViewChildren can only query elements within the same template. 
// They cannot access elements inside child components or parent components.

// ######################################################################################################
// The argument passed to @ViewChild and @ViewChildren
// ######################################################################################################

// It's crucial for identifying which elements or components to query. That argument can be:

// 1. Template Reference Variable name (as a string):
// This is the most common use case, as shown in the previous examples.

@ViewChild('myElement')
element!: ElementRef;

@ViewChildren('item')
items!: QueryList<ElementRef>;
// Here, 'myElement' and 'item' correspond to #myElement and #item template vars.

// 2. Type of Component or Directive:
// You can pass a component or directive type to obtain the first (for @ViewChild) or all (for @ViewChildren) instances of that type.

@ViewChild(ChildComponent)
childComp!: ChildComponent;

@ViewChildren(ItemDirective)
items!: QueryList<ItemDirective>;

// Passing a type is dangerous since, in the future, an element of the same type can be added, which is not supposed to be picked.
// Passing a template var name is safe since you need to add that var to the new element in order for it to be picked.

// ######################################################################################################
// The data type returned by @ViewChild and @ViewChildren
// ######################################################################################################

// @ViewChild:
// The type returned depends on what you're querying and how you specify the query. Common return types include:
// * ElementRef (when querying a DOM element)
// * ComponentRef (when querying a component)
// * DirectiveRef (when querying a directive)
// * TemplateRef (when querying a template)
// * The actual component or directive type (when querying a component or directive directly)

// @ViewChildren:
// Always returns a QueryList, but the type parameter of QueryList depends on what you're querying. Common return types include:
// * QueryList<ElementRef> (when querying DOM elements)
// * QueryList<ComponentRef> (when querying components)
// * QueryList<DirectiveRef> (when querying directives)
// * QueryList<TemplateRef> (when querying templates)
// * QueryList<ActualComponentType> (when querying components directly)
// * QueryList<ActualDirectiveType> (when querying directives directly)

import { Component, ViewChild, ViewChildren, ElementRef, TemplateRef, ComponentRef, ViewContainerRef, AfterViewInit, QueryList, Directive } from '@angular/core';

@Directive({
  selector: '[exampleDirective]'
})
export class ExampleDirective {
  exampleMethod() { return 'Example method called'; }
}

@Component({
  selector: 'app-child',
  template: '<p>Child Component</p>'
})
export class ChildComponent {
  someChildMethod() { console.log('Child method called'); }
}

@Component({
  selector: 'app-example',
  template: `
    <div #divElement>Hello</div>
    <app-child #childComponent></app-child>
    <p exampleDirective #directiveElement>Directive applied</p>
    <ng-template #templateRef>Template content</ng-template>
    <div #viewContainerRef></div>
    <div class="item">Item 1</div>
    <div class="item">Item 2</div>
    <div class="item">Item 3</div>
    <button (click)="demonstrateAll()">Demonstrate All</button>
  `
})
export class ExampleComponent implements AfterViewInit {
  // @ViewChild examples
  @ViewChild('divElement') divElement!: ElementRef;
  @ViewChild('childComponent', { read: ComponentRef }) childComponentRef!: ComponentRef<ChildComponent>;
  @ViewChild(ExampleDirective) directiveRef!: ExampleDirective;
  @ViewChild('templateRef') templateRef!: TemplateRef<any>;
  @ViewChild(ChildComponent) childComponent!: ChildComponent;
  @ViewChild('viewContainerRef', { read: ViewContainerRef }) viewContainerRef!: ViewContainerRef;

  // @ViewChildren examples
  @ViewChildren('divElement') divElements!: QueryList<ElementRef>;
  @ViewChildren(ChildComponent) childComponents!: QueryList<ChildComponent>;
  @ViewChildren(ExampleDirective) directiveRefs!: QueryList<ExampleDirective>;
  @ViewChildren('templateRef') templateRefs!: QueryList<TemplateRef<any>>;
  @ViewChildren('.item') itemElements!: QueryList<ElementRef>;

  ngAfterViewInit() {
    console.log('View initialized');
    this.demonstrateAll();
  }

  demonstrateAll() {
    // @ViewChild demonstrations
	
    this.divElement.nativeElement.style.color = 'red';
    console.log('ComponentRef:', this.childComponentRef.instance);
    console.log('Directive method:', this.directiveRef.exampleMethod());
    this.viewContainerRef.createEmbeddedView(this.templateRef);
    this.childComponent.someChildMethod();

    // @ViewChildren demonstrations
    
    // ElementRef
    this.divElements.forEach((el, i) => console.log(`Div ${i}:`, el.nativeElement.textContent));
    
    // Component Type
    this.childComponents.forEach((child, i) => {
      console.log(`Child Component ${i}:`);
      child.someChildMethod();
    });
    
    // Directive Type
    this.directiveRefs.forEach((dir, i) => console.log(`Directive ${i}:`, dir.exampleMethod()));
    
    // TemplateRef
    this.templateRefs.forEach((tpl, i) => console.log(`Template ${i}:`, tpl));
    
    // CSS Selector
    this.itemElements.forEach((el, i) => console.log(`Item ${i}:`, el.nativeElement.textContent));
  }
}

//@@@ "read:"

// When you use @ViewChild WITHOUT specifying the read parameter:
@ViewChild('divElement')
divElement!: ElementRef;
// it returns:
// * For components - a direct pointer to the component (you don't need to use .nativeElement).
// * For plain DOM elements (div, button, etc.) - an ElementRef instance (then you would use .nativeElement which is a direct pointer to the element).

// By providing the "read:" parameter, you can specify the type of object you want to retrieve.
// With { read: ComponentRef }, you get a ComponentRef object that contains a reference to the same component instance,
//		along with additional metadata - properties and methods for managing that component:
@ViewChild('childComponent', { read: ComponentRef })
childComponentRef!: ComponentRef<ChildComponent>;

// Example:
@Component({
  selector: 'app-example',
  template: `<app-child #childComponent></app-child>`
})
export class ExampleComponent implements AfterViewInit {
  @ViewChild('childComponent')
  childComponentWithoutRead!: ChildComponent; // without "read:"
  
  @ViewChild('childComponent', { read: ComponentRef })
  childComponentWithRead!: ComponentRef<ChildComponent>; // with "read:"

  ngAfterViewInit() {
    console.log(this.childComponentWithoutRead === this.childComponentWithRead.instance); // this will log: true
  }
}

// In this example, this.childComponent and this.childComponentRef.instance refer to the exact same object in memory -
//		the single instance of ChildComponent that exists in the view.

// By default, the @ViewChildren decorator returns a QueryList of ElementRef if you are querying DOM elements:
@ViewChildren('item')
items!: QueryList<ElementRef>;

ngAfterViewInit() {
	this.items.forEach(item => {
		console.log(item.nativeElement.textContent);
	});
}
  
// However, you can use the { read: ... } option to specify a different type to read, such as ComponentRef:
@ViewChildren(ChildComponent, { read: ComponentRef })
children!: QueryList<ComponentRef>;

ngAfterViewInit() {
	this.children.forEach(child => {
		console.log(child.instance); // access the instance of the child component
	});
}
// QueryList<ComponentRef> is generic type equivalent to QueryList<ComponentRef<any>>
// It represents a list of component references without specifying the exact component type.
// It provides less type safety and fewer compile-time checks.
// You won't get autocomplete or type-checking for properties and methods specific to ChildComponent (no complile-time check of child.instance).
// It's better to use a more specific type, like in the next example:

@ViewChildren(ChildComponent, { read: ComponentRef })
children!: QueryList<ComponentRef<ChildComponent>>;

ngAfterViewInit() {
	this.children.forEach(child => {
		console.log(child.instance); // access the instance of ChildComponent; autocomplete and type chacking are there!
	});
}
// It explicitly states that the QueryList contains references to ChildComponent instances.
// It provides better type safety and more compile-time checks.
// You get autocomplete and type-checking for properties and methods of ChildComponent.

// @@@ Multiple selectors
// @ViewChildren can take multiple selectors, and, respectively, return multiple types:

@ViewChildren('item, app-child')
items!: QueryList<ElementRef | ChildComponent>;

// You can combine different types of selectors:
@ViewChildren('item, app-child, ItemDirective') 
items!: QueryList<ElementRef | ChildComponent | ItemDirective>;

// ######################################################################################################
// ngAfterViewInit
// ######################################################################################################

// @ViewChild and @ViewChildren are resolved (initialized) after the view is fully initialized
// So, the ngAfterViewInit lifecycle hook is the first point to safely work with queried elements:

import { Component, ViewChild } from '@angular/core';
import { ChildComponent } from './child.component';

@Component({
  selector: 'app-parent',
  template: '<app-child #childComp></app-child>'
})
export class ParentComponent {
  @ViewChild('childComp') childComponent!: ChildComponent;

  ngAfterViewInit() {
    console.log(this.childComponent.someProperty);
  }
}
// You cannot change data-bound properties from ngAfterViewInit, see "03 Component Lifecycle Hooks.ts" > "ExpressionChangedAfterItHasBeenCheckedError".

// Don't try to access queried elements in the constructor, ngOnInit, ngAfterContentInit and ngAfterContentChecked that run before ngAfterViewInit!
