import { useQueryClient } from '@tanstack/react-query';
import { Outlet } from 'react-router';
import { ME_QUERY_KEY, useMe } from '../../auth/context.ts';
import { Button } from '../../components/ui/Button.tsx';
import { VerificationBadge } from '../../components/ui/StatusBadge.tsx';

/** NGO screens open once an admin has verified the organisation. Until then, explain the wait. */
export function RequireVerifiedNgo() {
  const me = useMe();
  const queryClient = useQueryClient();
  const verification = me.ngo?.verification ?? 'pending';

  if (verification === 'verified') return <Outlet />;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <title>Verification · RePlate</title>
      <VerificationBadge verification={verification} />
      {verification === 'pending' ? (
        <>
          <h1 className="mt-4 font-display text-4xl tracking-tight text-forest">
            We're checking {me.displayName}
          </h1>
          <p className="mt-4 leading-7 text-forest/70">
            To keep donors' food going to genuine organisations, a RePlate admin verifies every NGO
            before it can see and claim donations. This usually takes a day or two.
          </p>
          <ol className="mt-6 space-y-3 text-sm text-forest/75">
            <li className="flex gap-3">
              <span className="font-display text-lg text-orange">1</span> We review your
              organisation's details{me.ngo?.registrationNumber ? ' and registration number' : ''}.
            </li>
            <li className="flex gap-3">
              <span className="font-display text-lg text-orange">2</span> Once verified, you'll see
              donations near you here and can claim them.
            </li>
          </ol>
        </>
      ) : (
        <>
          <h1 className="mt-4 font-display text-4xl tracking-tight text-forest">
            We couldn't verify {me.displayName}
          </h1>
          <p className="mt-4 leading-7 text-forest/70">
            Your organisation's details could not be confirmed, so it can't claim donations. If you
            think this is a mistake, contact the RePlate team with your registration details.
          </p>
        </>
      )}
      <Button
        variant="secondary"
        className="mt-8"
        onClick={() => void queryClient.invalidateQueries({ queryKey: ME_QUERY_KEY })}
      >
        Check again
      </Button>
    </div>
  );
}
