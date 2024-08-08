"use client";
import React, { useState } from "react";
import { removeTeamMember } from "@/actions/team-actions";
import { X, Loader } from "lucide-react"; // Import Loader for the spinner

type RemoveTeamMemberProps = {
  teamId: number;
  memberId: number;
};

export default function RemoveTeamMember({
  teamId,
  memberId,
}: RemoveTeamMemberProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleRemove = async () => {
    setIsLoading(true);
    await removeTeamMember({ teamId, memberId });
    // since we are revalidating the path we propbably don't need to setIsLoading(false), since the element will be removed completely
  };

  return (
    <div>
      {isLoading ? (
        <Loader className="animate-spin" /> // Render spinner while loading
      ) : (
        <X onClick={handleRemove} /> // Render X icon when not loading
      )}
    </div>
  );
}
