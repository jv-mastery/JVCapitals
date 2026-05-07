import { QueryClient } from '@tanstack/react-query';

// Create QueryClient instance
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Time in ms that data remains fresh
      staleTime: 5 * 60 * 1000, // 5 minutes
      
      // Time in ms that inactive queries will be garbage collected
      gcTime: 10 * 60 * 1000, // 10 minutes
      
      // Number of retry attempts on failed queries
      retry: (failureCount, error) => {
        // Don't retry on 401 errors (auth issues)
        if (error?.response?.status === 401) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      
      // Retry delay with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Enable refetch on window focus
      refetchOnWindowFocus: false,
      
      // Enable refetch on reconnect
      refetchOnReconnect: true,
      
      // Don't refetch on component mount if data is fresh
      refetchOnMount: false,
    },
    
    mutations: {
      // Number of retry attempts on failed mutations
      retry: 1,
      
      // Retry delay for mutations
      retryDelay: 1000,
    },
  },
});

export default queryClient;
