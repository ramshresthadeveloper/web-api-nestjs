import { IsString } from 'class-validator';

export class CreateBrowserInfoDto {
  @IsString()
  userId: string;

  @IsString()
  fingerprint: string;

  @IsString()
  firebaseToken?: string;
}
