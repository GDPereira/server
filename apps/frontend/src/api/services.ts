import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/axios';
import type { Service, CreateServiceInput, UpdateServiceInput } from '../types/service';

const SERVICES_KEY = ['services'];

async function getServices(): Promise<Service[]> {
  const { data } = await api.get<Service[]>('/services');
  return data;
}

async function createService(input: CreateServiceInput): Promise<Service> {
  const { data } = await api.post<Service>('/services', input);
  return data;
}

async function updateService({ id, ...input }: UpdateServiceInput & { id: string }): Promise<Service> {
  const { data } = await api.patch<Service>(`/services/${id}`, input);
  return data;
}

async function deleteService(id: string): Promise<void> {
  await api.delete(`/services/${id}`);
}

export function useServices() {
  return useQuery({
    queryKey: SERVICES_KEY,
    queryFn: getServices,
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SERVICES_KEY });
    },
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SERVICES_KEY });
    },
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SERVICES_KEY });
    },
  });
}
