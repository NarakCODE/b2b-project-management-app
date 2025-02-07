import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
import { useAuthContext } from '@/context/auth-provider';
import { getAvatarColor, getAvatarFallbackText } from '@/lib/helper';
import { Check, PencilLine, Loader } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { updateUserMutationFn } from '@/lib/api';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  UpdateUserRequestSchema,
  UpdateUserRequestSchemaType,
} from '@/lib/validators';
import useGetCurrentUserQuery from '@/hooks/api/user-get-current-user';
import SkeletonWrapper from '@/components/ui/skeleton-wrapper';

const Profile = () => {
  const { user } = useAuthContext();
  const [isEditMode, setIsEditMode] = useState(false);
  const queryClient = useQueryClient();

  const userId = user?._id as string;

  const { data: currentUser, isLoading } = useGetCurrentUserQuery(userId);
  const userData = currentUser?.user;

  const { mutate, isPending } = useMutation({
    mutationFn: updateUserMutationFn,
    onSuccess: async data => {
      // Immediately update the cache with the new data
      queryClient.setQueryData(['single-user', userId], {
        user: data.user,
      });

      queryClient.invalidateQueries({
        queryKey: ['members'],
      });

      // Then invalidate to refetch in the background
      await queryClient.invalidateQueries({
        queryKey: ['single-user', userId],
        exact: true,
      });

      // Also invalidate any parent queries that might include this user data
      await queryClient.invalidateQueries({
        queryKey: ['single-user'],
        refetchType: 'inactive',
      });

      toast.success('User updated successfully');
      setIsEditMode(false);
    },
    onError: error => {
      toast.error(`Something went wrong: ${error.message}`);
    },
  });

  const form = useForm<UpdateUserRequestSchemaType>({
    resolver: zodResolver(UpdateUserRequestSchema),
    defaultValues: {
      name: userData?.name || '',
      email: userData?.email || '',
      profilePicture: userData?.profilePicture || '',
    },
  });

  useEffect(() => {
    if (userData) {
      form.reset({
        name: userData.name || '',
        email: userData.email || '',
        profilePicture: userData.profilePicture || '',
      });
    }
  }, [userData, form]);

  const initials = getAvatarFallbackText(
    userData?.name || (user?.name as string)
  );
  const avatarColor = getAvatarColor(userData?.name || (user?.name as string));

  const onSubmit = (values: UpdateUserRequestSchemaType) => {
    const payload = {
      userId,
      data: {
        name: values.name,
        email: values.email,
        profilePicture: values.profilePicture || '',
      },
    };
    mutate(payload);
  };

  return (
    <div className='w-full h-full flex-col space-y-8 pt-3'>
      <div className='flex items-center justify-between space-y-2'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>
            Profile Settings
          </h2>
          <p className='text-muted-foreground'>
            Manage your account settings and set e-mail preferences.
          </p>
        </div>
      </div>
      <div className='w-full max-w-2xl'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <SkeletonWrapper isLoading={isLoading}>
              <Card className='shadow-none'>
                <CardHeader>
                  <div className='w-full flex items-start justify-between'>
                    <Avatar className='h-24 w-24'>
                      <AvatarImage
                        src={
                          userData?.profilePicture || user?.profilePicture || ''
                        }
                        alt='Profile Picture'
                        className='object-cover'
                        onError={e => {
                          e.currentTarget.src = '';
                        }}
                      />
                      <AvatarFallback className={avatarColor}>
                        {initials}
                      </AvatarFallback>
                    </Avatar>

                    {isEditMode ? (
                      <Button
                        size='sm'
                        variant='outline'
                        type='submit'
                        disabled={isPending}
                      >
                        {isPending ? (
                          <Loader className='animate-spin' />
                        ) : (
                          <Check />
                        )}
                        {isPending ? 'Saving...' : 'Done'}
                      </Button>
                    ) : (
                      <Button
                        size='sm'
                        variant='outline'
                        type='button'
                        disabled={!form.formState.isDirty}
                        onClick={() => setIsEditMode(true)}
                      >
                        <PencilLine />
                        Edit
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='space-y-6'>
                    <FormField
                      control={form.control}
                      name='profilePicture'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='text-foreground text-sm'>
                            Profile Picture URL
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder='Profile Picture URL...'
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Enter the URL of your profile picture.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='name'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='text-foreground text-sm'>
                            Username
                          </FormLabel>
                          <FormControl>
                            <Input placeholder='Username' {...field} />
                          </FormControl>
                          <FormDescription>
                            This is the name that you want to display.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='email'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='text-foreground text-sm'>
                            Email
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder='Email'
                              {...field}
                              disabled={true}
                            />
                          </FormControl>
                          <FormDescription>
                            This is the email address that you want to display.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </SkeletonWrapper>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default Profile;
