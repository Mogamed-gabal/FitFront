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
        path: 'users/deletd',
        loadComponent: () =>
          import('./featuers/users/deletd-users/deletd-users.component').then((m) => m.DeletdUsersComponent),
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
      {
        path: 'supervisor',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./featuers/supervisor/supervisor.component').then((m) => m.SupervisorComponent),
          },
          {
            path: ':id',
            children: [
              {
                path: '',
                loadComponent: () =>
                  import('./featuers/supervisor/components/supervisor-details/supervisor-details/supervisor-details.component').then((m) => m.SupervisorDetailsComponent),
              },
              {
                path: 'permissions-panel',
                loadComponent: () =>
                  import('./featuers/supervisor/components/supervisor-details/permissions-panel/permissions-panel.component').then((m) => m.PermissionsPanelComponent),
              },
              {
                path: 'audit',
                loadComponent: () =>
                  import('./featuers/supervisor/components/supervisor-details/audit/audit.component').then((m) => m.AuditComponent),
              }
            ]
          }
        ]
      },
      {
        path: 'plans-monitoring',
        loadComponent: () =>
          import('./featuers/plans-monitoring/plans-monitoring.component').then((m) => m.PlansMonitoringComponent),
      },
            {
        path: 'audit',
        loadComponent: () =>
          import('./featuers/audit/audit-logs/audit-logs.component').then((m) => m.AuditLogsComponent),
      },
      {
        path: 'supervisor-audit',
        loadComponent: () =>
          import('./featuers/supervisor/components/supervisor-details/audit/audit.component').then((m) => m.AuditComponent),
      },
      {
        path: 'admin-chat',
        loadComponent: () =>
          import('./featuers/admin-chat/pages/chat-dashboard/chat-dashboard.component').then((m) => m.ChatDashboardComponent),
      },
      {
        path: 'subscription',
        loadComponent: () =>
          import('./featuers/subscription/subscription.component').then((m) => m.SubscriptionComponent),
      },
      {
        path: 'bundles',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./featuers/users/bundles/pages/bundles-list/bundles-list.component').then((m) => m.BundlesListComponent),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./featuers/users/bundles/pages/bundle-details/bundle-details.component').then((m) => m.BundleDetailsComponent),
          },
        ],
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
