"use client";

import React, { useState } from "react";
import { cancelJoinRequest } from "@/actions/team-actions";
import { X, Loader } from "lucide-react";

type CancelJoinRequestProps = {
  teamId: number;
};

export default function CancelJoinRequest({ teamId }: CancelJoinRequestProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleCancel = async () => {
    setIsLoading(true);
    await cancelJoinRequest(teamId);
    // setIsLoading(false); // Update the UI or refetch data as needed
  };

  return (
    <div>
      {isLoading ? (
        <Loader className="animate-spin" />
      ) : (
        <X onClick={handleCancel} className="cursor-pointer" />
      )}
    </div>
  );
}
