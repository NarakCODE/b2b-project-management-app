import { Link, useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import Logo from '@/components/logo';
import GoogleOauthButton from '@/components/auth/google-oauth-button';
import {
  RegisterRequestSchema,
  RegisterRequestSchemaType,
} from '@/lib/validators';
import { useMutation } from '@tanstack/react-query';
import { registerMutationFn } from '@/lib/api';
import { toast } from 'sonner';
import { Loader } from 'lucide-react';

const SignUp = () => {
  const navigate = useNavigate();

  const { mutate, isPending } = useMutation({
    mutationFn: registerMutationFn,
    onSuccess: () => {
      navigate('/');
      toast.success('Signup successful');
      form.reset({
        name: '',
        email: '',
        password: '',
      });
    },

    onError: error => {
      console.log(error);
      toast.error('Something went wrong');
    },
  });

  const form = useForm<RegisterRequestSchemaType>({
    resolver: zodResolver(RegisterRequestSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = (values: RegisterRequestSchemaType) => {
    mutate(values);
  };

  return (
    <div className='flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10'>
      <div className='flex w-full max-w-sm flex-col gap-6'>
        <Link
          to='/'
          className='flex items-center gap-2 self-center font-medium'
        >
          <Logo />
          B2B
        </Link>
        <div className='flex flex-col gap-6'>
          <Card>
            <CardHeader className='text-center'>
              <CardTitle className='text-xl'>Create an account</CardTitle>
              <CardDescription>
                Signup with your Email or Google account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <div className='grid gap-6'>
                    <div className='flex flex-col gap-4'>
                      <GoogleOauthButton label='Signup' />
                    </div>
                    <div className='relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border'>
                      <span className='relative z-10 bg-background px-2 text-muted-foreground'>
                        Or continue with
                      </span>
                    </div>
                    <div className='grid gap-2'>
                      <div className='grid gap-2'>
                        <FormField
                          control={form.control}
                          name='name'
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className='text-foreground text-sm'>
                                Username
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder='Enter your name'
                                  className='!h-[48px]'
                                  {...field}
                                />
                              </FormControl>

                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className='grid gap-2'>
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
                                  placeholder='example@gmail.com'
                                  className='!h-[48px]'
                                  {...field}
                                />
                              </FormControl>

                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className='grid gap-2'>
                        <FormField
                          control={form.control}
                          name='password'
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className='text-foreground text-sm'>
                                Password
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder='New password'
                                  type='password'
                                  className='!h-[48px]'
                                  {...field}
                                />
                              </FormControl>

                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <Button type='submit' className='w-full'>
                        Sign up
                      </Button>
                    </div>
                    <div className='text-center text-sm'>
                      Already have an account?{' '}
                      <Link to='/' className='underline underline-offset-4'>
                        {isPending && <Loader className='animate-spin' />}
                        Sign in
                      </Link>
                    </div>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
          <div className='text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary  '>
            By clicking continue, you agree to our{' '}
            <Link to='#'>Terms of Service</Link> and{' '}
            <Link to='#'>Privacy Policy</Link>.
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
