import { useState } from 'react';
import { Row } from '@tanstack/react-table';
import { MoreHorizontal, PencilLine, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  // DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ConfirmDialog } from '@/components/resuable/confirm-dialog';
import { TaskType } from '@/types/api.type';
import useWorkspaceId from '@/hooks/use-workspace-id';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteTaskMutationFn } from '@/lib/api';
import { toast } from 'sonner';
import { useParams } from 'react-router-dom';
import PermissionsGuard from '@/components/resuable/permission-guard';
import { Permissions } from '@/constant';
import EditTaskDialog from '../edit-task-dialog';

interface DataTableRowActionsProps {
  row: Row<TaskType>;
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const [openDeleteDialog, setOpenDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);

  const queryClient = useQueryClient();
  const workspaceId = useWorkspaceId();
  const params = useParams();

  const projectId = (params.projectId as string) || '';

  const { mutate, isPending } = useMutation({
    mutationFn: deleteTaskMutationFn,
    onSuccess: data => {
      toast.success(`${data.message}`);
      queryClient.invalidateQueries({
        queryKey: ['all-tasks', workspaceId],
      });
      queryClient.invalidateQueries({
        queryKey: ['project-analytics', workspaceId, projectId],
      });
      setOpenDialog(false);
    },
    onError: error => {
      toast.error(`${error.message}`);
    },
  });

  const taskId = row.original._id as string;
  const taskCode = row.original.taskCode;

  const handleConfirm = () => {
    mutate({ taskId, workspaceId });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
          >
            <MoreHorizontal />
            <span className='sr-only'>Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-[160px]'>
          <DropdownMenuItem
            className='cursor-pointer'
            onClick={() => setOpenEditDialog(true)}
          >
            <PencilLine />
            Edit Task
          </DropdownMenuItem>
          <PermissionsGuard requiredPermission={Permissions.DELETE_TASK}>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className={`!text-destructive cursor-pointer ${taskId}`}
              onClick={() => setOpenDialog(true)}
            >
              <Trash2 />
              Delete Task
              {/* <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut> */}
            </DropdownMenuItem>
          </PermissionsGuard>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditTaskDialog
        isOpen={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        taskId={taskId}
      />

      <ConfirmDialog
        isOpen={openDeleteDialog}
        isLoading={isPending}
        onClose={() => setOpenDialog(false)}
        onConfirm={handleConfirm}
        title='Delete Task'
        description={`Are you sure you want to delete ${taskCode}`}
        confirmText='Delete'
        cancelText='Cancel'
      />
    </>
  );
}
