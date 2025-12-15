# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Angular 21 application for creating budgets and tracking spending on Christmas lists for different recipients. The app helps users manage their holiday gift-giving by organizing recipients, setting budgets, and monitoring expenses.

The project uses standalone components (no NgModules), Vitest for unit testing, and Tailwind CSS v4 for styling.

## Development Commands

### Start Development Server
```bash
npm start
# or
ng serve
```
Server runs at `http://localhost:4200/` with hot reload enabled.

### Build
```bash
ng build                    # Production build (outputs to dist/)
ng build --watch --configuration development  # Watch mode for development
```

### Testing
```bash
ng test                     # Run all tests with Vitest
```

### Code Generation
```bash
ng generate component component-name
ng generate --help          # See all available schematics
```

## Architecture

### Application Structure
- **Entry Point**: [src/main.ts](src/main.ts) bootstraps the standalone App component
- **Root Component**: [src/app/app.ts](src/app/app.ts) - uses signals for state management
- **Configuration**: [src/app/app.config.ts](src/app/app.config.ts) provides global app configuration including routing and error listeners
- **Routing**: [src/app/app.routes.ts](src/app/app.routes.ts) - currently empty, routes defined here

### Key Patterns
- **Standalone Components**: All components use the standalone API (no NgModules)
- **Signals**: Use Angular signals for reactive state (e.g., `signal()`, not traditional RxJS for component state)
- **Component Naming**: The root component is named `App` (not `AppComponent`) - follow this pattern for new components if established
- **File Structure**: Each component has separate files for TypeScript, HTML, and CSS (`.ts`, `.html`, `.css`)

### Styling
- Uses Tailwind CSS v4 (configured via [.postcssrc.json](.postcssrc.json))
- Global styles in [src/styles.css](src/styles.css)
- Component-specific styles in component `.css` files

### Testing
- Test framework: Vitest (not Karma/Jasmine)
- Test files: `*.spec.ts` files colocated with components
- Configuration uses Angular's `@angular/build:unit-test` builder

## Configuration Files
- [angular.json](angular.json): Angular CLI project configuration, defines build/serve/test targets
- [tsconfig.json](tsconfig.json): Base TypeScript configuration
- [tsconfig.app.json](tsconfig.app.json): App-specific TypeScript settings
- [tsconfig.spec.json](tsconfig.spec.json): Test-specific TypeScript settings
- [package.json](package.json): Contains Prettier config (printWidth: 100, singleQuote: true, angular parser for HTML)