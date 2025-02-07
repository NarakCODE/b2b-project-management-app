import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { RoleType } from '@/types/api.type';

import { ReactNode } from 'react';

interface Props {
  trigger: ReactNode;
  currentRole: string;
  memberId: string;
  roles: RoleType[];
  handleChangeRole: (data: { memberId: string; roleId: string }) => void;
}

const AssignRoleDropdown = ({
  trigger,
  currentRole,
  memberId,
  roles,
  handleChangeRole,
}: Props) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent>
        {roles.map(role => (
          <DropdownMenuItem
            key={role._id}
            onClick={() => handleChangeRole({ memberId, roleId: role._id })}
            disabled={role.name === currentRole}
          >
            {role.name.toLowerCase()}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
export default AssignRoleDropdown;
