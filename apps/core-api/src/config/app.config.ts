const envValue = (key: string, fallback = '') => {
  const value = process.env[key]?.trim();

  return value || fallback;
};

export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  corsOrigins: process.env.CORS_ORIGINS ?? '',
  jwtSecret: process.env.JWT_SECRET ?? '',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ?? '',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '30d',
  throttleTtlMs: parseInt(process.env.THROTTLE_TTL_MS ?? '60000', 10),
  throttleLimit: parseInt(process.env.THROTTLE_LIMIT ?? '120', 10),
  authLoginThrottleTtlMs: parseInt(
    process.env.AUTH_LOGIN_THROTTLE_TTL_MS ?? '60000',
    10,
  ),
  authLoginThrottleLimit: parseInt(
    process.env.AUTH_LOGIN_THROTTLE_LIMIT ?? '5',
    10,
  ),
  publicMenuBaseUrl: envValue('PUBLIC_MENU_BASE_URL', 'https://kmrs.tech'),
  publicMenuPathPrefix: envValue('PUBLIC_MENU_PATH_PREFIX'),
  paymentService: {
    baseUrl: envValue('PAYMENT_SERVICE_URL', 'http://localhost:8083'),
    token: envValue('PAYMENT_SERVICE_TOKEN'),
  },
  spaces: {
    endpoint: envValue('DO_SPACES_ENDPOINT'),
    region: envValue('DO_SPACES_REGION'),
    bucket: envValue('DO_SPACES_BUCKET'),
    accessKeyId: envValue('DO_SPACES_KEY'),
    secretAccessKey: envValue('DO_SPACES_SECRET'),
    publicUrl: envValue('DO_SPACES_PUBLIC_URL'),
  },
});
