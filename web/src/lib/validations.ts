import * as z from "zod";

// Shared schema for Login
export const loginSchema = z.object({
  email: z.string()
    .min(1, "Email is required")
    .email("Invalid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters long"),
});

// Expanded schema for Signup
export const signupSchema = loginSchema.extend({
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name is too long"),
  confirmPassword: z.string()
    .min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;