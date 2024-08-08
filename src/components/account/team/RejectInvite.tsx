"use client";

import React, { useState } from "react";
import { rejectInvite } from "@/actions/team-actions";
import { X, Loader } from "lucide-react"; // Import X for the reject icon and Loader for the spinner

type RejectInviteProps = {
  teamId: number;
  userId: number;
};

export default function RejectInvite({ teamId, userId }: RejectInviteProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleReject = async () => {
    setIsLoading(true);
    await rejectInvite(teamId, userId);
    setIsLoading(false); // Update the UI or refetch data as needed
  };

  return (
    <div>
      {isLoading ? (
        <Loader className="animate-spin" /> // Render spinner while loading
      ) : (
        <X onClick={handleReject} className="cursor-pointer" /> // Render X icon when not loading
      )}
    </div>
  );
}
