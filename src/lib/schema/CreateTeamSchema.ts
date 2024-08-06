import { z } from "zod";

const CreateTeamSchema = z.object({
  teamName: z.string().min(3, {
    message: "Team name must be of 3 characters at least.",
  }),
  teamType: z.enum(["duo", "squad"]),
});

export default CreateTeamSchema;
