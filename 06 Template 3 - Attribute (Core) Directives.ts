// Attribute Directives (also known as Core directives):
// * Don't change the DOM structure, only modify the behavior or appearance of existing elements
// * Typically used with square brackets [], for examples: [ngModel], [ngClass], [ngStyle]
// * Can have multiple core directives on a single element

// ######################################################################################################
// ### [ngClass]
// ######################################################################################################

// The standard 'class' property of an HTML element (like <div class="...">) contains the CSS class(es) to be applied hardcoded.
// [ngClass] allows to build the value of the 'class' property dynamically - it can add or remove CSS classes based on component logic.

// In the rendered HTML:
//		"[ngClass]" is replaced with "class".
//		Each class name passed to [ngClass]) appears (or doesn't appear) depending on its boolean expression.

// @@@ The string passed to [ngClass]:

// The [ngClass] directive can accept a string which contains a several types of values:

// #1. Object with key-value pairs. In each pair:
// 		* the key is the CSS class name;
// 		* the value is a boolean expression (normally, the component's property or method) which governs wether or not the CSS class must be applied:
@Component({
  selector: 'app-my-component',
  template: `
    <div [ngClass]="{'active': isActive, 'disabled': !isEnabled, 'highlight': isImportant()}">
      Content
    </div>
  `
})
export class MyComponent {
  isActive = true;
  isEnabled = false;

  isImportant(): boolean {
    // You can add any logic here to determine if it's important
    return false;  // For this example, we'll just return false
  }
}
// The rendered HTML:
<div class="active disabled">
  Content
</div>

// #2. List of classes separated by space (in fact, a string which would be the value of the static 'class' property as is):
<div [ngClass]="'class1 class2'">

// #3. Array of classes:
<div [ngClass]="['class1', 'class2']">

// #4. Component method returning any of the above:
<div [ngClass]="getClasses()">
// The method can return not only a string (#2) but also an object (#1) or an array (#3).
// Angular will convert it to a string automatically building #1 from an object and #3 from an array.

// You could ask: Why to pass a list or an Array of strings (#2 and #3) if the classes can be hardcoded without using [ngClass]?
// For static classes, you're correct - it's better to hardcode them in the template without [ngClass]:
<div class="class1 class2">
// However, the classes list can be built programmatically.
// For example, you can call a function (#4) which returns a ready spaces-separated list (#2) or an array (#3).
// Normally, you won't code #2 and #3 manually. They just demonstrate into what the return value of #4 is converted.

// Notice that the Array of classes in #3 can have a mix of static (hardcoded) classes with objects (#1) and dynamic expressions, for example:
<div [ngClass]="['class1', { 'class2': isClass2, 'class3': isClass3 }, 'class4', isClass5() ? 'class5' : '']">
// This div will always have class1 and class4, and it will conditionally have class2, class3 and class5 based on the respective boolean values.

// @@@ Combination of static and dynamic classes:

// When an HTML element has both [ngClass] and a static 'class' attribute, the classes from both sources are combined. Here's how it works:
// 1. The static 'class' attribute classes are applied.
// 2. The classes from [ngClass] are then added.
// 3. If the same class appears in both, it's not duplicated.
<div class="static-class1 static-class2" [ngClass]="{'dynamic-class': isDynamic, 'static-class2': true}">
  Content
</div>
// Assuming `isDynamic` is true, this will render as:
<div class="static-class1 static-class2 dynamic-class">
  Content
</div>
// In this result:
// - 'static-class1' and 'static-class2' from the static class attribute are preserved.
// - 'dynamic-class' from [ngClass] is added.
// - 'static-class2' is not duplicated, even though it appears in both the static attribute and [ngClass].
// This behavior allows for a flexible combination of static and dynamic class application.
// The static classes provide a baseline, while [ngClass] adds or removes classes based on component logic without interfering with the static classes.

// ######################################################################################################
// [ngStyle]
// ######################################################################################################

// Used to dynamically apply inline styles to HTML elements based on component logic.
// It doesn't add or remove CSS properties dynamically, it only changes their values.
// Syntax:
[ngStyle]="expression"
// The expression can be an object, a method returning an object, or a property holding an object.

// 1. Using component's scalar Properties:
export class MyComponent {
	textColor = 'red';
	fontSize = 16;
}
// HTML template - [ngStyle] gets an object with key-value pairs build from the component's scalar Properties:
<div [ngStyle]="{'color': textColor, 'font-size': fontSize + 'px'}">
	Styled text
</div>

// 2. Using a component's Property holding an object with key-value pairs:
export class MyComponent {
	headerStyles = {
		'background-color': '#f0f0f0',
		'padding': '10px',
		'border-radius': '5px'
	};
}
// HTML template - [ngStyle] gets the name of the component's Property holding an object with key-value pairs:
<div [ngStyle]="headerStyles">
	Header content
</div>

// 3. Using a component's Method returning an object with key-value pairs:
export class MyComponent {
	getStyles() {
		return {
			'color': this.isImportant ? 'red' : 'black',
			'font-weight': this.isImportant ? 'bold' : 'normal',
			'font-size': this.textSize + 'px'
		};
	}
	isImportant = true;
	textSize = 18;
}
// HTML template - [ngStyle] gets the name of the component's Method returning an object with key-value pairs::
<div [ngStyle]="getStyles()">
	Dynamically styled content
</div>

// Style property names can be either camelCase or kebab-case:
<div [ngStyle]="{'fontSize': getFontSize()}">
<div [ngStyle]="{'font-size': getFontSize()}">
// The choice between these two formats is largely a matter of personal or team preference. However, there are some considerations:
// * Camel case is more consistent with TypeScript object notation.
// * Kebab case is more consistent with CSS property names.
// Many Angular developers prefer camelCase as it aligns with TypeScript/JavaScript conventions.
// For consistency within your codebase, it's best to choose one style and stick to it.

// Remember to add units for properties that require them:
{'width': width + 'px', 'height': height + '%'}

// [ngStyle] can be used combined with other directives like [ngClass]:
<div [ngClass]="{'active': isActive}" [ngStyle]="{'color': textColor}">
	Content
</div>
// The example will be rendered to the following HTML (supposing isActive = true and textColor = 'red'):
<div class="active" style="color: red;">
  Content
</div>

// Performance Considerations:
//		For static styles, it's more efficient to use regular CSS.
//		Use [ngStyle] only when styles need to be dynamically computed or changed.

// Typescript Type Safety:
//    You can use interfaces for better type checking:

interface Styles {
	'color': string;
	'font-size': string;
}

styleObject: Styles = {
	'color': 'blue',
	'font-size': '20px'
};

// @@@ Combination of static and dynamic styling

// When an HTML element has both [ngStyle] and a static 'style' attribute, the styles will be combined,
//		with [ngStyle] taking precedence for any overlapping properties. Here's how it works:
// 1. The static 'style' attribute is applied first.
// 2. The styles from [ngStyle] are then applied, overwriting any conflicting styles from the static attribute.
// 3. Non-conflicting styles from both sources are preserved.
<div style="color: blue; font-size: 16px;" 
     [ngStyle]="{'color': 'red', 'font-weight': 'bold'}">
  Content
</div>
// This will render as:
<div style="color: red; font-size: 16px; font-weight: bold;">
  Content
</div>
// In this result:
// - 'color: red' from [ngStyle] overwrites 'color: blue' from the static style.
// - 'font-size: 16px' from the static style is preserved.
// - 'font-weight: bold' from [ngStyle] is added.

// For more complex style manipulations, consider using `Renderer2` or direct DOM manipulation.