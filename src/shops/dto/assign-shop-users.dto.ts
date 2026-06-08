import { ArrayNotEmpty, IsArray, IsUUID } from 'class-validator';

export class AssignShopUsersDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  userIds: string[];
}
