import mongoose from 'mongoose';
import ProjectModel from '../models/project.model';
import TaskModel from '../models/task.model';
import UserModel from '../models/user.model';
import { NotFoundException } from '../utils/appError';
import { TaskStatusEnum } from '../enums/task.enum';

export const createProjectService = async (
  userId: string,
  workspaceId: string,
  body: { emoji?: string; name: string; description?: string }
) => {
  // Fetch the user name who created the project
  const user = await UserModel.findById(userId).select('name');

  if (!user) {
    throw new NotFoundException('User not found');
  }

  const project = new ProjectModel({
    ...(body.emoji && { emoji: body.emoji }),
    name: body.name,
    description: body.description,
    workspace: workspaceId,
    createdBy: userId,
  });

  await project.save();

  // Populate the `createdBy` field with the user's name before returning
  const populatedProject = await ProjectModel.findById(project._id)
    .populate('createdBy', 'name -password')
    .exec();

  return { project: populatedProject };
};

// Get all projects in workspace service
/**
 * projects: array of projects
 * totalCount: total number of projects
 * totalPages: total number of pages
 * skip: number of projects to skip
 */
export const getAllProjectsInWorkspaceService = async (
  workspaceId: string,
  pageSize: number,
  pageNumber: number
) => {
  // Calculate the total number of projects
  const totalCount = await ProjectModel.countDocuments({
    workspace: workspaceId,
  });

  // Calc the page to skip
  const skip = (pageNumber - 1) * pageSize; // pageNumber starts from 1 not 0

  // Get all projects in workspace
  const projects = await ProjectModel.find({ workspace: workspaceId })
    .skip(skip)
    .limit(pageSize)
    .populate('createdBy', '_id name profilePicture -password')
    .sort({ createdAt: -1 }); // Sort by createdAt descending order

  // Calculate the total number of pages
  const totalPages = Math.ceil(totalCount / pageSize); // return the next highest integer

  return { projects, totalCount, totalPages, skip };
};

// Get project by id service
export const getProjectByIdInWorkspaceService = async (
  projectId: string,
  workspaceId: string
) => {
  const project = await ProjectModel.findById({
    _id: projectId,
    workspace: workspaceId,
  }).select('_id emoji name description');

  if (!project) {
    throw new NotFoundException(
      'Project not found or does not belong to the workspace'
    );
  }

  return { project };
};

// Update project service
export const updateProjectInWorkspaceService = async (
  projectId: string,
  workspaceId: string,
  body: { emoji?: string; name: string; description?: string }
) => {
  // Find the project by id and workspace
  const project = await ProjectModel.findById({
    _id: projectId,
    workspace: workspaceId,
  });

  if (!project) {
    throw new NotFoundException(
      'Project not found or does not belong to the workspace'
    );
  }

  // Udpate the project
  project.name = body.name || project.name;
  project.emoji = body.emoji || project.emoji;
  project.description = body.description || project.description;

  await project.save();

  const populatedProject = await ProjectModel.findById(project._id);

  return { populatedProject };
};

// Delete project service
export const deleteProjectService = async (
  projectId: string,
  workspaceId: string
) => {
  // Find the project and workspace
  const project = await ProjectModel.findById({
    _id: projectId,
    workspace: workspaceId,
  });

  if (!project) {
    throw new NotFoundException(
      'Project not found or does not belong to the workspace'
    );
  }

  // Process the delete
  await project.deleteOne();
  // Remove all the task in the project
  await TaskModel.deleteMany({ project: project._id });

  return project;
};

// Get project analytics service
export const getProjectAnalyticsService = async (
  projectId: string,
  workspaceId: string
) => {
  // Step 1: Fetch the project from the database by its ID
  const project = await ProjectModel.findById(projectId);

  // Step 2: Check if the project exists and belongs to the given workspace
  if (!project || project.workspace.toString() !== workspaceId.toString()) {
    throw new NotFoundException(
      'Project not found or does not belong to the workspace'
    );
  }

  const currentDate = new Date(); // Current date for overdue task calculation

  // Step 3: Use MongoDB's aggregation framework to fetch task analytics
  const taskAnalytics = await TaskModel.aggregate([
    {
      // Match tasks associated with the given project ID
      $match: {
        project: new mongoose.Types.ObjectId(projectId),
      },
    },
    {
      // Use the $facet stage to calculate multiple analytics in one query
      $facet: {
        // 3.1: Total number of tasks in the project
        totalTasks: [{ $count: 'count' }],

        // 3.2: Number of overdue tasks (dueDate < current date and not marked as DONE)
        overdueTasks: [
          {
            $match: {
              dueDate: { $lt: currentDate }, // Tasks with past due dates
              status: {
                $ne: TaskStatusEnum.DONE, // Exclude tasks with status DONE
              },
            },
          },
          { $count: 'count' }, // Count the matched tasks
        ],

        // 3.3: Number of completed tasks (status is DONE)
        completedTasks: [
          {
            $match: {
              status: TaskStatusEnum.DONE, // Tasks with status DONE
            },
          },
          { $count: 'count' }, // Count the matched tasks
        ],
      },
    },
  ]);

  // Step 4: Extract the results from the aggregation
  const _analytics = taskAnalytics[0];

  // Step 5: Format the analytics results to handle empty arrays (default to 0)
  const analytics = {
    totalTasks: _analytics.totalTasks[0]?.count || 0,
    overdueTasks: _analytics.overdueTasks[0]?.count || 0,
    completedTasks: _analytics.completedTasks[0]?.count || 0,
  };

  // Step 6: Return the analytics data
  return {
    analytics,
  };
};
