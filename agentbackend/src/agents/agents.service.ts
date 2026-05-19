import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Agent, OnboardingStep } from './entities/agent.entity';
import { AgentProfile } from './entities/agent-profile.entity';
import { Workspace } from './entities/workspace.entity';

import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateBusinessDetailsDto } from './dto/update-business-details.dto';
import { SetupWorkspaceDto } from './dto/setup-workspace.dto';

const PROFILE_FIELDS: Array<keyof AgentProfile> = [
  'irdaLicenseNumber',
  'agencyName',
  'city',
  'state',
  'experienceYears',
  'productLines',
  'address',
  'photographUrl',
  'panNumber',
  'bankAccountNumber',
  'ifscCode',
  'gstNumber',
];

@Injectable()
export class AgentsService {
  constructor(
    @InjectRepository(Agent)
    private readonly agentRepository: Repository<Agent>,
    @InjectRepository(AgentProfile)
    private readonly profileRepository: Repository<AgentProfile>,
    @InjectRepository(Workspace)
    private readonly workspaceRepository: Repository<Workspace>,
  ) {}

  async getMe(agentId: string) {
    const agent = await this.agentRepository.findOne({ where: { id: agentId } });
    if (!agent) throw new NotFoundException('Agent not found.');

    const profile = await this.profileRepository.findOne({ where: { agentId } });
    const workspace = await this.workspaceRepository.findOne({ where: { agentId } });

    const { passwordHash, ...safeAgent } = agent as any;
    return { agent: safeAgent, profile: profile ?? null, workspace: workspace ?? null };
  }

  async updateProfile(agentId: string, dto: UpdateProfileDto) {
    let profile = await this.profileRepository.findOne({ where: { agentId } });
    if (!profile) {
      profile = this.profileRepository.create({ agentId });
    }

    Object.assign(profile, dto);
    profile.profileCompletionPercentage = this.calculateCompletion(profile);
    await this.profileRepository.save(profile);

    // Advance onboarding step if still on profile
    const agent = await this.agentRepository.findOne({ where: { id: agentId } });
    if (agent && agent.onboardingStep === OnboardingStep.PROFILE) {
      agent.onboardingStep = OnboardingStep.BUSINESS;
      await this.agentRepository.save(agent);
    }

    return { profile, onboardingStep: agent?.onboardingStep };
  }

  async updateBusinessDetails(agentId: string, dto: UpdateBusinessDetailsDto) {
    let profile = await this.profileRepository.findOne({ where: { agentId } });
    if (!profile) {
      profile = this.profileRepository.create({ agentId });
    }

    Object.assign(profile, dto);
    profile.profileCompletionPercentage = this.calculateCompletion(profile);
    await this.profileRepository.save(profile);

    // Advance onboarding if still on business step
    const agent = await this.agentRepository.findOne({ where: { id: agentId } });
    if (agent && agent.onboardingStep === OnboardingStep.BUSINESS) {
      agent.onboardingStep = OnboardingStep.WORKSPACE;
      await this.agentRepository.save(agent);
    }

    return { profile, onboardingStep: agent?.onboardingStep };
  }

  async setupWorkspace(agentId: string, dto: SetupWorkspaceDto) {
    const existing = await this.workspaceRepository.findOne({ where: { agentId } });
    if (existing) {
      throw new ConflictException('Workspace already exists for this agent.');
    }

    const workspace = this.workspaceRepository.create({ agentId, ...dto });
    await this.workspaceRepository.save(workspace);

    const agent = await this.agentRepository.findOne({ where: { id: agentId } });
    if (agent && agent.onboardingStep === OnboardingStep.WORKSPACE) {
      agent.onboardingStep = OnboardingStep.COMPLETE;
      await this.agentRepository.save(agent);
    }

    return { workspace, onboardingStep: agent?.onboardingStep };
  }

  async completeOnboarding(agentId: string) {
    const agent = await this.agentRepository.findOne({ where: { id: agentId } });
    if (!agent) throw new NotFoundException('Agent not found.');
    agent.onboardingStep = OnboardingStep.COMPLETE;
    await this.agentRepository.save(agent);
    return { onboardingStep: agent.onboardingStep };
  }

  private calculateCompletion(profile: AgentProfile): number {
    const filled = PROFILE_FIELDS.filter((field) => {
      const val = (profile as any)[field];
      if (Array.isArray(val)) return val.length > 0;
      return val !== null && val !== undefined && val !== '';
    }).length;
    return Math.round((filled / PROFILE_FIELDS.length) * 100);
  }
}
