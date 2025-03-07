/* eslint-disable @typescript-eslint/no-explicit-any */
import { useParams } from 'react-router-dom';
import CreateTaskDialog from '../task/create-task-dialog';
import EditProjectDialog from './edit-project-dialog';
import useWorkspaceId from '@/hooks/use-workspace-id';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getProjectByIdQueryFn } from '@/lib/api';
import { ProjectType } from '@/types/api.type';


const ProjectHeader = () => {
  const param = useParams();
  const workspaceId = useWorkspaceId();
  const projectId = param.projectId as string;

  // Query the project
  const { data, isPending, isError } = useQuery({
    queryKey: ['single-project', workspaceId, projectId],
    queryFn: () => getProjectByIdQueryFn({ workspaceId, projectId }),
    staleTime: Infinity,
    enabled: !!projectId,
    placeholderData: keepPreviousData,
  });

  const project = data?.project;

  // Fallback if no project data is found
  const projectEmoji = project?.emoji || '📊';
  const projectName = project?.name || 'Untitled project';

  const renderContent = () => {
    if (isPending) return <span>Loading...</span>;
    if (isError) return <span>Error occured</span>;
    return (
      <>
        <span>{projectEmoji}</span>
        {projectName}
      </>
    );
  };
  return (
    <div className='flex items-center justify-between space-y-2'>
      <div className='flex items-center gap-2'>
        <h2 className='flex items-center gap-3 text-xl font-medium truncate tracking-tight'>
          {renderContent()}
        </h2>
        <EditProjectDialog project={project as ProjectType} />
      </div>
        <CreateTaskDialog projectId={projectId} />
    </div>
  );
};

export default ProjectHeader;
