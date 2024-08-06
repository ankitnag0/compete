import React from "react";
import { getUserDetails } from "@/actions/user-actions";
import { Card } from "@/components/ui/card";
import CreateTeam from "./CreateTeam";
import { getUserTeams } from "@/actions/team-actions";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import UpdateTeam from "./UpdateTeam";
import RemoveTeamMember from "./RemoveTeamMember";
import AddMember from "./AddMember";

// export default async function Account() {
//   const { data } = await getUserDetails();
//   const teamsResponse = await getUserTeams(data?.userId!);
//   console.log(
//     "🚀 ~ Account ~ teamsResponse:",
//     JSON.stringify(teamsResponse, null, 4)
//   );

//   return (
//     <>
//       <section>
//         <Card className="w-[350px] p-6">
//           <h1 className="text-center w-full text-4xl">
//             Hello <span className="font-bold">{data?.gamerTag}</span> !
//           </h1>
//         </Card>
//       </section>
//       <section className="w-full pt-4">
//         <div className="flex w-full items-center justify-between border-b pb-2">
//           <h1 className="text-2xl">Your Teams</h1>
//           <CreateTeam />
//         </div>
//         <div>
//           <Accordion type="multiple" className="w-full">
//             {teamsResponse.data &&
//               teamsResponse.data.map((groupedTeam) => (
//                 <AccordionItem value={groupedTeam.team.id.toString()}>
//                   <AccordionTrigger>
//                     {groupedTeam.team.name} -{" "}
//                     {groupedTeam.team.type.toLocaleUpperCase()}
//                   </AccordionTrigger>
//                   <AccordionContent className="space-y-4 px-4">
//                     {groupedTeam.members.length > 0 &&
//                       groupedTeam.members.map((member) => (
//                         <div className="flex justify-between border p-2 rounded-md">
//                           <p>{member.gamerTag}</p>
//                           {member.userId !== data?.userId && (
//                             <RemoveTeamMember
//                               teamId={groupedTeam.team.id}
//                               memberId={member.userId}
//                             />
//                           )}
//                         </div>
//                       ))}
//                     <div className="flex justify-between">
//                       {/* <Button variant="secondary">Edit Team</Button> */}
//                       <UpdateTeam team={groupedTeam.team} />
//                       <AddMember team={groupedTeam.team} />
//                     </div>
//                   </AccordionContent>
//                 </AccordionItem>
//               ))}
//           </Accordion>
//         </div>
//       </section>
//     </>
//   );
// }

