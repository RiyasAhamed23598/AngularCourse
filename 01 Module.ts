// https://v2.angular.io/docs/ts/latest/guide/ngmodule.html

// An Angular Module is a class marked by the decorator @NgModule which describes how the application parts fit together.

// A module consolidates components, directives, and pipes into a cohesive blocks of functionality
// 		focused on a feature area, specific application domain, workflow, a closely related set of capabilities or common collection of utilities.

// Modules are a great way to:
// * structure and organize an application for better maintainability, scalability, and efficiency;
// * handle dependencies and services;
// * extend an application with capabilities from external libraries.

// Many Angular libraries are modules (such as FormsModule, HttpModule, and RouterModule).
// Many third-party libraries are available as NgModules (such as Material Design, Ionic, AngularFire2).
	
//### Key Features of Angular Modules:

// 1. **Organization**:
// Angular modules allow you to manage and encapsulate components, services, directives, and pipes into a cohesive unit.
// This helps in organizing the code and makes the application easier to manage as it grows.

// 2. **Decomposition**:
// Large applications can be broken down into smaller, manageable, and more focused modules.
// For instance, you might have a `UserModule` for user-related components and services, and a `ProductModule` for product management features.

// 3. **Reusability**:
// By encapsulating functionality within modules, you can easily reuse them across different parts of your app or even across different apps.
// This modular architecture promotes reusability and DRY (Don't Repeat Yourself) principles.

// 4. **Lazy Loading**:
// Modules can be loaded on demand rather than loading all at once when the application starts.
// This technique, known as lazy loading, helps in speeding up the initial load time of the application, as modules are only loaded when needed.

// 5. **Providers Scope**:
// Services can be provided in Angular modules, which can scope their availability to the module instead.
// For example, if a service is provided in a module that is lazily loaded,
//		a new instance of the service will be created and used by all components within that module.

//### Anatomy of an Angular Module:

// Here’s a basic example of an Angular module:

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MyComponent } from './my.component';

@NgModule({
  declarations: [
    MyComponent  // declare all components, directives, and pipes that belong to this module
  ],
  imports: [
    CommonModule, // includes common directives like *ngIf, *ngFor
    FormsModule  // is required if you're using template-driven forms
  ],
  providers: [
    // List of injectable services that components in this module might need.
	// While providers can be declared in any module, app-wide services are typically provided in the app root module.
  ],
  exports: [
    MyComponent // components, directives, or pipes that modules that import this module can use
  ]
})
export class MyModule {}

//### Usage:

// declarations:
//		This property is used to define which components, directives, and pipes belong to the module.
// imports:
//		It lists the modules with the components, directives, and pipes needed by the components in the current module.
//		Is used to import other Angular modules into the current module.
//		All the declarations (components, directives, pipes) and providers (services) that are exported by the imported module
//		become available to the components and services that are declared within the importing module.
// providers:
//		Defines the service providers. The Angular Injector creates a singleton instance of these services, available to all components in the module.
// exports:
//		This property is used to make some of the components, directives, and pipes available to other modules.

// @@@ Angular's @NgModule() imports and TypeScript import are entirely different concepts

// The imports array in an NgModule makes the exported declarations of other modules available to the current module.
// However, it does not automatically make these imported features available in the classes listed in the declarations array of the same module.
// Instead, the imports array allows the current module to use the features (such as components, directives, and pipes)
// 		exported by the imported modules within its own components, directives, and pipes.
	
// Components, directives, or pipes declared in the declarations array of a module can use the features from the modules listed in the imports array.
// However, this does not mean that these imported features are automatically available in each function of the declared classes.
// Instead, they are available to be used within the templates of the components declared in that module.

// Therefore, while the imports array provides access to the necessary features for the components declared in the module,
// 		it does not eliminate the need to import specific dependencies in each component or service file as needed for their implementation

//### THE ROOT MODULE: AppModule

// Every Angular application has at least one module class, the root module which tells Angular how to construct the application.
// You bootstrap that module to launch the application.
// You can call it anything you want. The conventional name is AppModule.
// In contrast to feature modules, the root module has the bootstrap property - it identifies the bootstrap component.

// The root module is all you need in a simple application with a few components.
// As the application grows, you refactor the root module into feature modules that represent collections of related functionality.
// You then import these modules into the root module.

// Here is a minimal root module:

// src/app/app.module.ts
import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent }  from './app.component';

@NgModule({
  imports:      [ BrowserModule ],
  declarations: [ AppComponent ],
  bootstrap:    [ AppComponent ]
})
export class AppModule { }

