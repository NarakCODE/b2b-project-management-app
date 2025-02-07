import { PermissionType } from '../enums/role.enum';
import { UnauthorizedException } from './appError';
import { RolePermissions } from './role-permission';

export const roleGuard = (
  role: keyof typeof RolePermissions,
  requiredPermissions: PermissionType[]
) => {
  const permissions = RolePermissions[role];

  if (!permissions) {
    throw new UnauthorizedException(
      `Role "${role}" does not exist or is invalid.`
    );
  }

  // If the role does not have the required permissions, return an error
  const hasPermissions = requiredPermissions.every(permission =>
    permissions?.includes(permission)
  );

  if (!hasPermissions) {
    throw new UnauthorizedException(
      "You don't have the required permissions to perform this action"
    );
  }
};
