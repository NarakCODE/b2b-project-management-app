import { useEffect, useState } from 'react';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '../../ui/textarea';
import EmojiPickerComponent from '@/components/emoji-picker';
import { ProjectType } from '@/types/api.type';
import {
  EditProjectRequestSchema,
  EditProjectRequestSchemaType,
} from '@/lib/validators';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { editProjectMutationFn } from '@/lib/api';
import useWorkspaceId from '@/hooks/use-workspace-id';
import { Loader } from 'lucide-react';

export default function EditProjectForm(props: {
  project?: ProjectType;
  onClose: () => void;
}) {
  const { project, onClose } = props;
  const workspaceId = useWorkspaceId();
  const [emoji, setEmoji] = useState(project?.emoji || '📊');

  const projectId = props.project?._id as string;
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: editProjectMutationFn,
    onSuccess: () => {
      toast.success('Project updated successfully');
      queryClient.invalidateQueries({
        queryKey: ['single-project', workspaceId, projectId],
      });
      queryClient.invalidateQueries({
        queryKey: ['all-projects', workspaceId],
      });
      onClose();
    },

    onError: error => {
      toast.error(`Something went wrong: ${error.message}`);
    },
  });

  const form = useForm<EditProjectRequestSchemaType>({
    resolver: zodResolver(EditProjectRequestSchema),
    defaultValues: {
      name: project?.name || '',
      description: project?.description || '',
    },
  });

  useEffect(() => {
    if (project) {
      setEmoji(project.emoji);
      form.setValue('name', project.name);
      form.setValue('description', project.description);
    }
  }, [form, project]);

  const handleEmojiSelection = (emoji: string) => {
    setEmoji(emoji);
  };

  const onSubmit = (values: EditProjectRequestSchemaType) => {
    if (isPending) return;
    const payload = {
      workspaceId,
      projectId,
      data: {
        emoji,
        ...values,
      },
    };

    mutate(payload);

    console.log(payload);
  };

  return (
    <div className='w-full h-auto max-w-full'>
      <div className='h-full'>
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
                      <Input placeholder='' className='!h-[48px]' {...field} />
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
                      <span className='text-xs  ml-2'>(Optional)</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        rows={4}
                        placeholder='Projects description'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button className='flex place-self-end' type='submit'>
              {isPending && <Loader className='animate-spin' />}
              Update
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
