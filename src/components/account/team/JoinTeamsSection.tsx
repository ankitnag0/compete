import React from "react";
import JoinTeams from "./JoinTeams";
import CancelJoinRequest from "./CancelJoinRequest";

type JoinRequest = {
  requestId: number;
  teamId: number;
  requesterId: number;
  teamName: string;
  status: "pending" | "accepted" | "rejected";
  dateRequested: string;
};

type JoinTeamsSectionProps = {
  joinRequests: JoinRequest[];
};

const JoinTeamSection = ({ joinRequests }: JoinTeamsSectionProps) => (
  <section className="w-full pt-4">
    <div className="flex w-full items-center justify-between border-b pb-2 mb-2">
      <h1 className="text-2xl">Join Teams</h1>
      <JoinTeams />
    </div>
    <div className="space-y-2">
      {joinRequests.map((joinRequest) => (
        <div
          key={joinRequest.teamId}
          className="flex justify-between border p-2 rounded-md"
        >
          <p>{joinRequest.teamName}</p>
          <div className="flex space-x-2">
            <CancelJoinRequest teamId={joinRequest.teamId} />
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default JoinTeamSection;
