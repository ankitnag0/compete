export type GroupedTeam = {
  team: {
    id: number;
    name: string;
    captainId: number;
    type: "duo" | "squad";
  };
  members: {
    userId: number;
    gamerTag: string | null;
  }[];
  invites: Invite[];
  joinRequests: JoinRequest[];
};

export type Invite = {
  userId: number;
  gamerTag: string | null;
  status: string;
};

export type JoinRequest = {
  userId: number;
  gamerTag: string | null;
  status: string;
};