export default async function Account() {
  const { data } = await getUserDetails();
  const teamsResponse = await getUserTeams(data?.userId!);
  console.log(
    "🚀 ~ Account ~ teamsResponse:",
    JSON.stringify(teamsResponse, null, 4)
  );

  return (
    <>
      <section>
        <Card className="w-[350px] p-6">
          <h1 className="text-center w-full text-4xl">
            Hello <span className="font-bold">{data?.gamerTag}</span> !
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
                      <div>
                        <h3 className="text-lg font-semibold">Members</h3>
                        {groupedTeam.members.map((member) => (
                          <div
                            key={member.userId}
                            className="flex justify-between border p-2 rounded-md"
                          >
                            <p>{member.gamerTag}</p>
                            {member.userId !== data?.userId && (
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
                    )}

                    {/* Display join requests */}
                    {groupedTeam.joinRequests.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold">Join Requests</h3>
                        {groupedTeam.joinRequests.map((request) => (
                          <div
                            key={request.userId}
                            className="flex justify-between border p-2 rounded-md"
                          >
                            <p>{request.gamerTag}</p>
                            <p>{request.status}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex justify-between">
                      <UpdateTeam team={groupedTeam.team} />
                      <AddMember team={groupedTeam.team} />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
          </Accordion>
        </div>
      </section>
    </>
  );
}

// export default async function Account() {
//   const { data } = await getUserDetails();
//   const teamsResponse = await getUserTeams(data?.userId!);
//   console.log(
//     "🚀 ~ Account ~ teamsResponse:",
//     JSON.stringify(teamsResponse, null, 4)
//   );

//   const handleAcceptInvite = async (teamId, userId) => {
//     // await acceptInvite(teamId, userId);
//     // Optionally, refresh the team data or handle UI updates
//   };

//   const handleRejectInvite = async (teamId, userId) => {
//     // await rejectInvite(teamId, userId);
//     // Optionally, refresh the team data or handle UI updates
//   };

//   const handleAcceptJoinRequest = async (teamId, userId) => {
//     // await acceptJoinRequest(teamId, userId);
//     // Optionally, refresh the team data or handle UI updates
//   };

//   const handleRejectJoinRequest = async (teamId, userId) => {
//     // await rejectJoinRequest(teamId, userId);
//     // Optionally, refresh the team data or handle UI updates
//   };

//   return (
//     <>
//       <section>
//         <Card className="w-[350px] p-6">
//           <h1 className="text-center w-full text-4xl">
//             Hello <span className="font-bold">{data?.gamerTag}</span>!
//           </h1>
//         </Card>
//       </section>
//       <section className="w-full pt-4">
//         <div className="flex w-full items-center justify-between border-b pb-2">
//           <h1 className="text-2xl">Your Teams</h1>
//           <CreateTeam />
//         </div>
//         <div>
//           <Accordion type="multiple" className="w-full">
//             {teamsResponse.data &&
//               teamsResponse.data.map((groupedTeam) => (
//                 <AccordionItem
//                   key={groupedTeam.team.id}
//                   value={groupedTeam.team.id.toString()}
//                 >
//                   <AccordionTrigger>
//                     {groupedTeam.team.name} -{" "}
//                     {groupedTeam.team.type.toLocaleUpperCase()}
//                   </AccordionTrigger>
//                   <AccordionContent className="space-y-4 px-4">
//                     {/* Display members */}
//                     {groupedTeam.members.length > 0 && (
//                       <div>
//                         <h3 className="text-lg font-semibold">Members</h3>
//                         {groupedTeam.members.map((member) => (
//                           <div
//                             key={member.userId}
//                             className="flex justify-between border p-2 rounded-md"
//                           >
//                             <p>{member.gamerTag}</p>
//                             {member.userId !== data?.userId && (
//                               <RemoveTeamMember
//                                 teamId={groupedTeam.team.id}
//                                 memberId={member.userId}
//                               />
//                             )}
//                           </div>
//                         ))}
//                       </div>
//                     )}

//                     {/* Display invite requests */}
//                     {groupedTeam.invites.filter(
//                       (invite) => invite.status === "pending"
//                     ).length > 0 && (
//                       <div>
//                         <h3 className="text-lg font-semibold">
//                           Invite Requests
//                         </h3>
//                         {groupedTeam.invites
//                           .filter((invite) => invite.status === "pending")
//                           .map((invite) => (
//                             <div
//                               key={invite.userId}
//                               className="flex justify-between border p-2 rounded-md"
//                             >
//                               <p>{invite.gamerTag}</p>
//                               <div>
//                                 {invite.userId === data?.userId ? (
//                                   <p>Pending</p>
//                                 ) : (
//                                   <div className="flex space-x-2">
//                                     <button
//                                       onClick={() =>
//                                         handleAcceptInvite(
//                                           groupedTeam.team.id,
//                                           invite.userId
//                                         )
//                                       }
//                                       className="bg-green-500 text-white px-2 py-1 rounded-md"
//                                     >
//                                       Accept
//                                     </button>
//                                     <button
//                                       onClick={() =>
//                                         handleRejectInvite(
//                                           groupedTeam.team.id,
//                                           invite.userId
//                                         )
//                                       }
//                                       className="bg-red-500 text-white px-2 py-1 rounded-md"
//                                     >
//                                       Reject
//                                     </button>
//                                   </div>
//                                 )}
//                               </div>
//                             </div>
//                           ))}
//                       </div>
//                     )}

//                     {/* Display join requests */}
//                     {groupedTeam.joinRequests.filter(
//                       (request) => request.status === "pending"
//                     ).length > 0 && (
//                       <div>
//                         <h3 className="text-lg font-semibold">Join Requests</h3>
//                         {groupedTeam.joinRequests
//                           .filter((request) => request.status === "pending")
//                           .map((request) => (
//                             <div
//                               key={request.userId}
//                               className="flex justify-between border p-2 rounded-md"
//                             >
//                               <p>{request.gamerTag}</p>
//                               <div>
//                                 {request.userId === data?.userId ? (
//                                   <p>Pending</p>
//                                 ) : (
//                                   <div className="flex space-x-2">
//                                     <button
//                                       onClick={() =>
//                                         handleAcceptJoinRequest(
//                                           groupedTeam.team.id,
//                                           request.userId
//                                         )
//                                       }
//                                       className="bg-green-500 text-white px-2 py-1 rounded-md"
//                                     >
//                                       Accept
//                                     </button>
//                                     <button
//                                       onClick={() =>
//                                         handleRejectJoinRequest(
//                                           groupedTeam.team.id,
//                                           request.userId
//                                         )
//                                       }
//                                       className="bg-red-500 text-white px-2 py-1 rounded-md"
//                                     >
//                                       Reject
//                                     </button>
//                                   </div>
//                                 )}
//                               </div>
//                             </div>
//                           ))}
//                       </div>
//                     )}

//                     <div className="flex justify-between">
//                       <UpdateTeam team={groupedTeam.team} />
//                       <AddMember team={groupedTeam.team} />
//                     </div>
//                   </AccordionContent>
//                 </AccordionItem>
//               ))}
//           </Accordion>
//         </div>
//       </section>
//     </>
//   );
// }
