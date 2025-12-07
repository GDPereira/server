import { z } from 'zod';

export const serviceSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  port: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().nullable(),
});

export const createServiceSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  port: z.coerce
    .number()
    .int('Port must be an integer')
    .min(1, 'Port must be at least 1')
    .max(65535, 'Port must be at most 65535'),
});

export const updateServiceSchema = createServiceSchema.partial();

export type Service = z.infer<typeof serviceSchema>;
export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
