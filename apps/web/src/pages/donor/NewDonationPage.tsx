import { useNavigate } from 'react-router';
import { useMe } from '../../auth/context.ts';
import { useToast } from '../../components/ui/toast-context.ts';
import { DonationForm } from '../../features/donations/DonationForm.tsx';
import { emptyDonationValues } from '../../features/donations/formValues.ts';
import { useCreateDonation } from '../../features/donations/queries.ts';

export function NewDonationPage() {
  const me = useMe();
  const navigate = useNavigate();
  const toast = useToast();
  const create = useCreateDonation();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <title>Donate food · RePlate</title>
      <h1 className="font-display text-4xl tracking-tight text-forest">Donate food</h1>
      <p className="mt-2 text-forest/65">
        Three quick steps. Verified NGOs nearby see your listing as soon as you post it.
      </p>
      <div className="mt-8">
        <DonationForm
          initialValues={emptyDonationValues(me)}
          submitLabel="List donation"
          onCancel={() => void navigate(-1)}
          onSubmit={async (input) => {
            const donation = await create.mutateAsync(input);
            toast.show('Your donation is listed. NGOs nearby can now claim it.');
            void navigate(`/donations/${donation.id}`, { replace: true });
          }}
        />
      </div>
    </div>
  );
}
