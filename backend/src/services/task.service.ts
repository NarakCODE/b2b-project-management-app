import { TaskPriorityEnum, TaskStatusEnum } from '../enums/task.enum';
import MemberModel from '../models/member.model';
import ProjectModel from '../models/project.model';
import TaskModel from '../models/task.model';
import { BadRequestException, NotFoundException } from '../utils/appError';

export const createTaskService = async (
  userId: string,
  workspaceId: string,
  projectId: string,
  body: {
    title: string;
    description?: string;
    priority: string;
    status: string;
    assignedTo?: string | null;
    dueDate?: string;
  }
) => {
  const { title, description, priority, status, assignedTo, dueDate } = body;

  // Find the project and workspace
  const projectToFind = await ProjectModel.findById(projectId);

  // if not found
  if (!projectToFind || projectToFind.workspace.toString() !== workspaceId) {
    throw new NotFoundException(
      'Project not found or not belong to the workspace'
    );
  }

  // is assigned to the user based on the usreId
  if (assignedTo) {
    const isAssignedToUser = await MemberModel.exists({
      userId: assignedTo,
      workspaceId,
    });

    // if the user is not assigned to the project
    if (!isAssignedToUser) {
      throw new Error('Assigned user is not a member of the workspace.');
    }
  }

  // return the created task to the client
  console.log('Received dueDate:', dueDate);

  const task = new TaskModel({
    title,
    description,
    project: projectId,
    workspace: workspaceId,
    assignedTo,
    priority: priority || TaskPriorityEnum.MEDIUM,
    status: status || TaskStatusEnum.TODO,
    createdBy: userId,
    dueDate: dueDate ? new Date(dueDate + 'T00:00:00.000Z') : null, // Ensuring UTC format
  });

  // save the task to the database
  await task.save();

  return { task };
};

// Get all tasks service
export const getAllTasksService = async (
  workspaceId: string,
  pagination: { pageSize: number; pageNumber: number },
  filters: {
    projectId?: string;
    status?: string[];
    priority?: string[];
    assignedTo?: string[];
    keyword?: string;
    dueDate?: string;
  }
) => {
  const query: Record<string, any> = {
    workspace: workspaceId,
  };

  if (filters.projectId) {
    query.project = filters.projectId;
  }

  if (filters.status && filters.status?.length > 0) {
    query.status = { $in: filters.status };
  }

  if (filters.priority && filters.priority?.length > 0) {
    query.priority = { $in: filters.priority };
  }

  if (filters.assignedTo && filters.assignedTo?.length > 0) {
    query.assignedTo = { $in: filters.assignedTo };
  }

  if (filters.keyword && filters.keyword !== undefined) {
    query.title = { $regex: filters.keyword, $options: 'i' };
  }

  if (filters.dueDate) {
    query.dueDate = {
      $eq: new Date(filters.dueDate),
    };
  }
  const { pageSize, pageNumber } = pagination;
  const skip = (pageNumber - 1) * pageSize;

  // Get all tasks
  const [tasks, totalCount] = await Promise.all([
    TaskModel.find(query)
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: -1 })
      .populate('assignedTo', '_id name profilePicture -password')
      .populate('project', '_id emoji name'),
    TaskModel.countDocuments(query),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    tasks,
    pagination: {
      pageSize,
      pageNumber,
      totalCount,
      totalPages,
      skip,
    },
  };
};

// Get task by id service
export const getTaskByIdService = async (
  workspaceId: string,
  taskId: string,
  projectId: string
) => {
  const project = await ProjectModel.findById(projectId);
  if (!project || project.workspace.toString() !== workspaceId.toString()) {
    throw new NotFoundException(
      'Project not found or not belong to the workspace'
    );
  }

  const task = await TaskModel.findOne({
    _id: taskId,
    project: projectId,
    workspace: workspaceId,
  }).populate('assignedTo', '_id name profilePicture -password');

  if (!task) {
    throw new NotFoundException('Task not found');
  }

  return task;
};

// Update task service
export const updateTaskService = async (
  workspaceId: string,
  projectId: string,
  taskId: string,
  body: {
    title: string;
    status: string;
    priority: string;
    description?: string;
    assignedTo?: string | null;
    dueDate?: string;
  }
) => {
  // Find the project exists or not and make sure it belongs to the workspace
  const project = await ProjectModel.findById(projectId);
  if (!project || project.workspace.toString() !== workspaceId.toString()) {
    throw new NotFoundException(
      'Project not found or not belong to the workspace'
    );
  }

  // FInd the task exists or not and make sure it belongs to the project
  const task = await TaskModel.findById(taskId);
  if (!task || task.project.toString() !== projectId.toString()) {
    throw new NotFoundException(
      'Task not found or does not belong to this project'
    );
  }

  const updatedTask = await TaskModel.findByIdAndUpdate(
    taskId,
    {
      ...body,
    },
    { new: true }
  );

  if (!updatedTask) {
    throw new BadRequestException('Failed to update task.');
  }

  return { task: updatedTask };
};

// Delete task service
export const deleteTaskService = async (
  workspaceId: string,
  taskId: string
) => {
  // Find the task exists or not
  const task = await TaskModel.findOneAndDelete({
    _id: taskId,
    workspace: workspaceId,
  });

  if (!task) {
    throw new NotFoundException('Task not found');
  }

  return;
};
