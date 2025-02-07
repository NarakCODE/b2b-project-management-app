import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '../ui/textarea';
import {
  EditWorkspaceRequestSchema,
  EditWorkspaceRequestSchemaType,
} from '@/lib/validators';
import { useAuthContext } from '@/context/auth-provider';
import { Permissions } from '@/constant';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { editWorkspaceMutationFn } from '@/lib/api';
import { toast } from 'sonner';
import useWorkspaceId from '@/hooks/use-workspace-id';
import { Loader } from 'lucide-react';

export default function EditWorkspaceForm() {
  const { workspace, hasPermission } = useAuthContext();
  const canEditWorkspace = hasPermission(Permissions.EDIT_WORKSPACE);

  const queryClient = useQueryClient();
  const workspaceId = useWorkspaceId();

  const { mutate, isPending } = useMutation<
    void,
    Error,
    { workspaceId: string; data: EditWorkspaceRequestSchemaType }
  >({
    mutationFn: ({
      workspaceId,
      data,
    }: {
      workspaceId: string;
      data: EditWorkspaceRequestSchemaType;
    }) => editWorkspaceMutationFn(workspaceId, data),

    onSuccess: () => {
      toast.success('Workspace updated successfully');
      queryClient.invalidateQueries({
        queryKey: ['workspaces'],
      });
    },
    onError: (error: Error) => {
      toast.error(`Something went wrong: ${error.message}`);
    },
  });

  const form = useForm<EditWorkspaceRequestSchemaType>({
    resolver: zodResolver(EditWorkspaceRequestSchema),
    defaultValues: {
      name: workspace?.name || '',
      description: workspace?.description || '',
    },
  });

  const onSubmit = (values: EditWorkspaceRequestSchemaType) => {
    const payload = {
      workspaceId,
      data: values,
    };
    mutate(payload);
  };

  return (
    <div className='w-full h-auto max-w-full'>
      <div className='h-full'>
        <div className='mb-5 border-b'>
          <h1
            className='text-[17px] tracking-[-0.16px] text-foreground font-semibold mb-1.5
           text-center sm:text-left'
          >
            Edit Workspace
          </h1>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className='mb-4'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-foreground text-sm'>
                      Workspace name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Narak's Co."
                        className='!h-[48px] disabled:opacity-90 disabled:pointer-events-none'
                        disabled={!canEditWorkspace}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className='mb-4'>
              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-foreground text-sm'>
                      Workspace description
                      <span className='text-xs  ml-2'>(Optional)</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        rows={6}
                        disabled={!canEditWorkspace}
                        className='disabled:opacity-90 disabled:pointer-events-none'
                        placeholder='Our team organizes marketing projects and tasks here.'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button
              className='flex place-self-end'
              disabled={
                isPending ||
                !form.formState.isValid ||
                !form.formState.isDirty ||
                !canEditWorkspace
              }
              type='submit'
            >
              {isPending && <Loader className='animate-spin' />}
              Update Workspace
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
