import { z } from "zod";

const emailSchema = z.string().email();

export const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, "Email or phone is required")
    .refine(
      (value) => (value.includes("@") ? emailSchema.safeParse(value).success : true),
      { message: "Please enter a valid email address" }
    ),
  password: z.string().min(1),
});

export type LoginInput = z.infer<typeof loginSchema>;