import { z } from "zod";

const OnboardingSchema = z.object({
  phone: z
    .string()
    .min(10, {
      message: "Phone must be of 10 digits.",
    })
    .max(10, {
      message: "Phone must be of 10 digits.",
    }),
  gamerTag: z.string().min(3, {
    message: "Gamer Tag must be of 3 characters at least.",
  }),
});

export default OnboardingSchema;
