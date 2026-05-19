import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';

import { AuthModule } from './auth/auth.module';
import { AgentsModule } from './agents/agents.module';
import { OtpModule } from './otp/otp.module';

import { Agent } from './agents/entities/agent.entity';
import { AgentProfile } from './agents/entities/agent-profile.entity';
import { Workspace } from './agents/entities/workspace.entity';
import { Otp } from './otp/entities/otp.entity';
import { RefreshToken } from './auth/entities/refresh-token.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 30,
      },
    ]),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get<string>('DB_USER', 'postgres'),
        password: config.get<string>('DB_PASS', 'postgres'),
        database: config.get<string>('DB_NAME', 'agentapp'),
        entities: [Agent, AgentProfile, Workspace, Otp, RefreshToken],
        synchronize: config.get<string>('NODE_ENV') !== 'production',
        logging: config.get<string>('NODE_ENV') === 'development',
      }),
    }),

    AuthModule,
    AgentsModule,
    OtpModule,
  ],
})
export class AppModule {}
