import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import RemoveTeamMember from "./RemoveTeamMember";
import AcceptJoinRequest from "./AcceptJoinRequest";
import RejectJoinRequest from "./RejectJoinRequest";
import CancelInvite from "./CancelInvite";
import UpdateTeam from "./UpdateTeam";
import AddMember from "./AddMember";
import CreateTeam from "./CreateTeam";
import { GroupedTeam } from "@/types/teams";

type TeamSectionProps = {
  teams: GroupedTeam[];
  userId: number;
};

const TeamSection = ({ teams, userId }: TeamSectionProps) => (
  <section className="w-full pt-4">
    <div className="flex w-full items-center justify-between border-b pb-2">
      <h1 className="text-2xl">Your Teams</h1>
      <CreateTeam />
    </div>
    <div>
      <Accordion type="multiple" className="w-full">
        {teams.map((groupedTeam) => (
          <AccordionItem
            key={groupedTeam.team.id}
            value={groupedTeam.team.id.toString()}
          >
            <AccordionTrigger>
              {groupedTeam.team.name} -{" "}
              {groupedTeam.team.type.toLocaleUpperCase()}
            </AccordionTrigger>
            <AccordionContent className="space-y-4 px-4">
              {/* Display members */}
              {groupedTeam.members.length > 0 && (
                <div className="flex flex-col gap-2">
                  <h3 className="text-lg font-semibold">Members</h3>
                  {groupedTeam.members.map((member) => (
                    <div
                      key={member.userId}
                      className="flex justify-between border p-2 rounded-md"
                    >
                      <p>{member.gamerTag}</p>
                      {member.userId !== userId &&
                        groupedTeam.team.captainId === userId && (
                          <RemoveTeamMember
                            teamId={groupedTeam.team.id}
                            memberId={member.userId}
                          />
                        )}
                    </div>
                  ))}
                </div>
              )}

              {/* Display invite requests */}
              {groupedTeam.invites.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold">Invite Requests</h3>
                  {groupedTeam.invites.map((invite) => (
                    <div
                      key={invite.userId}
                      className="flex justify-between border p-2 rounded-md"
                    >
                      <p>{invite.gamerTag}</p>
                      <div className="flex items-center">
                        {userId === groupedTeam.team.captainId &&
                        invite.status === "pending" ? (
                          <div className="flex space-x-2">
                            <CancelInvite
                              teamId={groupedTeam.team.id}
                              userId={invite.userId}
                            />
                          </div>
                        ) : (
                          <p>{invite.status}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Display join requests */}
              {groupedTeam.joinRequests.filter(
                (request) => request.status === "pending"
              ).length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold">Join Requests</h3>
                  {groupedTeam.joinRequests
                    .filter((request) => request.status === "pending")
                    .map((request) => (
                      <div
                        key={request.userId}
                        className="flex justify-between border p-2 rounded-md"
                      >
                        <p>{request.gamerTag}</p>
                        <div>
                          {userId === groupedTeam.team.captainId && (
                            <div className="flex space-x-2">
                              <AcceptJoinRequest
                                teamId={groupedTeam.team.id}
                                userId={request.userId}
                              />
                              <RejectJoinRequest
                                teamId={groupedTeam.team.id}
                                userId={request.userId}
                              />
                            </div>
                          )}
                          {userId !== groupedTeam.team.captainId && (
                            <p>Pending</p>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {/* Conditional buttons */}
              {groupedTeam.team.captainId === userId && (
                <div className="flex justify-between">
                  <UpdateTeam team={groupedTeam.team} />
                  <AddMember team={groupedTeam.team} />
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  </section>
);

export default TeamSection;
