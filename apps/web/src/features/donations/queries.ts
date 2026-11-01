import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  Donation,
  DonationCreateInput,
  DonationDetail,
  DonationStatus,
  DonationUpdateInput,
} from '@replate/shared';
import { api } from '../../lib/api.ts';

export interface MyDonationsFilters {
  q?: string;
  status?: DonationStatus;
}

export const donationKeys = {
  all: ['donations'] as const,
  mine: (filters: MyDonationsFilters) => ['donations', 'mine', filters] as const,
  detail: (id: string) => ['donations', 'detail', id] as const,
};

function queryString(params: Record<string, string | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) if (value) search.set(key, value);
  const text = search.toString();
  return text ? `?${text}` : '';
}

export function useMyDonations(filters: MyDonationsFilters = {}) {
  return useQuery({
    queryKey: donationKeys.mine(filters),
    queryFn: ({ signal }) =>
      api<Donation[]>(`/donations/mine${queryString({ ...filters })}`, { signal }),
    // Keep showing the previous results while a new search loads, instead of flashing a spinner.
    placeholderData: keepPreviousData,
  });
}

export function useDonation(id: string) {
  return useQuery({
    queryKey: donationKeys.detail(id),
    queryFn: ({ signal }) => api<DonationDetail>(`/donations/${id}`, { signal }),
  });
}

/** After any change, every donation list and detail is refetched the next time it is shown. */
function useInvalidateDonations() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: donationKeys.all });
}

export function useCreateDonation() {
  const invalidate = useInvalidateDonations();
  return useMutation({
    mutationFn: (input: DonationCreateInput) =>
      api<Donation>('/donations', { method: 'POST', body: input }),
    onSuccess: invalidate,
  });
}

export function useUpdateDonation(id: string) {
  const invalidate = useInvalidateDonations();
  return useMutation({
    mutationFn: (input: DonationUpdateInput) =>
      api<Donation>(`/donations/${id}`, { method: 'PATCH', body: input }),
    onSuccess: invalidate,
  });
}

export function useDeleteDonation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api<void>(`/donations/${id}`, { method: 'DELETE' }),
    onSuccess: (_data, id) => {
      // Drop the deleted donation's detail so nothing tries to refetch it, then refresh the lists.
      queryClient.removeQueries({ queryKey: donationKeys.detail(id) });
      return queryClient.invalidateQueries({ queryKey: donationKeys.all });
    },
  });
}

export type DonationAction = 'cancel' | 'claim' | 'release' | 'collect';

/** Status changes: donors cancel; NGOs claim, release and mark collected. */
export function useDonationAction() {
  const invalidate = useInvalidateDonations();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: DonationAction }) =>
      api<Donation>(`/donations/${id}/${action}`, { method: 'POST' }),
    onSuccess: invalidate,
  });
}
