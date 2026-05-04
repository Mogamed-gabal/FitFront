export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:5000',
 
    // apiBaseUrl: 'https://vercel.com/mogamedgabals-projects/fit-proo/FY95Xgdzpk9S2iUzmzShu32oPc5i',
  authEndpoint: '/api/auth',
  supervisorEndpoint: '/api/admin/supervisors',
  permissionsEndpoint: '/api/permissions',
  accessTokenKey: 'auth.accessToken',
  refreshTokenKey: 'auth.refreshToken',
  allowedRoles: ['admin', 'supervisor']
};
