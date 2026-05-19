import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AgentsService } from './agents.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentAgent } from '../common/decorators/current-agent.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateBusinessDetailsDto } from './dto/update-business-details.dto';
import { SetupWorkspaceDto } from './dto/setup-workspace.dto';
import { JwtPayload } from '../auth/strategies/jwt-access.strategy';

@Controller('agents')
@UseGuards(JwtAuthGuard)
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Get('me')
  getMe(@CurrentAgent() agent: JwtPayload) {
    return this.agentsService.getMe(agent.sub);
  }

  @Patch('profile')
  @HttpCode(HttpStatus.OK)
  updateProfile(@CurrentAgent() agent: JwtPayload, @Body() dto: UpdateProfileDto) {
    return this.agentsService.updateProfile(agent.sub, dto);
  }

  @Patch('business-details')
  @HttpCode(HttpStatus.OK)
  updateBusinessDetails(@CurrentAgent() agent: JwtPayload, @Body() dto: UpdateBusinessDetailsDto) {
    return this.agentsService.updateBusinessDetails(agent.sub, dto);
  }

  @Post('workspace')
  @HttpCode(HttpStatus.CREATED)
  setupWorkspace(@CurrentAgent() agent: JwtPayload, @Body() dto: SetupWorkspaceDto) {
    return this.agentsService.setupWorkspace(agent.sub, dto);
  }

  @Patch('complete-onboarding')
  @HttpCode(HttpStatus.OK)
  completeOnboarding(@CurrentAgent() agent: JwtPayload) {
    return this.agentsService.completeOnboarding(agent.sub);
  }
}
