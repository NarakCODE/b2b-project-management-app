import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import { config } from '../config/app.config';

// Connect to MongoDB
mongoose.connect(config.MONGODB_URI);

const ObjectId = mongoose.Types.ObjectId;

// Enums
enum TaskStatusEnumType {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}
enum TaskPriorityEnumType {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

// Collections
const workspaces = Array.from({ length: 5 }, () => ({
  _id: new ObjectId(),
  name: faker.company.name(),
  description: faker.company.catchPhrase(),
  owner: new ObjectId(),
  inviteCode: faker.string.alphanumeric(10),
  createdAt: new Date(),
  updatedAt: new Date(),
}));

const users = Array.from({ length: 20 }, () => ({
  _id: new ObjectId(),
  name: faker.person.fullName(),
  email: faker.internet.email(),
  password: '123456',
  profilePicture: faker.image.avatar(),
  isActive: faker.datatype.boolean(),
  lastLogin: faker.date.recent(),
  createdAt: new Date(),
  updatedAt: new Date(),
  currentWorkspace:
    workspaces[Math.floor(Math.random() * workspaces.length)]._id,
}));

const projects = Array.from({ length: 10 }, () => ({
  _id: new ObjectId(),
  name: faker.commerce.productName(),
  description: faker.lorem.sentence(),
  emoji: '🚀',
  workspace: workspaces[Math.floor(Math.random() * workspaces.length)]._id,
  createdBy: users[Math.floor(Math.random() * users.length)]._id,
  createdAt: new Date(),
  updatedAt: new Date(),
}));

const tasks = Array.from({ length: 30 }, () => ({
  _id: new ObjectId(),
  taskCode: faker.string.alphanumeric(8),
  title: faker.hacker.phrase(),
  description: faker.lorem.sentence(),
  project: projects[Math.floor(Math.random() * projects.length)]._id,
  workspace: workspaces[Math.floor(Math.random() * workspaces.length)]._id,
  status: faker.helpers.arrayElement(Object.values(TaskStatusEnumType)),
  priority: faker.helpers.arrayElement(Object.values(TaskPriorityEnumType)),
  assignedTo: users[Math.floor(Math.random() * users.length)]._id,
  createdBy: users[Math.floor(Math.random() * users.length)]._id,
  dueDate: faker.date.future(),
  createdAt: new Date(),
  updatedAt: new Date(),
}));

const seedDatabase = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.collection('workspaces').insertMany(workspaces);
  await mongoose.connection.collection('users').insertMany(users);
  await mongoose.connection.collection('projects').insertMany(projects);
  await mongoose.connection.collection('tasks').insertMany(tasks);
  console.log('Seeding complete!');
  mongoose.connection.close();
};

seedDatabase().catch(console.error);
