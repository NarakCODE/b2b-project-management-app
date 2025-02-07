import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Loader, ChevronDown, ShieldCheck } from 'lucide-react';

import { getAvatarColor, getAvatarFallbackText } from '@/lib/helper';
import { useAuthContext } from '@/context/auth-provider';
import useWorkspaceId from '@/hooks/use-workspace-id';
import useGetWorkspaceMembers from '@/hooks/api/use-get-workspace-members';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { changeWorkspaceMemberRoleMutationFn } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { Permissions } from '@/constant';
import { Badge } from '@/components/ui/badge';

const AllMembers = () => {
  const { user, hasPermission } = useAuthContext();

  const canChangeMemberRole = hasPermission(Permissions.CHANGE_MEMBER_ROLE);

  const queryClient = useQueryClient();
  const workspaceId = useWorkspaceId();

  const { data, isPending } = useGetWorkspaceMembers(workspaceId);
  const members = data?.members || [];
  const roles = data?.roles || [];

  const { mutate, isPending: isLoading } = useMutation({
    mutationFn: changeWorkspaceMemberRoleMutationFn,
  });

  const handleSelect = (roleId: string, memberId: string) => {
    if (!roleId || !memberId) return;
    const payload = {
      workspaceId,
      data: {
        roleId,
        memberId,
      },
    };
    mutate(payload, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['members', workspaceId],
        });
        toast({
          title: 'Success',
          description: "Member's role changed successfully",
          variant: 'success',
        });
      },
      onError: error => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };

  return (
    <div className='grid gap-6 pt-2 mt-8'>
      {isPending ? (
        <Loader className='w-8 h-8 animate-spin place-self-center flex' />
      ) : null}

      {members?.map(member => {
        const name = member.userId?.name;
        const initials = getAvatarFallbackText(name);
        const avatarColor = getAvatarColor(name);
        return (
          <div
            className='flex items-center justify-between space-x-4'
            key={member._id}
          >
            <div className='flex items-center space-x-4'>
              <Avatar className='h-8 w-8'>
                <AvatarImage
                  src={member.userId?.profilePicture || ''}
                  alt='Image'
                />
                <AvatarFallback className={avatarColor}>
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className='text-sm font-medium leading-none'>{name}</p>
                <p className='text-sm text-muted-foreground'>
                  {member.userId.email}
                </p>
              </div>
            </div>
            <div className='flex items-center gap-3'>
              {canChangeMemberRole ? (
                <>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        className='w-[124px]'
                        variant='outline'
                        disabled={
                          isLoading ||
                          !canChangeMemberRole ||
                          member.userId._id === user?._id
                        }
                      >
                        {member.role.name?.toLowerCase()}{' '}
                        {canChangeMemberRole &&
                          member.userId._id !== user?._id && (
                            <ChevronDown
                              className='-me-1 ms-2 opacity-60'
                              size={16}
                              strokeWidth={2}
                              aria-hidden='true'
                            />
                          )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {roles?.map(
                        role =>
                          role.name !== 'OWNER' && (
                            <DropdownMenuCheckboxItem
                              key={role._id}
                              disabled={
                                isLoading ||
                                (member.role.name === role.name &&
                                  member.userId._id !== user?._id)
                              }
                              checked={
                                member.role.name === role.name &&
                                member.userId._id !== user?._id
                              }
                              onSelect={() => {
                                handleSelect(role._id, member.userId._id);
                              }}
                            >
                              {role.name?.toLowerCase()}
                            </DropdownMenuCheckboxItem>
                          )
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Badge className='gap-1' variant={'outline'}>
                    {member.role.name?.toLowerCase() === 'owner' && (
                      <ShieldCheck
                        className='-ms-0.5 opacity-60'
                        size={12}
                        strokeWidth={2}
                        aria-hidden='true'
                      />
                    )}
                    {member.role.name?.toLowerCase()}
                  </Badge>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AllMembers;
