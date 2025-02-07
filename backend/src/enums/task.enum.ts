export const TaskStatusEnum = {
  BACKLOG: 'BACKLOG',
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  DONE: 'DONE',
  IN_PREVIEW: 'IN_PREVIEW',
} as const;

export const TaskPriorityEnum = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
} as const;

export type TaskStatusEnumType = keyof typeof TaskStatusEnum;
export type TaskPriorityEnumType = keyof typeof TaskPriorityEnum;
