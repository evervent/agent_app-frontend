import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class SigninPasswordDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[6-9]\d{9}$/, { message: 'mobile must be a valid 10-digit Indian mobile number' })
  mobile: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{6}$/, { message: 'MPIN must be exactly 6 digits' })
  password: string;
}
