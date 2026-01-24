// Environment configuration

interface EnvConfig {
  apiBaseUrl: string;
  isDevelopment: boolean;
  isProduction: boolean;
  apiTimeout: number;
}

export const envConfig: EnvConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  apiTimeout: 30000, // 30 seconds
};
