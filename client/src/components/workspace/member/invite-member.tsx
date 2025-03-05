import PermissionsGuard from '@/components/resuable/permission-guard';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Permissions } from '@/constant';
import { useAuthContext } from '@/context/auth-provider';
import { toast } from '@/hooks/use-toast';
import { BASE_ROUTE } from '@/routes/common/routePaths';
import { Loader } from 'lucide-react';
import { useState } from 'react';
import InviteMemberDialog from './invite-member-dialog';

interface InviteMemberProps {
  members: {
    _id: string;
    userId: {
      _id: string;
      name: string;
      email: string;
      profilePicture: string | null;
    };
    workspaceId: string;
    role: {
      _id: string;
      name: string;
    };
    joinedAt: string;
    createdAt: string;
  }[];
}

const InviteMember = ({ members }: InviteMemberProps) => {
  const { workspace, workspaceLoading } = useAuthContext();
  const [copied, setCopied] = useState(false);

  const inviteUrl = workspace
    ? `${window.location.origin}${BASE_ROUTE.INVITE_URL.replace(
        ':inviteCode',
        workspace.inviteCode
      )}`
    : '';
  const handleCopy = () => {
    if (inviteUrl) {
      navigator.clipboard.writeText(inviteUrl).then(() => {
        setCopied(true);
        toast({
          title: 'Copied',
          description: 'Invite url copied to clipboard',
          variant: 'success',
        });
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };
  return (
    <div className='flex flex-col pt-0.5 px-0 '>
      <div className='bg-background flex items-center w-fit p-1 rounded-full border'>
        {members?.slice(0, 3).map(member => (
          <div className='flex -space-x-1.5  '>
            <img
              className='ring-background rounded-full ring-1'
              src={member?.userId.profilePicture || ''}
              width={24}
              height={24}
              alt={member?.userId.name}
            />
          </div>
        ))}
      </div>
      <h5 className='text-lg  leading-[30px] font-semibold mb-1'>
        Invite members to join you
      </h5>
      <p className='text-sm text-muted-foreground leading-tight'>
        Anyone with an invite link can join this free Workspace. You can also
        disable and create a new invite link for this Workspace at any time.
      </p>

      <PermissionsGuard showMessage requiredPermission={Permissions.ADD_MEMBER}>
        {workspaceLoading ? (
          <Loader className='animate-spin flex place-self-center' />
        ) : (
          <div className='my-4 flex gap-3 flex-col'>
            <InviteMemberDialog
              handleCopy={handleCopy}
              copied={copied}
              inviteUrl={inviteUrl}
              trigger={
                <Button variant='outline' className='w-fit'>
                  Invite members
                </Button>
              }
            />
          </div>
        )}
      </PermissionsGuard>
    </div>
  );
};

export default InviteMember;
