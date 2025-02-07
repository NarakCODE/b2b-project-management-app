import { getProjectAnalyticsQueryFn } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

const useGetProjectAnalyticsQuery = (
  workspaceId: string,
  projectId: string
) => {
  const query = useQuery({
    queryKey: ['project-analytics', workspaceId, projectId],
    queryFn: () => getProjectAnalyticsQueryFn({ workspaceId, projectId }),
    staleTime: Infinity,
    enabled: !!projectId,
  });

  return query;
};

export default useGetProjectAnalyticsQuery;
