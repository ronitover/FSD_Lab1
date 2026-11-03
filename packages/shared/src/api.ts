export interface HealthResponse {
  status: 'ok';
  uptimeSeconds: number;
}

/** Shape of every error the API returns, so the web app can show `message` directly. */
export interface ApiError {
  error: {
    code: string;
    message: string;
  };
}
