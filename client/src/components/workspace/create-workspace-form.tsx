import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '../ui/textarea';
import {
  CreateWorkspaceRequestSchema,
  CreateWorkspaceRequestSchemaType,
  CreateWorkspaceResponseSchemaType,
} from '@/lib/validators';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createWorkspaceMutationFn } from '@/lib/api';
import { toast } from 'sonner';
import { Loader } from 'lucide-react';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateWorkspaceImage from '../../../public/images/create-workspace.svg';

export default function CreateWorkspaceForm({
  onClose,
}: {
  onClose: () => void;
}) {
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation<
    CreateWorkspaceResponseSchemaType,
    Error,
    CreateWorkspaceRequestSchemaType
  >({
    mutationFn: data => createWorkspaceMutationFn(data),
    onSuccess: data => {
      toast.success('Workspace created successfully');

      // Invalidate and refetch the workspaces query
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });

      const workspace = data.workspace;
      onClose();
      navigate(`/workspace/${workspace._id}`);

      form.reset({
        name: '',
        description: '',
      });
    },
    onError: error => {
      toast.error(`Something went wrong: ${error.message}`);
    },
  });

  const form = useForm<CreateWorkspaceRequestSchemaType>({
    resolver: zodResolver(CreateWorkspaceRequestSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const onSubmit = useCallback(
    (values: CreateWorkspaceRequestSchemaType) => {
      mutate(values);
    },
    [mutate]
  );

  return (
    <main className='w-full flex flex-row min-h-[590px] h-auto max-w-full'>
      <div className='h-full px-10 py-10 flex-1'>
        <div className='mb-5'>
          <h1
            className='text-2xl tracking-[-0.16px] text-foreground font-semibold mb-1.5
           text-center sm:text-left'
          >
            Let's build a Workspace
          </h1>
          <p className='text-muted-foreground text-lg leading-tight'>
            Boost your productivity by making it easier for everyone to access
            projects in one location.
          </p>
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
                        placeholder="Taco's Co."
                        className='!h-[48px]'
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      This is the name of your company, team or organization.
                    </FormDescription>
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
                        placeholder='Our team organizes marketing projects and tasks here.'
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Get your members on board with a few words about your
                      Workspace.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              disabled={isPending}
              className='w-full'
              size={'lg'}
              type='submit'
            >
              {isPending && <Loader className='animate-spin' />}
              Create Workspace
            </Button>
          </form>
        </Form>
      </div>
      <div
        className={`relative flex-1 shrink-0 hidden bg-muted md:block
    h-full
      `}
      >
        <img
          src={CreateWorkspaceImage}
          alt='Create Workspace'
          className='w-full h-full object-contain'
        />
      </div>
    </main>
  );
}
