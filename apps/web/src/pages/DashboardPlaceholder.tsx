import { useMe } from '../auth/context.ts';
import { VerificationBadge } from '../components/ui/StatusBadge.tsx';
import { ROLE_LABELS } from '../lib/labels.ts';

// Stand-in for each role's home until the donor, NGO and admin screens are built (Phase 3b–3d).
export function DashboardPlaceholder() {
  const me = useMe();
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-10">
      <title>Dashboard · RePlate</title>
      <p className="text-xs font-bold tracking-[0.22em] text-moss uppercase">
        {ROLE_LABELS[me.role]}
      </p>
      <h1 className="mt-3 font-display text-4xl tracking-tight text-forest">
        Hello, {me.displayName}
      </h1>
      {me.ngo && (
        <div className="mt-4">
          <VerificationBadge verification={me.ngo.verification} />
        </div>
      )}
      <p className="mt-4 max-w-lg text-forest/70">Your dashboard is on its way.</p>
    </div>
  );
}
