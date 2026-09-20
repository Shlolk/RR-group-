import { z } from "zod"

export const registerSchema = z.object({
  email: z.string().email("Please provide a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password cannot be longer than 72 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().optional(),
})

export const loginSchema = z.object({
  email: z.string().email("Please provide a valid email address"),
  password: z.string().min(1, "Password is required"),
})

export const firebaseLoginSchema = z.object({
  idToken: z.string().min(1, "Firebase ID token is required"),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please provide a valid email address"),
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password cannot be longer than 72 characters"),
})

export const profileUpdateSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional(),
  avatar: z.string().url().optional().nullable(),
})

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password cannot be longer than 72 characters"),
})

export const addressSchema = z.object({
  label: z.string().default("Home"),
  fullName: z.string().min(1, "Full name is required"),
  line1: z.string().min(1, "Address is required"),
  line2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().min(3, "Postal code is required"),
  country: z.string().default("India"),
  phone: z.string().optional(),
  isDefault: z.boolean().default(false),
})