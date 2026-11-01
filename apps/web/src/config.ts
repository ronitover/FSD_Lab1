function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `${name} is not set. Copy apps/web/.env.example to apps/web/.env.local and fill it in.`,
    );
  }
  return value;
}

export const config = {
  supabaseUrl: required('VITE_SUPABASE_URL', import.meta.env.VITE_SUPABASE_URL),
  supabasePublishableKey: required(
    'VITE_SUPABASE_PUBLISHABLE_KEY',
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  ),
  // Empty in development: requests go to /api on the same origin and Vite forwards them.
  apiUrl: (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, ''),
};
