import API from './axios-client';
import {
  AllMembersInWorkspaceResponseType,
  AllProjectPayloadType,
  AllProjectResponseType,
  AllTaskPayloadType,
  AllTaskResponseType,
  AllWorkspaceResponseType,
  AnalyticsResponseType,
  ChangeWorkspaceMemberRoleType,
  CreateProjectPayloadType,
  CreateTaskPayloadType,
  CurrentUserResponseType,
  EditProjectPayloadType,
  EditTaskPayloadType,
  ProjectByIdPayloadType,
  ProjectResponseType,
  registerType,
  TaskType,
  UserType,
  WorkspaceByIdResponseType,
} from '@/types/api.type';
import {
  SignInResponseSchemaType,
  SignInRequestSchemaType,
  CreateWorkspaceResponseSchemaType,
  CreateWorkspaceRequestSchemaType,
  EditWorkspaceRequestSchemaType,
} from './validators';

/**
 * * * * *  Authentication API endpoints * * * *
 */
// Login user
export const signInMutationFn = async (
  data: SignInRequestSchemaType
): Promise<SignInResponseSchemaType> => {
  try {
    const userResponse = await API.post('/auth/login', data);
    return userResponse.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

// Register user
export const registerMutationFn = async (data: registerType) => {
  await API.post('/auth/register', data);
};

// Logout user
export const logoutMutationFn = async () => await API.post('/auth/logout');

// Get current user
export const getCurrentUserQueryFn =
  async (): Promise<CurrentUserResponseType> => {
    const response = await API.get(`/user/current`);
    return response.data;
  };

/**
 * * * * *  Workspace API endpoints * * * *
 */
// Create workspace
export const createWorkspaceMutationFn = async (  
  data: CreateWorkspaceRequestSchemaType
): Promise<CreateWorkspaceResponseSchemaType> => {
  const response = await API.post('/workspace/create/new', data);
  return response.data;
};

// Update workspace
export const editWorkspaceMutationFn = async (
  workspaceId: string,
  data: EditWorkspaceRequestSchemaType
) => {
  const response = await API.put(`/workspace/update/${workspaceId}`, data);
  return response.data;
};

// Get workspace by id
export const getWorkspaceByIdQueryFn = async (
  workspaceId: string
): Promise<WorkspaceByIdResponseType> => {
  const response = await API.get(`/workspace/${workspaceId}`);
  return response.data;
};

// Get workspace members
export const getAllWorkspacesUserIsMemberQueryFn =
  async (): Promise<AllWorkspaceResponseType> => {
    const response = await API.get(`/workspace/all`);
    return response.data;
  };

// Get members in workspace
export const getMembersInWorkspaceQueryFn = async (
  workspaceId: string
): Promise<AllMembersInWorkspaceResponseType> => {
  const response = await API.get(`/workspace/members/${workspaceId}`);
  return response.data;
};

// Get workspace analytics
export const getWorkspaceAnalyticsQueryFn = async (
  workspaceId: string
): Promise<AnalyticsResponseType> => {
  const response = await API.get(`/workspace/analytics/${workspaceId}`);
  return response.data;
};

// Change workspace member role
export const changeWorkspaceMemberRoleMutationFn = async ({
  workspaceId,
  data,
}: ChangeWorkspaceMemberRoleType) => {
  const response = await API.put(
    `workspace/change/member/role/${workspaceId}`,
    data
  );
  return response.data;
};

// Delete workspace
export const deleteWorkspaceMutationFn = async (
  workspaceId: string
): Promise<{
  message: string;
  currentWorkspace: string;
}> => {
  const response = await API.delete(`/workspace/delete/${workspaceId}`);
  return response.data;
};

/**
 * * * * *  Member API endpoints * * * *
 */
// Invite user to workspace
export const invitedUserJoinWorkspaceMutationFn = async (
  inviteCode: string
): Promise<{ message: string; workspaceId: string }> => {
  const response = await API.post(`/member/workspace/${inviteCode}/join`);
  return response.data;
};

/**
 * * * * *  Project API endpoints * * * *
 */
// Create project
export const createProjectMutationFn = async ({
  workspaceId,
  data,
}: CreateProjectPayloadType) => {
  const response = await API.post(
    `project/workspace/${workspaceId}/create`,
    data
  );
  return response.data;
};

// Edit project
export const editProjectMutationFn = async ({
  workspaceId,
  projectId,
  data,
}: EditProjectPayloadType) => {
  const response = await API.put(
    `project/${projectId}/workspace/${workspaceId}/update`,
    data
  );
  return response.data;
};

// Get all projects for the current user where is member
export const getProjectsInWorkspaceQueryFn = async ({
  workspaceId,
  pageSize = 10,
  pageNumber = 1,
}: AllProjectPayloadType): Promise<AllProjectResponseType> => {
  const response = await API.get(
    `/project/workspace/${workspaceId}/all?pageSize=${pageSize}&pageNumber=${pageNumber}`
  );
  return response.data;
};

// Get project by id
export const getProjectByIdQueryFn = async ({
  workspaceId,
  projectId,
}: ProjectByIdPayloadType): Promise<ProjectResponseType> => {
  const response = await API.get(
    `/project/${projectId}/workspace/${workspaceId}`
  );
  return response.data;
};

// Get project members
export const getProjectAnalyticsQueryFn = async ({
  workspaceId,
  projectId,
}: ProjectByIdPayloadType): Promise<AnalyticsResponseType> => {
  const response = await API.get(
    `/project/${projectId}/workspace/${workspaceId}/analytics`
  );

  return response.data;
};

// Change project member role
export const deleteProjectMutationFn = async ({
  workspaceId,
  projectId,
}: ProjectByIdPayloadType): Promise<{ message: string }> => {
  const response = await API.delete(
    `project/${projectId}/workspace/${workspaceId}/delete`
  );

  return response.data;
};

/**
 * * * * *  Task API endpoints * * * *
 */
// Create task
export const createTaskMutationFn = async ({
  workspaceId,
  projectId,
  data,
}: CreateTaskPayloadType): Promise<{ message: string; task: TaskType }> => {
  const response = await API.post(
    `task/project/${projectId}/workspace/${workspaceId}/create`,
    data
  );

  return response.data;
};

// Get all tasks
export const getAllTasksQueryFn = async ({
  workspaceId,
  projectId,
  keyword,
  priority,
  status,
  assignedTo,
  dueDate,
  pageNumber,
  pageSize,
}: AllTaskPayloadType): Promise<AllTaskResponseType> => {
  const baseUrl = `/task/workspace/${workspaceId}/all`;

  const queryParams = new URLSearchParams();
  if (keyword) queryParams.append('keyword', keyword);
  if (projectId) queryParams.append('projectId', projectId);
  if (assignedTo) queryParams.append('assignedTo', assignedTo);
  if (priority) queryParams.append('priority', priority);
  if (status) queryParams.append('status', status);
  if (dueDate) queryParams.append('dueDate', dueDate);
  if (pageNumber) queryParams.append('pageNumber', pageNumber?.toString());
  if (pageSize) queryParams.append('pageSize', pageSize?.toString());
  const url = queryParams.toString() ? `${baseUrl}?${queryParams}` : baseUrl;

  const response = await API.get(url);
  return response.data;
};

// Get task by id
// task/67a2ea9a3d2fc5afefd0225b/project/67a067abe64950b79caf026b/workspace/679f12a64f3328fc09426f13
export const getTaskByIdQueryFn = async ({
  taskId,
  projectId,
  workspaceId,
}: {
  taskId: string;
  projectId: string;
  workspaceId: string;
}): Promise<{ message: string; task: TaskType }> => {
  const response = await API.get(
    `/task/${taskId}/project/${projectId}/workspace/${workspaceId}`
  );
  return response.data;
};

// Update task
// task/67a2ddbe21b7eec41789252f/project/67a067abe64950b79caf026b/workspace/679f12a64f3328fc09426f13/update
export const updateTaskMutationFn = async ({
  taskId,
  projectId,
  workspaceId,
  data,
}: EditTaskPayloadType): Promise<{ message: string; task: TaskType }> => {
  const response = await API.put(
    `/task/${taskId}/project/${projectId}/workspace/${workspaceId}/update`,
    data
  );

  return response.data;
};

// Delete task
export const deleteTaskMutationFn = async ({
  taskId,
  workspaceId,
}: {
  taskId: string;
  workspaceId: string;
}): Promise<{ message: string }> => {
  const response = await API.delete(
    `task/${taskId}/workspace/${workspaceId}/delete`
  );

  return response.data;
};

// Update user details

export const updateUserMutationFn = async ({
  userId,
  data,
}: {
  userId: string;
  data: {
    name: string;
    email: string;
    profilePicture: string;
  };
}): Promise<{ message: string; user: UserType }> => {
  const response = await API.put(`/user/${userId}`, data);
  return response.data;
};

export const getSingleUserQueryFn = async (
  userId: string
): Promise<{ message: string; user: UserType }> => {
  const response = await API.get(`/user/${userId}`);
  return response.data;
};
