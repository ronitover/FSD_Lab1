import { useState } from 'react';
import { useNavigate } from 'react-router';
import type { Donation } from '@replate/shared';
import { useMe } from '../../auth/context.ts';
import { DonationForm } from '../../features/donations/DonationForm.tsx';
import { DonationPosted } from '../../features/donations/DonationPosted.tsx';
import { emptyDonationValues } from '../../features/donations/formValues.ts';
import { useCreateDonation } from '../../features/donations/queries.ts';

export function NewDonationPage() {
  const me = useMe();
  const navigate = useNavigate();
  const create = useCreateDonation();
  const [posted, setPosted] = useState<Donation | null>(null);
  // Bumped by "Donate more" so the form starts again from empty.
  const [formKey, setFormKey] = useState(0);

  if (posted) {
    return (
      <DonationPosted
        donation={posted}
        onDonateMore={() => {
          setPosted(null);
          setFormKey((key) => key + 1);
          window.scrollTo({ top: 0 });
        }}
      />
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <title>Donate food · RePlate</title>
      <h1 className="font-display text-4xl tracking-tight text-forest">Donate food</h1>
      <p className="mt-2 text-forest/65">
        Three quick steps. Verified NGOs nearby see your listing as soon as you post it.
      </p>
      <div className="mt-8">
        <DonationForm
          key={formKey}
          initialValues={emptyDonationValues(me)}
          submitLabel="List donation"
          onCancel={() => void navigate(-1)}
          onSubmit={async (input) => {
            const donation = await create.mutateAsync(input);
            setPosted(donation);
            window.scrollTo({ top: 0 });
          }}
        />
      </div>
    </div>
  );
}
