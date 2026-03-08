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

// Forgot Password Schema
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

// Signup Schema
export const signupSchema = z
  .object({
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(6, "Password must be at least 6 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Bubble Creation Schema
export const bubbleSchema = z.object({
  text: z
    .string()
    .min(1, "Bubble text cannot be empty")
    .max(1000, "Bubble text must be less than 1000 characters")
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
    .min(1, "Please select at least one tag")
    .max(5, "You can add up to 5 tags only")
    .default([]),
});

// Report Schema
export const reportSchema = z.object({
  reason: z.enum(["spam", "harassment", "inappropriate", "other"], {
    errorMap: () => ({ message: "Please select a reason" }),
  }),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
});

// Comment Schema
export const commentSchema = z.object({
  text: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(500, "Comment must be less than 500 characters")
    .refine((val) => val.trim().length > 0, {
      message: "Comment cannot be empty",
    }),
});

// Profile Schema
export const profileSchema = z.object({
  nickname: z
    .string()
    .min(3, "Nickname must be at least 3 characters")
    .max(20, "Nickname must be less than 20 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Nickname can only contain letters, numbers, and underscores"
    ),
  bio: z.string().max(200, "Bio must be less than 200 characters").optional(),
});

// Export all schemas
export default {
  loginSchema,
  forgotPasswordSchema,
  signupSchema,
  bubbleSchema,
  reportSchema,
  commentSchema,
  profileSchema,
};
