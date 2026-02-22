import { z } from "zod";

export const estimatorContactSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters."),
  phone: z.string().min(5, "Valid phone number is required."),
  email: z
    .string()
    .email("Please enter a valid email address.")
    .optional()
    .or(z.literal("")),
  city: z.string().optional(),
  country: z.string().optional(),
  comment: z.string().optional(),
  consent: z.boolean().refine((val) => val === true, {
    message: "You must agree to the privacy policy.",
  }),
});

export type EstimatorFormValues = z.infer<typeof estimatorContactSchema>;
