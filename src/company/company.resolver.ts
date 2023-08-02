import { Message } from '@admin/dto/response/message.response';
import { IdOnly } from '@announcement/dto/input/id-only.input';
import { CompanyIdOnlyInput } from '@investor/dto/input/companyId-only.input';
import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { FileUrl } from '@src/announcement/dto/response/fileUrl.response';
import { CurrentUser } from '@src/auth/decorator/user.decorator';
import { GqlAuthGuard } from '@src/auth/guard/auth.guard';
import { User, UserDocument } from '@src/user/entities/user.entity';
import { FileUpload, GraphQLUpload } from 'graphql-upload';
import { CompanyService } from './company.service';
import { AddTeamMemberDto } from './dto/input/add-team-member.input';
import { AddTeamNameInputDto } from './dto/input/add-team-name.input';
import { CreateCompanyInput } from './dto/input/company.register.input';
import { UpdateTeamMemberDetailDto } from './dto/input/team-member-detail-edit.input';
import { TeamMemberDetailInputDto } from './dto/input/team-member-detail.input';
import { UpdateTeamMemberPermissionInput } from './dto/input/team-member-permission-edit.input';
import { TeamMemberListInput } from './dto/input/team-members-list.input';
import { UpdateCompanyInput } from './dto/input/update-company.input';
import { CompanyDetail } from './dto/response/company-detail.response';
import { CompanyListWithCreatorFlag } from './dto/response/company-list-with-creator-flag';
import { RegisterCompanyResponse } from './dto/response/company.register.response';
import {
  CompanyTeamMember,
  TeamMembersList,
} from './dto/response/team-members-list.response';
import { TeamNameResponse } from './dto/response/teamName.response';
import { UserCompanyList } from './dto/response/user-company-list.response';
import { Company, Subscription } from './entity/company.entity';
import { InitialAddTeamMemberDto } from './dto/input/initial-add-team-member.input';

@Resolver()
export class CompanyResolver {
  constructor(private readonly companyService: CompanyService) {}

  @UseGuards(GqlAuthGuard)
  @Query(() => [UserCompanyList])
  async userCompanyList(@CurrentUser() user: User) {
    return this.companyService.getUserCompanyList(user._id);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [CompanyListWithCreatorFlag])
  async userCompanyListWithCreatorFlag(@CurrentUser() user: User) {
    return this.companyService.getUserCompanyListWithCreatorFlag(user._id);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => CompanyDetail)
  async getCompanyDetail(
    @Args('company') company: CompanyIdOnlyInput,
    @CurrentUser() user: User,
  ) {
    return this.companyService.getCompanyDetail(user, company);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => RegisterCompanyResponse)
  async registerCompany(
    @Args('createCompanyInput') createCompanyInput: CreateCompanyInput,
    @CurrentUser() user: User,
  ) {
    const userId = user._id;
    return this.companyService.registerCompany(createCompanyInput, userId);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Company)
  async updateCompany(
    @Args('updateCompanyInput') updateCompanyInput: UpdateCompanyInput,
    @CurrentUser() user: User,
  ) {
    return this.companyService.updateCompany(user, updateCompanyInput);
  }

  @Mutation(() => FileUrl)
  async uploadCompanyLogo(
    @Args('file', { type: () => GraphQLUpload }) file: FileUpload,
  ) {
    return this.companyService.uploadFile(file);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => TeamMembersList)
  async getTeamMembers(
    @CurrentUser() user: User,
    @Args('teamMembersListInput') teamMembersListInput: TeamMemberListInput,
  ) {
    return this.companyService.getTeamMembers(user, teamMembersListInput);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [User])
  async getTeamMembersWithQuestionPermission(
    @CurrentUser() user: User,
    @Args('teamMembersListInput') teamMembersListInput: TeamMemberListInput,
  ) {
    return this.companyService.getTeamMembersWithQuestionPermission(
      teamMembersListInput,
    );
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => CompanyTeamMember)
  async getTeamMember(
    @CurrentUser() user: User,
    @Args('teamMemberDetailInput')
    teamMemberDetailInput: TeamMemberDetailInputDto,
  ) {
    return this.companyService.getTeamMember(user, teamMemberDetailInput);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Message)
  async addTeamMember(
    @CurrentUser() user: User,
    @Args('teamMemberInput') teamMemberInput: AddTeamMemberDto,
  ) {
    return this.companyService.addTeamMember(user, teamMemberInput);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Message)
  async initialAddTeamMember(
    @CurrentUser() user: User,
    @Args('initalTeamMemberInput') teamMemberInput: InitialAddTeamMemberDto,
  ) {
    return this.companyService.initialAddTeamMember(user, teamMemberInput);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Message)
  async skipInviteTeam(@Args('companyId') companyId: string) {
    return await this.companyService.skipInviteTeam(companyId);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Message)
  async updateTeamMemberDetail(
    @CurrentUser() user: User,
    @Args('teamMemberInput') teamMemberInput: UpdateTeamMemberDetailDto,
  ) {
    return this.companyService.updateTeamMemberDetail(user, teamMemberInput);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Message)
  async deleteTeamMember(
    @CurrentUser() user: User,
    @Args('teamMemberInput') teamMemberInput: TeamMemberDetailInputDto,
  ) {
    return this.companyService.deleteTeamMember(user, teamMemberInput);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Message)
  async updateTeamMemberPermissions(
    @CurrentUser() user: User,
    @Args('teamMemberPermissionsInput')
    teamMemberPermissionsInput: UpdateTeamMemberPermissionInput,
  ) {
    return this.companyService.updateTeamMemberPermissions(
      user,
      teamMemberPermissionsInput,
    );
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Message)
  async removeCompany(
    @CurrentUser() user: UserDocument,
    @Args('removeCompanyInput') removeCompanyInput: IdOnly,
  ) {
    return this.companyService.removeCompany(user, removeCompanyInput);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => TeamNameResponse)
  async addTeamName(
    @CurrentUser() user: User,
    @Args('teamNameInput') teamNameInput: AddTeamNameInputDto,
  ) {
    return this.companyService.addTeamName(teamNameInput);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => TeamNameResponse)
  async getTeamName(
    @CurrentUser() user: User,
    @Args('companyId') companyId: string,
  ) {
    return this.companyService.getTeamName(companyId);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => Subscription)
  async getSubscription(
    @CurrentUser() user: User,
    @Args('companyId') companyId: string,
  ) {
    return this.companyService.getSubscription(companyId);
  }
}
