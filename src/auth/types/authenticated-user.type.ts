import { PermissionType, RoleType } from '../../common/enums/role.enum';

export type AuthenticatedUser = {
  id: string;
  email: string;
  roles: RoleType[];
  permissions: PermissionType[];
};
