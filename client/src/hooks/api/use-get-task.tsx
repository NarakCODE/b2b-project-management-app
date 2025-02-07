import { getTaskByIdQueryFn } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

const useGetTask = (taskId: string, projectId: string, workspaceId: string) => {
  const query = useQuery({
    queryKey: ['single-task', taskId, projectId, workspaceId],
    queryFn: () => getTaskByIdQueryFn({ taskId, projectId, workspaceId }),
    staleTime: Infinity,
    enabled: !!taskId,
  });

  return query;
};

export default useGetTask;
