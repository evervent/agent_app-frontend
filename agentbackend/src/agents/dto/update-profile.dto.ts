import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  Max,
  MaxLength,
  IsArray,
  IsIn,
} from 'class-validator';

const VALID_PRODUCT_LINES = ['Health', 'Car', 'Two-Wheeler', 'Term', 'Travel'];

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  irdaLicenseNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  agencyName?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(60)
  experienceYears?: number;

  @IsOptional()
  @IsArray()
  @IsIn(VALID_PRODUCT_LINES, { each: true })
  productLines?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  photographUrl?: string;
}
