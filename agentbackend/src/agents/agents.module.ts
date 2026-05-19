import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AgentsController } from './agents.controller';
import { AgentsService } from './agents.service';
import { Agent } from './entities/agent.entity';
import { AgentProfile } from './entities/agent-profile.entity';
import { Workspace } from './entities/workspace.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Agent, AgentProfile, Workspace])],
  controllers: [AgentsController],
  providers: [AgentsService],
  exports: [AgentsService],
})
export class AgentsModule {}
