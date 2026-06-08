import { SetMetadata } from '@nestjs/common';
import { PermissionType } from '../../common/enums/role.enum';

export const PERMISSIONS_KEY = 'permissions';
export const Permissions = (...permissions: PermissionType[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
