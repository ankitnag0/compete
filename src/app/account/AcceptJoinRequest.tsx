"use client";

import React, { useState } from "react";
import { acceptJoinRequest } from "@/actions/team-actions";
import { Check, Loader } from "lucide-react";

type AcceptJoinRequestProps = {
  teamId: number;
  userId: number;
};

export default function AcceptJoinRequest({
  teamId,
  userId,
}: AcceptJoinRequestProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleAccept = async () => {
    setIsLoading(true);
    await acceptJoinRequest(teamId, userId);
    // setIsLoading(false); // Update the UI or refetch data as needed
  };

  return (
    <div>
      {isLoading ? (
        <Loader className="animate-spin" />
      ) : (
        <Check onClick={handleAccept} className="cursor-pointer" />
      )}
    </div>
  );
}
