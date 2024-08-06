"use server";

import { db } from "@/db";
import { users } from "@/db/schema/users";
import OnboardingSchema from "@/lib/schema/OnboardingSchema";
import { auth, clerkClient } from "@clerk/nextjs/server";

export const completeOnboarding = async (formInputs: unknown) => {
  const { userId } = auth();
  if (!userId) {
    return { success: false, error: "No Logged In User" };
  }

  const parsed = OnboardingSchema.safeParse(formInputs);
  if (parsed.error) {
    return { success: false, error: parsed.error.format() };
  }
  const { phone, gamerTag } = parsed.data;

  try {
    await clerkClient().users.updateUser(userId, {
      publicMetadata: {
        onboardingComplete: true,
      },
    });
    const user = await clerkClient.users.getUser(userId);

    const email = user.primaryEmailAddress?.emailAddress;
    if (!email) {
      return { success: false, error: "No email linked with user" };
    }

    await db.insert(users).values({ email, phone, gamerTag });

    return { success: true, message: "User onboarded." };
  } catch (e) {
    console.log("error", e);
    return { success: false, error: "Error onboarding the user." };
  }
};
