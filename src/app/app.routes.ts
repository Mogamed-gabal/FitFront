import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth/auth.guard';
import { roleGuard } from './core/guards/auth/role.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./featuers/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    canActivate: [authGuard, roleGuard],
    loadComponent: () =>
      import('./layout/main-layout/main-layout.component').then((m) => m.MainLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./featuers/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./featuers/users/users.component').then((m) => m.UsersComponent),
      },
      {
        path: 'users/client',
        loadComponent: () =>
          import('./featuers/users/client/client.component').then((m) => m.ClientComponent),
      },
      {
        path: 'users/doctor',
        loadComponent: () =>
          import('./featuers/users/doctor/doctor.component').then((m) => m.DoctorComponent),
      },
      {
        path: 'users/blocked',
        loadComponent: () =>
          import('./featuers/users/blocked-users/blocked-users.component').then((m) => m.BlockedUsersComponent),
      },
      {
        path: 'requests',
        loadComponent: () =>
          import('./featuers/requests/requests.component').then((m) => m.RequestsComponent),
      },
      {
        path: 'requests/joining',
        loadComponent: () =>
          import('./featuers/requests/components/joining-requests/joining-requests.component').then((m) => m.JoiningRequestsComponent),
      },
      {
        path: 'requests/withdrawl',
        loadComponent: () =>
          import('./featuers/requests/components/withdrawl-requests/withdrawl-requests.component').then((m) => m.WithdrawlRequestsComponent),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
