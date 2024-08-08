"use client";

import React, { useState } from "react";
import { acceptInvite } from "@/actions/team-actions";
import { Check, Loader } from "lucide-react"; // Import Check for the accept icon and Loader for the spinner

type AcceptInviteProps = {
  teamId: number;
  userId: number;
};

export default function AcceptInvite({ teamId, userId }: AcceptInviteProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleAccept = async () => {
    setIsLoading(true);
    const response = await acceptInvite(teamId, userId);
    console.log("🚀 ~ handleAccept ~ response:", response);
    setIsLoading(false); // Update the UI or refetch data as needed
  };

  return (
    <div>
      {isLoading ? (
        <Loader className="animate-spin" /> // Render spinner while loading
      ) : (
        <Check onClick={handleAccept} className="cursor-pointer" /> // Render Check icon when not loading
      )}
    </div>
  );
}
