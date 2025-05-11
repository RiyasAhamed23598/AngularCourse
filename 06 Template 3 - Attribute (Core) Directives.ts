// Attribute Directives (also known as Core Directives):
// * Don't change the DOM structure, only modify the behavior or appearance of existing elements
// * In contrast to Structural Directives (which change the DOM layout), Core Directives are not prefixed with an asterisk (*) or pound (@).
// 		Instead, they are typically used with square brackets [], for examples: [ngModel], [ngClass], [ngStyle]
// * Can have multiple core directives on a single element

// ######################################################################################################
// ### [ngClass]
// ######################################################################################################

// The standard 'class' property of an HTML element (like <div class="...">) contains hardcoded CSS class(es) to be applied.
// If the classes are known in compile time, you would simply assign them to "class":
<div class="class1 class2">

// [ngClass] allows to build the value of the 'class' property dynamically - it can add or remove CSS classes based on component logic:
<img [ngClass]="<the logic for adding and removing classes>" />

// In the rendered HTML:
//		"[ngClass]" is replaced with "class".
//		Each class name passed to [ngClass]) appears (or doesn't appear) depending on its boolean expression.

// In fact, [ngClass] is a special case of the Property binding.
// Property binding will be described in https://github.com/Ursego/AngularCourse/blob/main/07%20Data%20Binding.ts soon.
// But I'll tell you in advance that the Property binding syntax is
[html_property]="component_variable_or_method"
// like
<img [src]="image1Url" />
// or
<div [class]="getButtonClasses()"></div>
// For the last example, getButtonClasses() could return something like: "btn btn-lg btn-primary" or "btn btn-sm btn-secondary disabled"

// So, if we have [class] which accepts a CSS classes list built dinamically, why to use [ngClass]?
// There are some differences between them:

// [class]
// 		You must provide a complete string that will be assigned to the "class" property as is. This follows the standard behavior of Property binding.
//		The string must be a space-separated list of CSS classes, and nothing else.
// 		It completely replaces the previous value of the "class" property, removing any static classes that existed on the element but aren't included in the new string.

// [ngClass]
// 		Much more flexible.
// 		Adds/removes classes dynamically depending on logical conditions, merging them with existing static classes (rather than deleting).
// 		Can accept a string which contains several types of values: a plain string with a space-separated list of CSS classes, an array, or an object.
// 		It can contain logic (like the ternary operator), and access fields and methods of the component (usually boolean).
// 		That is explained in details next.

// @@@ The string passed to [ngClass] can be:

// #1. List of classes separated by space (in fact, a string which contains a string which will be the value of the static 'class' property as is):
<div [ngClass]="'class1 class2'">
// That is similar to [class] but the whole list is ornamented by addidional quotes - the outer string contains an inner string be rendered as is
// (you want to render [class]='class1 class2', not [class]=class1 class2).

// #2. Array of classes:
<div [ngClass]="['class1', 'class2']">
// This is convenient because it simplifies the function returning such a string — the function just dynamically builds and returns an array of classes
// without worrying about concatenating them into a single string (Angular will handle that).
// Notice that the array can have a mix of static (hardcoded) classes with objects and dynamic expressions, for example:
<div [ngClass]="['class1', { 'class2': isClass2, 'class3': isClass3 }, 'class4', isClass5() ? 'class5' : '']">
// This div will always have class1 and class4, and it will conditionally have class2, class3 and class5 based on the respective boolean values.

// #3. Object with key-value pairs:
<div [ngClass]="{'active': isActive, 'disabled': !isEnabled, 'highlight': isImportant()}">
// In each pair:
// 		* the key is the CSS class name;
// 		* the value is a boolean expression (normally, the component's property or method) which governs wether or not the CSS class must be applied

// REMARK REGARDING #1, #2 AND #3:
// In fact, you will never assign a hardcoded string to [ngClass] as shown in #1 and #2.
// Their examples only demonstrate values which are normally built dynamically and returned by a method of the component class. That is the subject of #4.
// The pattern of #3 can be used with the string hardcoded - the actual classes are still built dynamically by the boolean expressions.
// But it's better to incapsulate the logic in a method which retrns the dictionary's values as true and false - try to minimize logic in HTML templates.

// #4. Component method returning any of the above:
<div [ngClass]="getClasses()">
// This pattern
[ngClass]="<a method returning either #1, #2 or #3>")
// is what you will use in real work.

// A sample getClasses() method which returns a string which describes an object
// (of course, the ):
@Component({
	selector: 'app-my-component',
	template: 'app-my-template'
  })
  export class MyComponent {
	isActive = true;
	isEnabled = false;
  
	isImportant(): boolean {
	  return false;  // in this example, we'll just return false for simplicity
	}
  
	getClasses(): string {
	  return JSON.stringify({
		active: this.isActive,
		disabled: !this.isEnabled,
		highlight: this.isImportant()
	  });
	}
  }

// getClasses() will return the next string:
{"active":true,"disabled":true,"highlight":false}

// Then the actual rendered HTML would be:
<div class="active disabled">Content here</div>
// As you see, highlight is not rendered since it's false.

// In the example above, the getClasses() method returned a string which DESCRIBED an object.
// However, the method could return the object itself:

getClassObject(): { [key: string]: boolean } {
	return {
	  active: this.isActive,
	  disabled: !this.isEnabled,
	  highlight: this.isImportant()
	};
  }

// The type it returns
{ [key: string]: boolean }
// is a TypeScript index signature.
// It indicates that the function returns an object where the keys are strings and the values are boolean.
// If the values could be of other types too, you would use something like "boolean | string" or "boolean | string | number").
// "key" is not actually used in the code but serves as a placeholder name for the key in the index signature.
// You can use any name for the placeholder in the index signature, not just "key". For example:
{ [property: string]: any }
{ [prop: string]: any }

// When [ngClass] gets an object itself, it interprets it and renders the same HTML as if would for a string describing the object:
<div class="active disabled">Content here</div>

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