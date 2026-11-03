import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Me, ProfileUpdateInput } from '@replate/shared';
import { ME_QUERY_KEY } from '../../auth/context.ts';
import { api } from '../../lib/api.ts';

/** Both endpoints return the updated profile, which replaces the cached one straight away. */
function useSaveMe<T>(path: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: T) => api<Me>(path, { method: 'PATCH', body: input }),
    onSuccess: (me) => queryClient.setQueryData([...ME_QUERY_KEY, me.id], me),
  });
}

export function useUpdateProfile() {
  return useSaveMe<ProfileUpdateInput>('/me');
}

export function useUpdateNgoSettings() {
  return useSaveMe<{ serviceRadiusKm: number }>('/me/ngo');
}
