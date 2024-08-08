import React from "react";
import { Card } from "@/components/ui/card";

type UserCardProps = {
  gamerTag: string;
};

const UserCard = ({ gamerTag }: UserCardProps) => {
  // Ensure gamerTag is a string. Provide a fallback or error handling if needed.
  const displayGamerTag = gamerTag || "Unknown User";

  return (
    <section>
      <Card className="w-[350px] p-6">
        <h1 className="text-center w-full text-4xl">
          Hello <span className="font-bold">{displayGamerTag}</span>!
        </h1>
      </Card>
    </section>
  );
};

export default UserCard;
