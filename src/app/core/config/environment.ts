export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:5000',
 
  // apiBaseUrl: 'https://fit-proo.vercel.app',
  authEndpoint: '/api/auth',
  supervisorEndpoint: '/api/admin/supervisors',
  permissionsEndpoint: '/api/permissions',
  accessTokenKey: 'auth.accessToken',
  refreshTokenKey: 'auth.refreshToken',
  allowedRoles: ['admin', 'supervisor']
};
