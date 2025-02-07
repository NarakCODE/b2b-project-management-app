import { getSingleUserQueryFn } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

const useGetCurrentUserQuery = (userId: string) => {
  const query = useQuery({
    queryKey: ['single-user', userId],
    queryFn: () => getSingleUserQueryFn(userId),
    staleTime: Infinity,
  });
  return query;
};

export default useGetCurrentUserQuery;
