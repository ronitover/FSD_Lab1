import { Link } from 'react-router';
import { buttonClasses } from '../components/ui/styles.ts';

export function NotFoundPage() {
  return (
    <div className="mx-auto grid min-h-[60dvh] max-w-md place-content-center gap-4 px-4 text-center">
      <title>Page not found · RePlate</title>
      <p className="font-display text-6xl text-orange">404</p>
      <h1 className="font-display text-2xl text-forest">This page isn't on the menu</h1>
      <p className="text-sm text-forest/70">The link may be old, or the page may have moved.</p>
      <Link to="/" className={`${buttonClasses()} justify-self-center`}>
        Back to RePlate
      </Link>
    </div>
  );
}
