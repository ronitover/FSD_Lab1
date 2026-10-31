import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Placeholder values so the app can start; unit tests never reach Supabase or Nominatim.
    env: {
      NODE_ENV: 'test',
      SUPABASE_URL: 'http://127.0.0.1:54321',
      SUPABASE_PUBLISHABLE_KEY: 'test-publishable-key',
    },
  },
});
