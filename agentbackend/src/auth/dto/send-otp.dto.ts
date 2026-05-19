import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class SendOtpDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[6-9]\d{9}$/, { message: 'mobile must be a valid 10-digit Indian mobile number' })
  mobile: string;
}
