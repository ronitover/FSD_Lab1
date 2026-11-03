import { isRouteErrorResponse, useRouteError } from 'react-router';
import { FullPageError } from '../components/ui/Feedback.tsx';
import { NotFoundPage } from './NotFoundPage.tsx';

/** Shown when a screen crashes, instead of a blank page. */
export function RouteError() {
  const error = useRouteError();
  if (isRouteErrorResponse(error) && error.status === 404) return <NotFoundPage />;
  console.error(error);
  return (
    <FullPageError
      message="This screen ran into a problem. Reloading usually fixes it."
      onRetry={() => window.location.reload()}
    />
  );
}
