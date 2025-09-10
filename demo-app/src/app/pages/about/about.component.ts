import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="about-container">
      <h1>About This Demo App</h1>

      <section class="intro">
        <p>
          This is a standalone Angular application created to demonstrate modern
          Angular development practices using Angular 19.2.7. The application
          showcases the latest features and architectural patterns recommended
          by the Angular team.
        </p>
      </section>

      <section class="tech-stack">
        <h2>Technology Stack</h2>
        <div class="tech-grid">
          <div class="tech-item" *ngFor="let tech of technologies">
            <h3>{{ tech.name }}</h3>
            <p>{{ tech.version }}</p>
            <span class="tech-description">{{ tech.description }}</span>
          </div>
        </div>
      </section>

      <section class="features">
        <h2>Key Features</h2>
        <ul class="feature-list">
          <li *ngFor="let feature of keyFeatures">
            <strong>{{ feature.title }}:</strong> {{ feature.description }}
          </li>
        </ul>
      </section>

      <section class="architecture">
        <h2>Architecture Highlights</h2>
        <div class="architecture-points">
          <div class="point" *ngFor="let point of architecturePoints">
            <div class="point-icon">{{ point.icon }}</div>
            <div class="point-content">
              <h3>{{ point.title }}</h3>
              <p>{{ point.description }}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styleUrls: ['./about.component.scss'],
})
export class AboutComponent {
  technologies = [
    {
      name: 'Angular',
      version: '19.2.7',
      description: 'Modern web framework with standalone components',
    },
    {
      name: 'TypeScript',
      version: '5.6.0',
      description: 'Strongly typed JavaScript superset',
    },
    {
      name: 'RxJS',
      version: '7.8.0',
      description: 'Reactive programming library',
    },
    {
      name: 'SCSS',
      version: 'Latest',
      description: 'CSS preprocessor for enhanced styling',
    },
  ];

  keyFeatures = [
    {
      title: 'Standalone Components',
      description: 'No NgModules required, simplified architecture',
    },
    {
      title: 'Lazy Loading',
      description: 'Route-based code splitting for optimal performance',
    },
    {
      title: 'Modern Routing',
      description: 'Function-based route configuration',
    },
    {
      title: 'Responsive Design',
      description: 'Mobile-first approach with CSS Grid and Flexbox',
    },
    {
      title: 'ESM Support',
      description: 'Full ES modules support for modern JavaScript',
    },
  ];

  architecturePoints = [
    {
      icon: '🏗️',
      title: 'Standalone Architecture',
      description:
        'Built entirely with standalone components, eliminating the need for NgModules and simplifying the application structure.',
    },
    {
      icon: '⚡',
      title: 'Performance Optimized',
      description:
        'Implements lazy loading, tree shaking, and modern build optimizations for fast loading times.',
    },
    {
      icon: '🎨',
      title: 'Modern Styling',
      description:
        'Uses SCSS with CSS Grid, Flexbox, and modern CSS features for responsive and maintainable styles.',
    },
    {
      icon: '🔧',
      title: 'Developer Experience',
      description:
        'Configured with TypeScript strict mode, ESLint, and modern tooling for excellent developer experience.',
    },
  ];
}
