import { Link, useNavigate, useParams } from 'react-router';
import type { DonationUpdateInput } from '@replate/shared';
import { FullPageError, FullPageSpinner } from '../../components/ui/Feedback.tsx';
import { buttonClasses } from '../../components/ui/styles.ts';
import { useToast } from '../../components/ui/toast-context.ts';
import { DonationForm } from '../../features/donations/DonationForm.tsx';
import { donationToValues, valuesToInput } from '../../features/donations/formValues.ts';
import { useDonation, useUpdateDonation } from '../../features/donations/queries.ts';
import { errorMessage } from '../../lib/api.ts';
import { STATUS_LABELS } from '../../lib/labels.ts';

export function EditDonationPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const donation = useDonation(id);
  const update = useUpdateDonation(id);

  if (donation.isPending) return <FullPageSpinner />;
  if (donation.isError) return <FullPageError message={errorMessage(donation.error)} />;

  const current = donation.data;
  if (current.status !== 'available') {
    return (
      <div className="mx-auto grid max-w-md gap-4 px-4 py-16 text-center">
        <h1 className="font-display text-2xl text-forest">This donation can't be edited</h1>
        <p className="text-sm text-forest/70">
          It is {STATUS_LABELS[current.status].toLowerCase()}. Only donations still waiting for an
          NGO can be changed.
        </p>
        <Link to={`/donations/${id}`} className={`${buttonClasses()} justify-self-center`}>
          Back to the donation
        </Link>
      </div>
    );
  }

  const initialValues = donationToValues(current);
  const before = valuesToInput(initialValues);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <title>Edit donation · RePlate</title>
      <h1 className="font-display text-4xl tracking-tight text-forest">Edit donation</h1>
      <div className="mt-8">
        <DonationForm
          initialValues={initialValues}
          submitLabel="Save changes"
          onCancel={() => void navigate(`/donations/${id}`)}
          onSubmit={async (input) => {
            // Send only what changed, so an unchanged past time isn't re-checked against "now".
            const changes = Object.fromEntries(
              Object.entries(input).filter(
                ([key, value]) =>
                  JSON.stringify(value) !== JSON.stringify(before[key as keyof typeof before]),
              ),
            ) as DonationUpdateInput;
            if (Object.keys(changes).length > 0) {
              await update.mutateAsync(changes);
              toast.show('Changes saved.');
            }
            void navigate(`/donations/${id}`, { replace: true });
          }}
        />
      </div>
    </div>
  );
}
