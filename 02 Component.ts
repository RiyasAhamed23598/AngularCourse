// Angular applications are made up of components.
// A component is the combination of an HTML template and a TypeScript class that controls a portion of the screen.

// Components are responsible for rendering the UI by combining the template and data.
// They bind data from the component's class to the template, allowing dynamic rendering of content.

// Components handle user interactions and respond to events such as button clicks, form submissions, and more.
// They can define event handlers in the component's class to execute specific actions or trigger changes in the application.

// Components have lifecycle hooks, which are pre-defined methods that are called at specific stages of a component's lifecycle.
// Lifecycle hooks allow performing actions at various points, such as initialization, changes detection, and destruction.

// Components can communicate with other components using input and output properties.
// Input properties allow passing data into a component.
// Output properties emit events to notify parent components about specific actions or changes.

// Components can be organized in a hierarchical structure, where parent components contain child components.
// This allows creating complex UI layouts and establishing relationships between components for communication and data sharing.

// Usually, a component consists of 3 files:
// 		1. TypeScript Class: Contains the component's logic, properties, and methods.
//			The class is responsible for handling data, responding to events, and interacting with other components or services.
// 		2. Template (optional): Components have an associated template that defines the layout of the user interface.
//			Templates are written in HTML with additional Angular-specific syntax and directives.
// 		3. CSS styles (optional).

// Components encapsulate the rendering logic, data, and styles in a single unit, making it easier to manage and reuse UI elements across the app.

// ######################################################################################################
// Component Class
// ######################################################################################################

// The component class is where you define the logic and data for the component.
// It is a TypeScript class decorated with the @Component decorator.
// The @Component decorator is used to define metadata (additional configuration information) for the component:

import { Component } from '@angular/core';

@Component({
  selector: 'app-example', // a custom HTML tag which identifies this component; used to instantiate and render the component
  templateUrl: './example.component.html', // the path to the external HTML file (if exists)
  styleUrls: ['./example.component.css'] // an array of paths to external CSS files for the component's styles (if exist)
})
export class ExampleComponent {
  // Component logic and data go here:
  title = 'Hello, Angular!';
}

// REMARK: Notice the import statement. It must be in each file which declares a component.
// Components are very common, so they will be used a lot in this course.
// To make examples shorter, the "import { Component }" statement will be usually omitted.

// The component's properties are explained below.

// ######################################################################################################
// selector
// ######################################################################################################

// The selector specifies the custom HTML tag that is used to represent the component in the templates of other components.
// Essentially, it tells Angular where to instantiate the component in the DOM.

<!-- app.component.html -->
<app-hello-world></app-hello-world>

// When Angular renders the other template, it will replace the app-hello-world tag with the whole content of HTML template of HelloWorldComponent.

// IMPORTANT! The selector for each component should be unique across your Angular application to avoid conflicts and unexpected behavior.
// If multiple components use the same selector, Angular will encounter a conflict because it won't know which component to apply.

// ######################################################################################################
// templateUrl
// ######################################################################################################

// Template is the .html file which defines the HTML structure of the component.

// Example for ExampleComponent:
<!-- example.component.html -->
<h1>{{ title }}</h1>

// ######################################################################################################
// styleUrls
// ######################################################################################################

// By "styles" we mean CSS classes which override the existing default CSS classes for this specific component only.
// If a CSS class is not in the .css file, its default definition is used.

// Example for ExampleComponent:
<!-- example.component.css -->
h1 {
  color: blue;
}

// ######################################################################################################
// Inline Template & Styles
// ######################################################################################################

// Usually, the template and styles are stored in separate .html and .css files, as described above.
// But, instead of the "templateUrl" and "styleUrls" properties, you can use the "template" and "styles" properties
//      and write HTML and CSS code directly within them:

@Component({
  selector: 'app-example',
  template: `<h1>{{ title }}</h1>`,
  styles: [`h1 { color: blue; }`]
})
export class ExampleComponent {
  title = 'Hello, Angular!';
}

// This practice is not commonly used.

// ######################################################################################################
// Standalone components
// ######################################################################################################

// In Angular, components are traditionally part of an NgModule.
// This means they are declared in the declarations array of an Angular module,
// 		and the module is responsible for managing the component's lifecycle and dependencies.
// However, Angular 14 introduced the concept of "standalone components,"
// 		which allow components to be used without being declared in an NgModule.
// They are self-contained and declare their dependencies directly in the component itself
// 		providing more flexibility and simplicity in managing components. 

// A standalone component is a component that sets
standalone: true
// in its @Component metadata:
@Component({
  standalone: true,
  imports: [CommonModule] // declare dependencies directly in the component, which otherwise would be done in the module
  selector: 'profile-photo',
  template: `...the HTML fragment...`
})
export class ProfilePhoto {
  ...
}

