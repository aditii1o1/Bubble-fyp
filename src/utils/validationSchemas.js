// src/utils/validationSchemas.js
// ✅ FINAL VERSION - Zod validation schemas
import { z } from "zod";

// Login Schema
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

// Signup Schema
export const signupSchema = z
  .object({
    nickname: z
      .string()
      .min(1, "Nickname is required")
      .min(3, "Nickname must be at least 3 characters")
      .max(20, "Nickname must be less than 20 characters")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Nickname can only contain letters, numbers, and underscores"
      ),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// 🔥 Ready for later features
export const bubbleSchema = z.object({
  text: z
    .string()
    .min(1, "Bubble text cannot be empty")
    .max(500, "Bubble text must be less than 500 characters")
    .refine((val) => val.trim().length > 0, {
      message: "Bubble text cannot be empty",
    }),
  tags: z
    .array(
      z
        .string()
        .max(30, "Tag must be less than 30 characters")
        .regex(
          /^[a-zA-Z0-9_]+$/,
          "Tags can only contain letters, numbers, and underscores"
        )
    )
    .max(5, "You can add up to 5 tags only")
    .optional(),
});

export const reportSchema = z.object({
  reason: z.string().min(1, "Please select a reason"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
});
