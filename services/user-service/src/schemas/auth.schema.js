import { z } from "zod";

export const registerSchema = z.object ({
    email: z
        .string()
        .min(1, "Email is required")
        .email("Invalid email address"),

    username: z
        .string().nonempty("Username required")
        .max(15, "Username must be at most 15 characters"),

    password: z
        .string().nonempty("Password required")
        .min(8, "Password must be at least 8 characters")
        .max(15, "Password must be at most 15 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
});

export const loginSchema = z.object({
    username: z
        .string()
        .min(1, "Username is required"),

    password: z
        .string()
        .min(1, "Password is required"),
});