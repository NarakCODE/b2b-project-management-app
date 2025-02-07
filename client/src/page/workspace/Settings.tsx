import WorkspaceHeader from '@/components/workspace/common/workspace-header';
import EditWorkspaceForm from '@/components/workspace/edit-workspace-form';
import DeleteWorkspaceCard from '@/components/workspace/settings/delete-workspace-card';
import { Permissions } from '@/constant';
import { useAuthContext } from '@/context/auth-provider';
import withPermission from '@/hoc/with-permission';
import { TriangleAlert } from 'lucide-react';

const Settings = () => {
  const { hasPermission } = useAuthContext();
  const canEditWorkspace = hasPermission(Permissions.EDIT_WORKSPACE);
  const canDeleteWorkspace = hasPermission(Permissions.DELETE_WORKSPACE);

  return (
    <div className='w-full h-auto py-2'>
      {/* <Separator className='my-4 ' /> */}
      <main>
        <div className='w-full max-w-3xl mx-auto py-3'>
          <h2 className='text-[20px] leading-[30px] font-semibold mb-8'>
            Workspace Settings
          </h2>

          {!canEditWorkspace && !canDeleteWorkspace && (
            <div className='rounded-lg border border-border px-4 py-3  my-8'>
              <p className='text-sm'>
                <TriangleAlert
                  className='-mt-0.5 me-3 inline-flex text-amber-500'
                  size={16}
                  strokeWidth={2}
                  aria-hidden='true'
                />
                You do not have the permission for this workspace settings.
              </p>
            </div>
          )}

          <WorkspaceHeader />

          <div className='flex flex-col mt-8 gap-8'>
            <EditWorkspaceForm />
            <DeleteWorkspaceCard />
          </div>
        </div>
      </main>
    </div>
  );
};

const SettingsWithPermission = withPermission(Settings, Permissions.VIEW_ONLY);

export default SettingsWithPermission;