// Every browser app must import BrowserModule which registers critical application service providers.
// It's essential for running your app in a browser and should be imported only once in your entire application, specifically in the `AppModule`.
// Other (non-root) modules typically use `CommonModule` instead of `BrowserModule`.

// The declarations list identifies the application's only component, the root component, the top of the app's rather bare component tree.

// The bootstrap property contains the root component that Angular creates and inserts into the index.html host web page.

// The example AppComponent simply displays a data-bound title:
@Component({
  selector: 'my-app',
  template: '<h1>{{title}}</h1>',
})
export class AppComponent {
  title = 'Minimal NgModule';
}
// When Angular launches the app, it places the HTML of the template in the DOM, inside the <my-app> element tags of the index.html.

// @@@ How Does Angular Know Which Module is the Root Module?

// Through the bootstrapping mechanism defined in main.ts. Here’s how it typically looks:
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));

// The platformBrowserDynamic().bootstrapModule(AppModule) call in main.ts explicitly specifies AppModule class as the root module.
// This function call starts the application with AppModule as the entry point,
// 		kicking off the Angular bootstrapping process that loads the initial component specified in the bootstrap array.
// Obviously, the class, passed to platformBrowserDynamic().bootstrapModule(), MUST be in the bootstrap property of the root module.

// @@@ Root-level routing:
// If you're using routing, the root `RouterModule.forRoot()` is declared in the `AppModule`.

import { RouterModule } from '@angular/router';

@NgModule({
 imports: [RouterModule.forRoot(routes)],
 // ...
})
export class AppModule { }

// Other (non-root) modules use `RouterModule.forChild()` if they have routes.

//### The CLI command to create a new module

ng generate module my-module
ng g m my-module

// @@@ Working Directory:
// You should ideally run this from the root directory of your Angular project (where the `angular.json` file is located).
// However, the Angular CLI is designed to work from any subdirectory within your project.

// @@@ Created File and Location:
// By default, this command will create a new folder named `my-module` inside the `src/app` directory of your project.
// Inside this folder, it will generate one file containing the module class:
src/
└── app/
    └── my-module.module.ts

// The generated module will look something like this:

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@NgModule({
 declarations: [],
 imports: [
   CommonModule
 ]
})
export class MyModuleModule { }

// @@@ Customizing the Location:
// You can specify a location different from `src/app` by providing a path:
ng generate module path/to/my-module

// If the path is relative (doesn't start with the drive letter), the module folder will be created under `src/app`:
ng g m my-module

src/
└── app/
    └── my-module/
        └── my-module.module.ts

// @@@ --routing
// Adds a routing module. For example:
ng g m my-module --routing
// Use the `--routing` flag if you want to create a module with its own routing configuration.

// @@@ --module=<module-name>
// Unlike components, generating a module does not automatically import it into any other module.
// You'll need to either manually import it where needed (typically in the `AppModule` or another feature module) or create it using --module.
// This parameter tells the Angular CLI to add the newly created module to the imports array of the specified module.
// <module-name> should be the name of the TypeScript file without the .module.ts extension (not the class name!!!).

// Example:
ng g m my-feature --module=app
// This command will:
// 1. Create a new module file my-feature.module.ts with the MyFeatureModule class.
// 2. Automatically imports MyFeatureModule into app.module.ts and add it to the imports array of its @NgModule decorator:
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { MyFeatureModule } from './my-feature/my-feature.module'; // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    MyFeatureModule // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
// The --module parameter saves you the step of manually importing and adding the new module to the imports array of the parent module,
//		reducing the chance of errors and saving time.

// If the module, to which you want to add the newly created module, is in a subfolder, you need to include the path relative to src/app.
// The CLI will look for a file named <module-name>.module.ts in your project structure.
// For example, if you have a structure like this:
src/
└── app/
    ├── features/
    │   └── user/
    │       └── user.module.ts
    ├── shared/
    │   └── shared.module.ts
    └── app.module.ts
// You could use any of these:
ng g m new-feature --module=app
ng g m new-feature --module=shared/shared
ng g m new-feature --module=features/user/user

// If the specified module doesn't exist, the CLI will throw an error.
// The module name is case-sensitive and should match exactly how it's named in your project.

// After creating a module, you might want to generate components within that module using the `--module` parameter
//		to automatically declare them in the new module:

ng g c my-module/my-component --module=my-module

// Remember, you can always run `ng generate module --help` to see all available options for this command.