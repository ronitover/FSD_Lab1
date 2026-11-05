import { createContext, useContext } from 'react';

/** A point on screen, in client (viewport) pixels. */
export interface ScreenPoint {
  x: number;
  y: number;
}

/**
 * How the sign-in screens' form fields tell the mascot what is going on: where the text cursor
 * is while someone types, and whether they are typing a password (and showing it).
 */
export interface AuthMascotApi {
  lookAt: (point: ScreenPoint | null) => void;
  secret: (typing: boolean, revealed?: boolean) => void;
}

const noop: AuthMascotApi = { lookAt: () => {}, secret: () => {} };

export const AuthMascotContext = createContext<AuthMascotApi>(noop);

/** Outside the auth screens this does nothing, so fields can be used anywhere. */
export function useAuthMascot() {
  return useContext(AuthMascotContext);
}
