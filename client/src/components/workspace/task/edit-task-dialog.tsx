import EditTaskForm from './edit-task-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ReactNode } from 'react';

interface EditTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  trigger?: ReactNode;
}

const EditTaskDialog = ({
  isOpen,
  onClose,
  taskId,
  trigger,
}: EditTaskDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className='sm:max-w-lg border-0'>
        <DialogTitle>Edit Task</DialogTitle>
        <DialogDescription>
          Update the task details to refine task management
        </DialogDescription>
        <EditTaskForm taskId={taskId} onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
};

export default EditTaskDialog;
