import React from "react";
import { getUserDetails } from "@/actions/user-actions";
import { Card } from "@/components/ui/card";
import CreateTeam from "./CreateTeam";
import { fetchTeamInvites, getUserTeams } from "@/actions/team-actions";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import UpdateTeam from "./UpdateTeam";
import RemoveTeamMember from "./RemoveTeamMember";
import AddMember from "./AddMember";
import AcceptJoinRequest from "./AcceptJoinRequest";
import RejectJoinRequest from "./RejectJoinRequest";
import AcceptInvite from "./AcceptInvite";
import RejectInvite from "./RejectInvite";
import CancelInvite from "./CancelInvite";

export default async function Account() {
  const { data } = await getUserDetails();
  const teamsResponse = await getUserTeams(data?.userId!);
  const invitesResponse = await fetchTeamInvites(data?.userId!);
  console.log(
    "🚀 ~ Account ~ teamsResponse:",
    JSON.stringify(teamsResponse, null, 4)
  );

  return (
    <>
      <section>
        <Card className="w-[350px] p-6">
          <h1 className="text-center w-full text-4xl">
            Hello <span className="font-bold">{data?.gamerTag}</span>!
          </h1>
        </Card>
      </section>
      <section className="w-full pt-4">
        <div className="flex w-full items-center justify-between border-b pb-2">
          <h1 className="text-2xl">Your Teams</h1>
          <CreateTeam />
        </div>
        <div>
          <Accordion type="multiple" className="w-full">
            {teamsResponse.data &&
              teamsResponse.data.map((groupedTeam) => (
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
                            {member.userId !== data?.userId &&
                              groupedTeam.team.captainId === data?.userId && (
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
                    {/* {groupedTeam.invites.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold">
                          Invite Requests
                        </h3>
                        {groupedTeam.invites.map((invite) => (
                          <div
                            key={invite.userId}
                            className="flex justify-between border p-2 rounded-md"
                          >
                            <p>{invite.gamerTag}</p>
                            <p>{invite.status}</p>
                          </div>
                        ))}
                      </div>
                    )} */}

                    {/* Display invite requests */}
                    {groupedTeam.invites.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold">
                          Invite Requests
                        </h3>
                        {groupedTeam.invites.map((invite) => (
                          <div
                            key={invite.userId}
                            className="flex justify-between border p-2 rounded-md"
                          >
                            <p>{invite.gamerTag}</p>
                            <div className="flex items-center">
                              {data?.userId === groupedTeam.team.captainId &&
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
                                {data?.userId ===
                                  groupedTeam.team.captainId && (
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
                                {data?.userId !==
                                  groupedTeam.team.captainId && <p>Pending</p>}
                              </div>
                            </div>
                          ))}
                      </div>
                    )}

                    {/* Conditional buttons */}
                    {groupedTeam.team.captainId === data?.userId && (
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
      <section className="w-full pt-4">
        <div className="flex w-full items-center justify-between border-b pb-2 mb-2">
          <h1 className="text-2xl">Team Invites</h1>
        </div>
        <div>
          {invitesResponse.data &&
            invitesResponse.data.map((invite) => (
              <div
                key={invite.teamId}
                className="flex justify-between border p-2 rounded-md"
              >
                <p>{invite.teamName + " - " + invite.inviterGamerTag}</p>
                <div className="flex space-x-2">
                  <AcceptInvite
                    teamId={invite.teamId}
                    userId={invite.inviteeId}
                  />
                  <RejectInvite
                    teamId={invite.teamId}
                    userId={invite.inviteeId}
                  />
                </div>
              </div>
            ))}
        </div>
      </section>
    </>
  );

  // return (
  //   <>
  //     <section>
  //       <Card className="w-[350px] p-6">
  //         <h1 className="text-center w-full text-4xl">
  //           Hello <span className="font-bold">{data?.gamerTag}</span> !
  //         </h1>
  //       </Card>
  //     </section>
  //     <section className="w-full pt-4">
  //       <div className="flex w-full items-center justify-between border-b pb-2">
  //         <h1 className="text-2xl">Your Teams</h1>
  //         <CreateTeam />
  //       </div>
  //       <div>
  //         <Accordion type="multiple" className="w-full">
  //           {teamsResponse.data &&
  //             teamsResponse.data.map((groupedTeam) => (
  //               <AccordionItem
  //                 key={groupedTeam.team.id}
  //                 value={groupedTeam.team.id.toString()}
  //               >
  //                 <AccordionTrigger>
  //                   {groupedTeam.team.name} -{" "}
  //                   {groupedTeam.team.type.toLocaleUpperCase()}
  //                 </AccordionTrigger>
  //                 <AccordionContent className="space-y-4 px-4">
  //                   {/* Display members */}
  //                   {groupedTeam.members.length > 0 && (
  //                     <div className="flex flex-col gap-2">
  //                       <h3 className="text-lg font-semibold">Members</h3>
  //                       {groupedTeam.members.map((member) => (
  //                         <div
  //                           key={member.userId}
  //                           className="flex justify-between border p-2 rounded-md"
  //                         >
  //                           <p>{member.gamerTag}</p>
  //                           {member.userId !== data?.userId && (
  //                             <RemoveTeamMember
  //                               teamId={groupedTeam.team.id}
  //                               memberId={member.userId}
  //                             />
  //                           )}
  //                         </div>
  //                       ))}
  //                     </div>
  //                   )}
  //                   {/* Display invite requests */}
  //                   {groupedTeam.invites.length > 0 && (
  //                     <div>
  //                       <h3 className="text-lg font-semibold">
  //                         Invite Requests
  //                       </h3>
  //                       {groupedTeam.invites.map((invite) => (
  //                         <div
  //                           key={invite.userId}
  //                           className="flex justify-between border p-2 rounded-md"
  //                         >
  //                           <p>{invite.gamerTag}</p>
  //                           <p>{invite.status}</p>
  //                         </div>
  //                       ))}
  //                     </div>
  //                   )}

  //                   {/* Display join requests */}
  //                   {groupedTeam.joinRequests.filter(
  //                     (request) => request.status === "pending"
  //                   ).length > 0 && (
  //                     <div>
  //                       <h3 className="text-lg font-semibold">Join Requests</h3>
  //                       {groupedTeam.joinRequests
  //                         .filter((request) => request.status === "pending")
  //                         .map((request) => (
  //                           <div
  //                             key={request.userId}
  //                             className="flex justify-between border p-2 rounded-md"
  //                           >
  //                             <p>{request.gamerTag}</p>
  //                             <div>
  //                               {request.userId === data?.userId ? (
  //                                 <p>Pending</p>
  //                               ) : (
  //                                 <div className="flex space-x-2">
  //                                   <AcceptJoinRequest
  //                                     teamId={groupedTeam.team.id}
  //                                     userId={request.userId}
  //                                   />
  //                                   <RejectJoinRequest
  //                                     teamId={groupedTeam.team.id}
  //                                     userId={request.userId}
  //                                   />
  //                                 </div>
  //                               )}
  //                             </div>
  //                           </div>
  //                         ))}
  //                     </div>
  //                   )}

  //                   {/* --------------------------------- */}

  //                   <div className="flex justify-between">
  //                     <UpdateTeam team={groupedTeam.team} />
  //                     <AddMember team={groupedTeam.team} />
  //                   </div>
  //                 </AccordionContent>
  //               </AccordionItem>
  //             ))}
  //         </Accordion>
  //       </div>
  //     </section>
  //     <section className="w-full pt-4">
  //       <div className="flex w-full items-center justify-between border-b pb-2 mb-2">
  //         <h1 className="text-2xl">Team Invites</h1>
  //       </div>
  //       <div>
  //         {invitesResponse.data &&
  //           invitesResponse.data.map((invite) => (
  //             <div className="flex justify-between border p-2 rounded-md">
  //               <p>{invite.teamName + " - " + invite.inviterGamerTag}</p>
  //               <div className="flex space-x-2">
  //                 <AcceptInvite
  //                   teamId={invite.teamId}
  //                   userId={invite.inviteeId}
  //                 />
  //                 <RejectInvite
  //                   teamId={invite.teamId}
  //                   userId={invite.inviteeId}
  //                 />
  //               </div>
  //             </div>
  //           ))}
  //       </div>
  //     </section>
  //   </>
  // );
}
