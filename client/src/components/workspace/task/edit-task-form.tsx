import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { TaskPriorityEnum, TaskStatusEnum } from '@/constant';
import useGetTask from '@/hooks/api/use-get-task';
import useGetWorkspaceMembers from '@/hooks/api/use-get-workspace-members';
import useWorkspaceId from '@/hooks/use-workspace-id';
import { updateTaskMutationFn } from '@/lib/api';
import {
  getAvatarColor,
  getAvatarFallbackText,
  transformOptions,
} from '@/lib/helper';
import {
  EditTaskRequestSchema,
  EditTaskRequestSchemaType,
} from '@/lib/validators';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CalendarIcon, Loader } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const EditTaskForm = ({
  taskId,
  onClose,
}: {
  taskId: string;
  onClose: () => void;
}) => {
  const workspaceId = useWorkspaceId();
  const queryClient = useQueryClient();

  const projectId = (useParams().projectId as string) || '';

  // Mutation for updating task
  const { mutate, isPending } = useMutation({
    mutationFn: updateTaskMutationFn,
  });

  // Fetch task data
  const {
    data: taskData,
    isLoading: taskLoading,
    error: taskError,
  } = useGetTask(taskId, projectId, workspaceId);

  // Fetch workspace members
  const { data: memberOptions, isLoading: membersLoading } =
    useGetWorkspaceMembers(workspaceId);

  // Combine all loading states
  const isLoading = taskLoading || membersLoading;

  // Initialize form
  const form = useForm<EditTaskRequestSchemaType>({
    resolver: zodResolver(EditTaskRequestSchema),
    defaultValues: {
      title: '',
      description: '',
      status: undefined,
      priority: undefined,
      assignedTo: '',
      dueDate: null,
    },
  });

  // Update form values when task data is fetched

  useEffect(() => {
    console.log('📌 Task Data Fetched:', taskData);

    if (taskData) {
      form.reset({
        title: taskData.task.title || '',
        description: taskData.task.description || '',
        status: taskData.task.status || undefined,
        priority: taskData.task.priority || undefined,
        assignedTo: taskData.task.assignedTo?._id || '',
        dueDate: taskData.task.dueDate ? new Date(taskData.task.dueDate) : null, // Ensure Date object
      });

      console.log('✅ Form Values After Reset:', form.getValues());
    }
    setTimeout(() => form.trigger(), 100); // Force form to re-evaluate values
  }, [form, taskData]);

  // Generate dropdown options
  const members = memberOptions?.members || [];

  const membersOptions = members.map(member => {
    const name = member.userId?.name || 'Unknown';
    const initials = getAvatarFallbackText(name);
    const avatarColor = getAvatarColor(name);
    return {
      label: (
        <div className='flex items-center space-x-2'>
          <Avatar className='h-7 w-7'>
            <AvatarImage src={member.userId?.profilePicture || ''} alt={name} />
            <AvatarFallback className={avatarColor}>{initials}</AvatarFallback>
          </Avatar>
          <span>{name}</span>
        </div>
      ),
      value: member.userId._id,
    };
  });

  const taskStatusList = Object.values(TaskStatusEnum);
  const taskPriorityList = Object.values(TaskPriorityEnum);

  const statusOptions = transformOptions(taskStatusList);
  const priorityOptions = transformOptions(taskPriorityList);

  // Form submission handler
  const onSubmit = (values: EditTaskRequestSchemaType) => {
    console.log('Submitting...', values);

    const payload = {
      workspaceId,
      projectId,
      taskId,
      data: {
        title: values.title,
        description: values.description,
        status: values.status,
        priority: values.priority,
        assignedTo: values.assignedTo,
        dueDate: values.dueDate ? format(values.dueDate, 'yyyy-MM-dd') : '',
      },
    };

    console.log('Payload to be sent:', payload);

    mutate(payload, {
      onSuccess: data => {
        queryClient.invalidateQueries({ queryKey: ['all-tasks'] });

        toast.success('Task updated successfully');
        console.log('Mutation success:', data);
        onClose();
      },
      onError: error => {
        console.error('Mutation error:', error);
        toast.error(error.message);
      },
    });
  };

  // Handle loading and error states
  if (isLoading) {
    return (
      <div className='space-y-4'>
        <Skeleton className='h-8 w-full' />
        <Skeleton className='h-20 w-full' />
        <Skeleton className='h-8 w-full' />
        <Skeleton className='h-8 w-full' />
        <Skeleton className='h-8 w-full' />
        <Skeleton className='h-8 w-full' />
      </div>
    );
  }

  if (taskError) {
    return <div>Error loading task data. Please try again later</div>;
  }

  return (
    <div className='w-full h-auto max-w-full'>
      <div className='h-full'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            {/* Title */}
            <FormField
              control={form.control}
              name='title'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter task title' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder='Enter task description (optional)'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Assigned To */}
            <FormField
              control={form.control}
              name='assignedTo'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assigned To</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select a member' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {membersOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Due Date */}
            <FormField
              control={form.control}
              name='dueDate'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant='outline'
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP') // Display the formatted date
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className='w-auto p-0' align='start'>
                      <Calendar
                        mode='single'
                        selected={
                          field.value ? new Date(field.value) : undefined
                        }
                        onSelect={date => {
                          if (date) {
                            field.onChange(date); // Pass the selected Date object
                          }
                        }}
                        disabled={date =>
                          date < new Date(new Date().setHours(0, 0, 0, 0)) ||
                          date > new Date('2100-12-31')
                        }
                        initialFocus
                        defaultMonth={new Date()}
                        fromMonth={new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status */}
            <FormField
              control={form.control}
              name='status'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select a status' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {statusOptions.map(status => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Priority */}
            <FormField
              control={form.control}
              name='priority'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select a priority' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {priorityOptions.map(priority => (
                        <SelectItem key={priority.value} value={priority.value}>
                          {priority.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type='submit' className='flex place-self-end'>
              {isPending && <Loader className='animate-spin' />}
              Update
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default EditTaskForm;
