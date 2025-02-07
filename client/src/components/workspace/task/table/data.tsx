import { TaskPriorityEnum, TaskStatusEnum } from '@/constant';
import { transformOptions } from '@/lib/helper';
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  CheckCircle,
  CircleCheck,
  Pin,
  Hourglass,
  View,
} from 'lucide-react';

const statusIcons = {
  [TaskStatusEnum.BACKLOG]: Pin,
  [TaskStatusEnum.TODO]: CircleCheck,
  [TaskStatusEnum.IN_PROGRESS]: Hourglass,
  [TaskStatusEnum.IN_REVIEW]: View,
  [TaskStatusEnum.DONE]: CheckCircle,
};

const priorityIcons = {
  [TaskPriorityEnum.LOW]: ArrowDown,
  [TaskPriorityEnum.MEDIUM]: ArrowRight,
  [TaskPriorityEnum.HIGH]: ArrowUp,
};

export const statuses = transformOptions(
  Object.values(TaskStatusEnum),
  statusIcons
);

export const priorities = transformOptions(
  Object.values(TaskPriorityEnum),
  priorityIcons
);
