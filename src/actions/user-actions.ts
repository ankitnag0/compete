import { db } from "@/db";
import { users } from "@/db/schema/users";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

export async function getUserDetails() {
  const authUser = await currentUser();
  const name = authUser?.firstName;

  const email = authUser?.primaryEmailAddress?.emailAddress;
  if (typeof email !== "string") {
    return { success: false, error: "User not logged in" };
  }
  const user = await db.select().from(users).where(eq(users.email, email));
  const { gamerTag, id } = user[0];
  return {
    success: true,
    message: "User details fetched",
    data: {
      gamerTag,
      userId: id,
    },
  };
}
