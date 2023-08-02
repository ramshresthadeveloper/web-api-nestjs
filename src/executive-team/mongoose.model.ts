import {
  ExecutiveTeam,
  ExecutiveTeamSchema,
} from '@executive-team/entities/executive.team.entity';

export const mongooseModel = [
  {
    name: ExecutiveTeam.name,
    schema: ExecutiveTeamSchema,
  },
];
