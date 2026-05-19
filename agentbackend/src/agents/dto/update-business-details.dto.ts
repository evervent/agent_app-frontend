import { IsString, IsOptional, Matches, MaxLength } from 'class-validator';

export class UpdateBusinessDetailsDto {
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, { message: 'panNumber must be a valid PAN format (e.g. ABCDE1234F)' })
  panNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  bankAccountNumber?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, { message: 'ifscCode must be a valid IFSC format (e.g. SBIN0001234)' })
  ifscCode?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, {
    message: 'gstNumber must be a valid GST format',
  })
  gstNumber?: string;
}
