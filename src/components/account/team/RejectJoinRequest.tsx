"use client";

import React, { useState } from "react";
import { rejectJoinRequest } from "@/actions/team-actions";
import { X, Loader } from "lucide-react";

type RejectJoinRequestProps = {
  teamId: number;
  userId: number;
};

export default function RejectJoinRequest({
  teamId,
  userId,
}: RejectJoinRequestProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleReject = async () => {
    setIsLoading(true);
    await rejectJoinRequest(teamId, userId);
    // setIsLoading(false); // Update the UI or refetch data as needed
  };

  return (
    <div>
      {isLoading ? (
        <Loader className="animate-spin" />
      ) : (
        <X onClick={handleReject} className="cursor-pointer" />
      )}
    </div>
  );
}
