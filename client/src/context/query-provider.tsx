import  { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from './theme-provider';
import { Toaster } from 'sonner';

interface Props {
  children: ReactNode;
}

export default function QueryProvider({ children }: Props) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          if (failureCount < 2 && error?.message === 'Network Error') {
            return true;
          }
          return false;
        },
        retryDelay: 0,
      },
    },
  });
  return (
    <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />
        <Toaster />
        {children}
      </QueryClientProvider>
    </ThemeProvider>
  );
}
