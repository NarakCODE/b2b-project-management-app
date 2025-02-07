import { Separator } from '@/components/ui/separator';
import InviteMember from '@/components/workspace/member/invite-member';
import AllMembers from '@/components/workspace/member/all-members';
import WorkspaceHeader from '@/components/workspace/common/workspace-header';
import useWorkspaceId from '@/hooks/use-workspace-id';
import useGetWorkspaceMembers from '@/hooks/api/use-get-workspace-members';
import SkeletonWrapper from '@/components/ui/skeleton-wrapper';

export default function Members() {
  const workspaceId = useWorkspaceId();
  const { data, isPending } = useGetWorkspaceMembers(workspaceId);
  const members = data?.members || [];

  return (
    <div className='w-full h-auto pt-2'>
      <WorkspaceHeader />
      <Separator className='my-4 ' />
      <main>
        <div className='w-full max-w-3xl mx-auto pt-3'>
          {/* <Separator className='my-4' /> */}

          <InviteMember />
          <Separator className='my-4 !h-[0.5px]' />
          <SkeletonWrapper isLoading={isPending}>
            <div className='flex -space-x-[0.45rem] mb-2'>
              {members?.slice(0, 3).map(member => (
                <img
                  className='rounded-full ring-1 ring-background'
                  src={member?.userId.profilePicture || ''}
                  width={24}
                  height={24}
                  alt={member?.userId.name}
                />
              ))}
            </div>
          </SkeletonWrapper>
          <div>
            <h2 className='text-lg leading-[30px] font-semibold mb-1'>
              Workspace members
            </h2>
            <p className='text-sm text-muted-foreground'>
              Workspace members can view and join all Workspace project, tasks
              and create new task in the Workspace.
            </p>
          </div>

          <AllMembers />
        </div>
      </main>
    </div>
  );
}
