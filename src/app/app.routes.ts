import { Routes } from '@angular/router';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'hotel-portal/dashboard',
  },
  {
    path: 'hotel-portal/login',
    canActivate: [guestGuard('restaurant_owner', '/hotel-portal/dashboard')],
    loadComponent: () =>
      import('./features/auth/components/hotel-login/hotel-login.component')
        .then((m) => m.HotelLoginComponent),
  },
  {
    path: 'auth/hotel-login',
    pathMatch: 'full',
    redirectTo: 'hotel-portal/login',
  },
  {
    path: 'hotel-portal',
    loadChildren: () =>
      import('./features/hotel-portal/hotel-portal.routes')
        .then((m) => m.HOTEL_PORTAL_ROUTES),
  },
  {
    path: 'legal',
    loadChildren: () =>
      import('./features/legal/legal.routes').then((m) => m.LEGAL_ROUTES),
  },
  {
    path: '**',
    redirectTo: 'hotel-portal/dashboard',
  },
];