// If you see components that do not have "standalone: true" and are not explicitly mentioned in an NgModule, it's likely that:
// * They are declared in an NgModule, but you may not see it directly if you are looking at isolated files or snippets.
// * They might be declared in a shared or feature module, which is then imported into the root module or other modules.

// @@@ Key Differences and Advantages

// Here’s a look at what standalone components can do that non-standalone components cannot:

// 1. No Need for NgModule:
//   - Standalone Components can be used independently without being declared in an Angular module (`@NgModule`).
//		This simplifies the component setup, especially for smaller applications or individual components.
//   - Non-Standalone Components must be declared in an Angular module to be used.

// 2. Simplified Imports:
//	- Standalone Components import necessary Angular features (such as directives and pipes) directly within the component using the `imports` array.
//		This makes the component self-contained.
//   - Non-Standalone Components rely on the module to import and provide necessary features, which can lead to more complex dependency management.

// 3. Faster Development and Prototyping:
//  - Standalone Components allow for rapid development and prototyping by reducing the boilerplate code and simplifying the component setup.
//		This can be particularly useful in small projects or during the initial stages of development.

// 4. Decoupled and Reusable:
//   - Standalone Components are highly decoupled from the rest of the application, making them more reusable and easier to integrate
//		into different projects or parts of an application without additional setup.

// 5. Improved Code Organization:
//   - Standalone Components promote better code organization by allowing developers to keep the component logic and dependencies together.
//		This leads to more maintainable and understandable codebases.

// The shift to standalone components provides more flexibility and simplifies the development process.
// The Angular team recommends using standalone components for all new development.

// For more information, you can refer to the Angular documentation: https://angular.io/guide/standalone-components

// ######################################################################################################
// Dependency Injection (DI)
// ######################################################################################################

// DI is a design pattern where a class receives its dependencies from external sources rather than creating them itself.
// Classes such as components and services request their dependencies through their constructor parameters.
// The DI framework then provides these dependencies when the class is instantiated.

// When the injectable service is requested for the first time, Angular creates its singleton and passees it to the requestor's constructor.
// Then this singleton is re-used in subsequent injections.

// The @Injectable decorator tells Angular that this class can be injected as a dependency.
// The { providedIn: 'root' } means that Angular will provide this service at the root level, making it a singleton across the entire application:

// logger.service.ts
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoggerService {
  log(message: string) {
    console.log('LoggerService:', message);
  }
}

// app.component.ts
import { Component } from '@angular/core';
import { LoggerService } from './logger.service';

@Component({
  selector: 'app-root',
  template: `<h1>Welcome to Dependency Injection in Angular</h1>`,
})
export class AppComponent {
  constructor(private logger: LoggerService) { // <<<<<<< inject the service
    this.logger.log('AppComponent initialized');
  }
}

// REMARK: since { providedIn: 'root' } the @Injectable() decorator makes the service available application-wide,
// 		adding the service to the providers array of the root module is unnecessary and redundant.

// ######################################################################################################
// The CLI command to create a new component
// ######################################################################################################

ng generate component my-component
ng g c my-component

// @@@ Working Directory:
// You should run this command from the root directory of your Angular project (where the `angular.json` file is located).
// However, Angular CLI is smart enough to find the right location even if you're in a subdirectory of your project.

// @@@ Created Files and Location:
// By default, this command will create a new folder named `my-component` inside the `src/app` directory of your project.
// Inside this folder, it will generate four files:

src/
└── app/
    └── my-component/
        ├── my-component.component.ts
        ├── my-component.component.html
        ├── my-component.component.css
        └── my-component.component.spec.ts

// my-component.component.ts
// 		The TypeScript file containing the component class.
// my-component.component.html
// 		The HTML template file for the component.
// my-component.component.css (or `.scss`, `.less`, `.sass` depending on your project setup):
// 		The stylesheet file for component-specific styles.
// my-component.component.spec.ts
// 		A basic unit test file for the component.

// @@@ Additional Actions:
// - The CLI will automatically add the new component to the declarations array of the nearest module (usually `app.module.ts`).
// - It will generate a selector for the component, typically in the format `app-my-component`.

// @@@ Customizing the Command:

// - You can specify a different location by providing a path:
ng generate component path/to/my-component

// - You can use the `--flat` flag to prevent creating a new folder:
ng generate component my-component --flat
// The files will be created in `src/app` rather than `src/app/my-component`:
src/
└── app/
    ├── my-component.component.ts
    ├── my-component.component.html
    ├── my-component.component.css
    └── my-component.component.spec.ts

// - Use `--skip-tests` to skip generating the spec file:
ng generate component my-component --skip-tests

// Remember, you can always run `ng generate component --help` to see all available options for this command.