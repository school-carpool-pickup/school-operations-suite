'use client';

import {
  type UseMutationOptions,
  type UseQueryOptions,
  useMutation,
  useQuery,
} from '@tanstack/react-query';
import { apiClient } from './client';
import type { ApiKey } from './keys';

/**
 * Client-side data fetching. Wraps React Query so callers don't see axios.
 *
 *   const { data, isLoading } = useApi<Student[]>(apiKeys.students.list());
 */
export function useApi<TData = unknown>(
  key: ApiKey,
  options?: Omit<UseQueryOptions<TData, Error>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<TData, Error>({
    queryKey: key.queryKey,
    queryFn: async () => {
      const res = await apiClient.request<TData>({
        url: key.path,
        method: key.method ?? 'GET',
        params: key.query,
      });
      return res.data;
    },
    ...options,
  });
}

/**
 * Mutation flavour. Pass a factory that builds the ApiKey from variables.
 *
 *   const update = useApiMutation<Student, StudentInput>(
 *     (input) => apiKeys.students.create(input),
 *     { onSuccess: () => qc.invalidateQueries({ queryKey: ['students'] }) }
 *   );
 *   update.mutate({ name: '...', ... });
 */
export function useApiMutation<TData = unknown, TVars = void>(
  factory: (vars: TVars) => ApiKey,
  options?: UseMutationOptions<TData, Error, TVars>,
) {
  return useMutation<TData, Error, TVars>({
    mutationFn: async (vars) => {
      const key = factory(vars);
      const res = await apiClient.request<TData>({
        url: key.path,
        method: key.method ?? 'POST',
        params: key.query,
        data: key.body,
      });
      return res.data;
    },
    ...options,
  });
}
