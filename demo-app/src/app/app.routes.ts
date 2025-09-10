import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'about',
    loadComponent: () =>
      import('./pages/about/about.component').then((m) => m.AboutComponent),
  },
  {
    path: 'features',
    loadComponent: () =>
      import('./pages/features/features.component').then(
        (m) => m.FeaturesComponent,
      ),
  },
  {
    path: 'components',
    loadComponent: () =>
      import('./pages/components/components.component').then(
        (m) => m.ComponentsComponent,
      ),
  },
  {
    path: 'legacy',
    loadComponent: () =>
      import('./pages/legacy/legacy.component').then((m) => m.LegacyComponent),
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./pages/profile/profile.component').then(
        (m) => m.ProfileComponent,
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
