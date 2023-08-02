import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { FileUpload, GraphQLUpload } from 'graphql-upload';

import { AddExecutiveMemberInput } from '@executive-team/dto/input/add.executive.member.input';
import { CompanyIdInput } from '@executive-team/dto/input/company.input.id';
import { CurrentUser } from '@src/auth/decorator/user.decorator';
import { DeleteExecutiveMemberResponse } from '@executive-team/dto/response/delete.executive.member.response';
import { EditExecutiveMemberInput } from '@executive-team/dto/input/edit.executive.member.input';
import { ExecutiveMemberIdInput } from '@executive-team/dto/input/executive.member.id.input';
import { ExecutiveTeam } from '@executive-team/entities/executive.team.entity';
import { ExecutiveTeamService } from '@executive-team/service/executive.team.service';
import { FileUrl } from '@announcement/dto/response/fileUrl.response';
import { GqlAuthGuard } from '@src/auth/guard/auth.guard';
import { UserDocument } from '@user/entities/user.entity';

@Resolver()
export class ExecutiveTeamResolver {
  constructor(private readonly executiveTeamService: ExecutiveTeamService) {}

  @UseGuards(GqlAuthGuard)
  @Mutation(() => ExecutiveTeam)
  async addExecutiveMember(
    @Args('body') addExecutiveMemberInput: AddExecutiveMemberInput,
    @CurrentUser() user: UserDocument,
  ) {
    return await this.executiveTeamService.addExecutiveMember(
      addExecutiveMemberInput,
      user,
    );
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [ExecutiveTeam])
  async getExecutiveMembers(
    @Args('body') companyIdInput: CompanyIdInput,
    @CurrentUser() user: UserDocument,
  ) {
    return await this.executiveTeamService.getExecutiveMembers(
      companyIdInput,
      user,
    );
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => DeleteExecutiveMemberResponse)
  async deleteExecutiveMember(
    @Args('body') executiveMemberIdInput: ExecutiveMemberIdInput,
    @CurrentUser() user: UserDocument,
  ) {
    return await this.executiveTeamService.deleteExecutiveMember(
      executiveMemberIdInput,
      user,
    );
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => ExecutiveTeam)
  async editExecutiveMember(
    @Args('body') editExecutiveMemberInput: EditExecutiveMemberInput,
    @CurrentUser() user: UserDocument,
  ) {
    return await this.executiveTeamService.editExecutiveMember(
      editExecutiveMemberInput,
      user,
    );
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => FileUrl)
  async uploadExecutiveMemberDP(
    @Args('file', { type: () => GraphQLUpload }) file: FileUpload,
  ) {
    return this.executiveTeamService.uploadFile(file);
  }
}
