import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AdminNgo, NgoVerification } from '@replate/shared';
import { api } from '../../lib/api.ts';

const adminKeys = {
  ngos: (verification?: NgoVerification) => ['admin', 'ngos', verification ?? 'all'] as const,
};

export function useAdminNgos(verification?: NgoVerification) {
  return useQuery({
    queryKey: adminKeys.ngos(verification),
    queryFn: ({ signal }) =>
      api<AdminNgo[]>(`/admin/ngos${verification ? `?verification=${verification}` : ''}`, {
        signal,
      }),
    placeholderData: keepPreviousData,
  });
}

export function useSetVerification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, verification }: { id: string; verification: NgoVerification }) =>
      api<AdminNgo>(`/admin/ngos/${id}/verification`, {
        method: 'POST',
        body: { verification },
      }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['admin', 'ngos'] }),
  });
}
