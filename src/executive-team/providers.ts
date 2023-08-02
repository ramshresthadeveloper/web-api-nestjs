import { ExecutiveTeamRepository } from '@executive-team/repository/executive.team.repository';
import { ExecutiveTeamResolver } from '@executive-team/resolver/executive.team.resolver';
import { ExecutiveTeamService } from '@executive-team/service/executive.team.service';

export const providers = [
  ExecutiveTeamRepository,
  ExecutiveTeamResolver,
  ExecutiveTeamService,
];
