import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  Matches,
  MaxLength,
} from 'class-validator';

export class SignupDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  fullName: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[6-9]\d{9}$/, { message: 'mobile must be a valid 10-digit Indian mobile number' })
  mobile: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(150)
  email?: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{6}$/, { message: 'MPIN must be exactly 6 digits' })
  password: string;
}
