import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import TeamMemberList from "./TeamMemberList";
import InviteRequestsList from "./InviteRequestsList";
import JoinRequestsList from "./JoinRequestsList";
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
              <TeamMemberList
                teamId={groupedTeam.team.id}
                members={groupedTeam.members}
                userId={userId}
                captainId={groupedTeam.team.captainId}
              />
              <InviteRequestsList
                teamId={groupedTeam.team.id}
                invites={groupedTeam.invites}
                userId={userId}
              />
              <JoinRequestsList
                teamId={groupedTeam.team.id}
                joinRequests={groupedTeam.joinRequests}
                userId={userId}
                captainId={groupedTeam.team.captainId}
              />
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
