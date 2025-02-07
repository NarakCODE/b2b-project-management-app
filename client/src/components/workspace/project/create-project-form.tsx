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
import { Textarea } from '../../ui/textarea';
import EmojiPickerComponent from '@/components/emoji-picker';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CreateProjectRequestSchema,
  CreateProjectRequestSchemaType,
} from '@/lib/validators';
import { createProjectMutationFn } from '@/lib/api';
import { toast } from 'sonner';
import useWorkspaceId from '@/hooks/use-workspace-id';
import { Loader } from 'lucide-react';

export default function CreateProjectForm({
  onClose,
}: {
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const workspaceId = useWorkspaceId();

  const [emoji, setEmoji] = useState('📊');

  const { mutate, isPending } = useMutation({
    mutationFn: createProjectMutationFn,
    onSuccess: data => {
      const project = data.project;
      queryClient.invalidateQueries({
        queryKey: ['all-projects', workspaceId],
      });

      toast.success('Project created successfully');

      navigate(`/workspace/${workspaceId}/project/${project._id}`);
      // setTimeout(() => onClose(), 500);
      onClose();
      form.reset({
        name: '',
        description: '',
      });
    },

    onError: error => {
      toast.error(`Something went wrong: ${error.message}`);
    },
  });

  const form = useForm<CreateProjectRequestSchemaType>({
    resolver: zodResolver(CreateProjectRequestSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const handleEmojiSelection = (emoji: string) => {
    setEmoji(emoji);
  };

  const onSubmit = (values: CreateProjectRequestSchemaType) => {
    if (isPending) return;
    const payload = {
      workspaceId,
      data: {
        emoji,
        ...values,
      },
    };

    mutate(payload);
  };

  return (
    <div className='w-full h-auto max-w-full'>
      <div className='h-full'>
        <div className='mb-5 pb-2 border-b'>
          <h1
            className='text-xl tracking-[-0.16px] text-foreground font-semibold mb-1
           text-center sm:text-left'
          >
            Create Project
          </h1>
          <p className='text-muted-foreground text-sm leading-tight'>
            Organize and manage tasks, resources, and team collaboration
          </p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className='mb-4'>
              <label className='block text-sm font-medium text-gray-700'>
                Select Emoji
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant='outline'
                    className='font-normal size-[60px] !p-2 !shadow-none mt-2 items-center rounded-full '
                  >
                    <span className='text-4xl'>{emoji}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent align='start' className=' !p-0'>
                  <EmojiPickerComponent onSelectEmoji={handleEmojiSelection} />
                </PopoverContent>
              </Popover>
            </div>
            <div className='mb-4'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-foreground text-sm'>
                      Project title
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Website design'
                        className='!h-[48px]'
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
                      Project description
                      <span className='text-xs ml-2'>(Optional)</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        rows={4}
                        placeholder='We are going to build a website for our company...'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              disabled={isPending}
              className='flex place-self-end'
              type='submit'
            >
              {isPending && <Loader className='animate-spin' />}
              Create
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
