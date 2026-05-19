import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsArray,
  IsIn,
  IsEnum,
} from 'class-validator';
import { TeamType } from '../entities/workspace.entity';

const VALID_PRODUCT_INTERESTS = ['Health', 'Car', 'Two-Wheeler', 'Term', 'Travel'];

export class SetupWorkspaceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  businessName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  city: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  state: string;

  @IsArray()
  @IsIn(VALID_PRODUCT_INTERESTS, { each: true })
  productInterests: string[];

  @IsEnum(TeamType)
  teamType: TeamType;
}
