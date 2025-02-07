import { Link, useNavigate, useSearchParams } from 'react-router-dom';
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
import { useMutation } from '@tanstack/react-query';
import { signInMutationFn } from '@/lib/api';
import {
  SignInRequestSchema,
  SignInRequestSchemaType,
  SignInResponseSchemaType,
} from '@/lib/validators';
import { toast } from 'sonner';
import { Loader } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

const SignIn = () => {
  const navigate = useNavigate();
  const [searchParmas] = useSearchParams();
  const returnUrl = searchParmas.get('returnUrl');

  const { mutate, isPending } = useMutation<
    SignInResponseSchemaType,
    Error,
    SignInRequestSchemaType
  >({
    mutationFn: data => signInMutationFn(data),

    onSuccess: data => {
      const { user } = data;

      // Ensure user.currentWorkspace is valid
      const workspacePath = user.currentWorkspace
        ? `/workspace/${user.currentWorkspace}`
        : '/'; // Default to home if workspace is missing

      // Use returnUrl if present, otherwise redirect to workspace
      const redirectUrl = returnUrl
        ? decodeURIComponent(returnUrl)
        : workspacePath;

      console.log('Redirecting to:', redirectUrl);
      navigate(redirectUrl, { replace: true });

      toast.success('Login successful');

      form.reset({
        email: '',
        password: '',
      });
    },

    onError: error => {
      toast.error(`Something went wrong: ${error.message}`);
      toast.dismiss(); // Dismiss the loading toast on error as well
    },
  });

  const form = useForm<SignInRequestSchemaType>({
    resolver: zodResolver(SignInRequestSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: SignInRequestSchemaType) => {
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
              <CardTitle className='text-xl'>Welcome back</CardTitle>
              <CardDescription>
                Login with your Email or Google account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <div className='grid gap-6'>
                    <div className='flex flex-col gap-4'>
                      <GoogleOauthButton label='Login' />
                    </div>
                    <div className='relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border'>
                      <span className='relative z-10 bg-background px-2 text-muted-foreground'>
                        Or continue with
                      </span>
                    </div>
                    <div className='grid gap-3'>
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
                              <div className='flex items-center'>
                                <FormLabel className='text-foreground text-sm'>
                                  Password
                                </FormLabel>
                              </div>
                              <FormControl>
                                <Input
                                  type='password'
                                  className='!h-[48px]'
                                  placeholder='Password'
                                  {...field}
                                />
                              </FormControl>

                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className='flex items-center justify-between gap-4 my-2'>
                        <span className='flex gap-2 items-center text-sm'>
                          <Checkbox />
                          Remember me
                        </span>
                        <Link
                          to='#'
                          className='ml-auto text-sm underline-offset-4 hover:underline'
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <Button
                        disabled={isPending}
                        type='submit'
                        className='w-full'
                      >
                        {isPending && <Loader className='animate-spin' />}
                        Login
                      </Button>
                    </div>
                    <div className='text-center text-sm'>
                      Don&apos;t have an account?{' '}
                      <Link
                        to='/sign-up'
                        className='underline underline-offset-4'
                      >
                        Sign up
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

export default SignIn;
