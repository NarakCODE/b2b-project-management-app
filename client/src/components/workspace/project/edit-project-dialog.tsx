import { Edit3 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import EditProjectForm from './edit-project-form';
import { ProjectType } from '@/types/api.type';
import { useState } from 'react';
import { DialogTitle } from '@radix-ui/react-dialog';

const EditProjectDialog = (props: { project?: ProjectType }) => {
  const [isOpen, setIsOpen] = useState(false);

  const onClose = () => {
    setIsOpen(false);
  };
  return (
    <div>
      <Dialog modal={true} open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger className='mt-1.5' asChild>
          <button>
            <Edit3 className='w-5 h-5' />
          </button>
        </DialogTrigger>
        <DialogContent className='sm:max-w-lg border-0'>
          <DialogTitle className='text-xl font-semibold'>
            Edit Project
          </DialogTitle>
          <DialogDescription>
            Update the project details to refine task management
          </DialogDescription>
          <EditProjectForm project={props.project} onClose={onClose} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EditProjectDialog;
