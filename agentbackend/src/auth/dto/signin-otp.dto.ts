import { IsString, IsNotEmpty, Matches, Length } from 'class-validator';

export class SigninOtpDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[6-9]\d{9}$/, { message: 'mobile must be a valid 10-digit Indian mobile number' })
  mobile: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'otp must be exactly 6 digits' })
  otp: string;
}
