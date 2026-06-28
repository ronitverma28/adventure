import { z } from 'zod';

export const travelerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  age: z.number({ invalid_type_error: 'Age is required' }).min(5, 'Minimum age is 5').max(80, 'Maximum age is 80'),
  gender: z.enum(['Male', 'Female', 'Other']),
  idType: z.enum(['Aadhaar', 'Passport', 'Driving License', 'Voter ID']),
  idNumber: z.string().min(4, 'ID number is required'),
  medicalConditions: z.string().optional(),
  isLeader: z.boolean().optional(),
});

export const bookingContactSchema = z.object({
  emergencyContact: z.string().min(2, 'Emergency contact name is required'),
  emergencyPhone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  pickupLocation: z.string().optional(),
  specialRequests: z.string().max(500).optional(),
});

export type TravelerFormData      = z.infer<typeof travelerSchema>;
export type BookingContactData    = z.infer<typeof bookingContactSchema>;
