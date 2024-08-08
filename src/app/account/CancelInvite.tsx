"use client";
import React, { useState } from "react";
import { cancelInvite } from "@/actions/team-actions";
import { X, Loader } from "lucide-react"; // Import Loader for the spinner

type CancelInviteProps = {
  teamId: number;
  userId: number;
};

export default function CancelInvite({ teamId, userId }: CancelInviteProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleCancel = async () => {
    setIsLoading(true);
    await cancelInvite({ teamId, userId });
    // After the cancellation, the component should ideally reflect changes
    // This example assumes the invite will be removed from the UI
  };

  return (
    <div>
      {isLoading ? (
        <Loader className="animate-spin" /> // Render spinner while loading
      ) : (
        <X onClick={handleCancel} /> // Render X icon when not loading
      )}
    </div>
  );
}
