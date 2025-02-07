import useWorkspaceId from '@/hooks/use-workspace-id';
import AnalyticsCard from '../common/analytics-card';
import { useParams } from 'react-router-dom';
import useGetProjectAnalyticsQuery from '@/hooks/api/use-get-project-analytics';

const ProjectAnalytics = () => {
  const workspaceId = useWorkspaceId();
  const params = useParams();

  const projectId = params.projectId as string;

  // Query the project analytics
  const { data, isPending, isError } = useGetProjectAnalyticsQuery(
    workspaceId,
    projectId
  );

  const analytic = data?.analytics;

  const analyticsList = [
    {
      id: 'total-task',
      title: 'Total Task',
      value: analytic?.totalTasks || 0,
    },
    {
      id: 'overdue-task',
      title: 'Overdue Task',
      value: analytic?.overdueTasks || 0,
    },
    {
      id: 'completed-task',
      title: 'Completed Task',
      value: analytic?.completedTasks || 0,
    },  
  ];

  if (isError) {
    return <div>Error occured</div>;
  }

  return (
    <div className='grid gap-4 md:gap-5 lg:grid-cols-2 xl:grid-cols-3'>
      {analyticsList?.map(v => (
        <AnalyticsCard
          isLoading={isPending}
          title={v.title}
          value={v.value}
          key={v.id}
        />
      ))}
    </div>
  );
};

export default ProjectAnalytics;
