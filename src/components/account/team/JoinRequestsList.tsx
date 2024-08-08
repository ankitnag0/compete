import React from "react";
import AcceptJoinRequest from "./AcceptJoinRequest";
import RejectJoinRequest from "./RejectJoinRequest";

type JoinRequestsListProps = {
  teamId: number;
  joinRequests: { userId: number; gamerTag: string | null; status: string }[];
  userId: number;
  captainId: number;
};

const JoinRequestsList = ({
  teamId,
  joinRequests,
  userId,
  captainId,
}: JoinRequestsListProps) => (
  <div>
    <h3 className="text-lg font-semibold">Join Requests</h3>
    {joinRequests
      .filter((request) => request.status === "pending")
      .map((request) => (
        <div
          key={request.userId}
          className="flex justify-between border p-2 rounded-md"
        >
          <p>{request.gamerTag}</p>
          <div>
            {userId === captainId ? (
              <div className="flex space-x-2">
                <AcceptJoinRequest teamId={teamId} userId={request.userId} />
                <RejectJoinRequest teamId={teamId} userId={request.userId} />
              </div>
            ) : (
              <p>Pending</p>
            )}
          </div>
        </div>
      ))}
  </div>
);

export default JoinRequestsList;
