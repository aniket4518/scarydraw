import { z } from "zod";

// Password validation with strict requirements
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(100, "Password must be less than 100 characters")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[^a-zA-Z0-9]/,
    "Password must contain at least one special character",
  );

// Email validation
const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Invalid email address")
  .toLowerCase()
  .trim();

// Name validation
const nameSchema = z
  .string()
  .min(2, "Name must be at least 2 characters")
  .max(50, "Name must be less than 50 characters")
  .trim()
  .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces");

// Signup schema
export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema,
});

// Signin schema
export const signinSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

// Legacy schemas (keeping for backwards compatibility)
export const UserSchema = signupSchema;
export const singninSchema = signinSchema; // Keeping typo for backwards compatibility

// Room name schema
export const RoomName = z.object({
  roomname: z
    .string()
    .min(1, "Room name is required")
    .max(100, "Room name must be less than 100 characters")
    .trim(),
});

// Type exports
export type SignupInput = z.infer<typeof signupSchema>;
export type SigninInput = z.infer<typeof signinSchema>;
export type RoomNameInput = z.infer<typeof RoomName>;
