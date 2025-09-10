# Angular Demo App

A standalone Angular application built with Angular 19.2.7, demonstrating modern Angular development practices and features.

## Features

- **Standalone Components**: Built entirely with standalone components, no NgModules required
- **Modern Routing**: Function-based route configuration with lazy loading
- **Responsive Design**: Mobile-first approach with modern CSS
- **Interactive Demos**: Counter, form handling, and list management examples
- **TypeScript**: Fully typed with strict mode enabled
- **SCSS**: Modern styling with CSS Grid and Flexbox

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm (comes with Node.js)

### Installation

1. Navigate to the demo-app directory:
   ```bash
   cd demo-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open your browser and navigate to `http://localhost:4200`

## Available Scripts

- `npm start` - Start the development server
- `npm run build` - Build the app for production
- `npm run watch` - Build in watch mode for development
- `npm test` - Run unit tests
- `npm run serve` - Start the development server and open browser

## Project Structure

```
demo-app/
├── src/
│   ├── app/
│   │   ├── pages/
│   │   │   ├── home/           # Home page component
│   │   │   ├── about/          # About page component
│   │   │   └── features/       # Interactive features demo
│   │   ├── app.component.*     # Root component
│   │   └── app.routes.ts       # Route configuration
│   ├── index.html              # Main HTML file
│   ├── main.ts                 # Application bootstrap
│   └── styles.scss             # Global styles
├── angular.json                # Angular CLI configuration
├── package.json                # Dependencies and scripts
└── tsconfig.*.json             # TypeScript configuration
```

## Technology Stack

- **Angular**: 19.2.7
- **TypeScript**: 5.6.0
- **RxJS**: 7.8.0
- **SCSS**: CSS preprocessor
- **Angular CLI**: 19.2.7

## Architecture Highlights

- **Standalone Components**: No NgModules, simplified architecture
- **Lazy Loading**: Route-based code splitting for optimal performance
- **Modern Tooling**: Latest Angular CLI with optimized build pipeline
- **ESM Support**: Full ES modules support for modern JavaScript
- **Type Safety**: Strict TypeScript configuration for better code quality

## Browser Support

This application supports all modern browsers including:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is for demonstration purposes.
