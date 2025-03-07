import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import session from 'express-session';
import { config } from './config/app.config';
import connectDatabase from './config/database.config';
import { errorHandler } from './middlewares/errorHandler.middleware';
import { asyncHandler } from './middlewares/asyncHandler.middleware';
import { BadRequestException } from './utils/appError';
import { ErrorCodeEnum } from './enums/error-code.enum';
import passport from 'passport';
import './config/passport.config';
import authRoutes from './routes/auth.route';
import userRoutes from './routes/user.route';
import isAuthenticated from './middlewares/isAuthenticated.middleware';
import workspaceRoutes from './routes/workspace.route';
import memberRoutes from './routes/member.route';
import projectRoutes from './routes/project.route';
import taskRouter from './routes/task.route';
import { HTTPSTATUS } from './config/http.config';
import MongoStore = require('connect-mongo');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8082;
const BASE_PATH = config.BASE_PATH;

app.use(express.json());

app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        process.env.FRONTEND_ORIGIN, // Ensure this is set in `.env`
        'https://b2b-project-management-app-client.vercel.app',
      ];

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, origin); // Must return the requesting origin, NOT '*'
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Ensure preflight requests get a valid response
app.options('*', (req, res) => {
  const origin = req.get('Origin');
  res.setHeader(
    'Access-Control-Allow-Origin',
    origin || 'https://b2b-project-management-app-client.vercel.app'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.status(204).end(); // 204 No Content is best for preflight
});

app.use(
  session({
    name: 'session', // Cookie name
    secret: config.SESSION_SECRET, // Encryption key
    resave: false, // Don't save session if unmodified
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: config.MONGODB_URI,
    }),

    cookie: {
      secure: false,
      maxAge: 1000 * 60 * 60 * 24, // Session expiration time (e.g., 1 day)
      httpOnly: true,
      sameSite: 'lax',
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.get(
  `/`,
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    throw new BadRequestException(
      'This is a bad request',
      ErrorCodeEnum.AUTH_INVALID_TOKEN
    );
    return res.status(HTTPSTATUS.OK).json({
      message: 'Hello Subscribe to the channel & share',
    });
  })
);

app.use(`${BASE_PATH}/auth`, authRoutes);
// app.use(`${BASE_PATH}/user`, userRoutes);
app.use(`${BASE_PATH}/user`, isAuthenticated, userRoutes);
app.use(`${BASE_PATH}/workspace`, isAuthenticated, workspaceRoutes);
app.use(`${BASE_PATH}/member`, isAuthenticated, memberRoutes);
app.use(`${BASE_PATH}/project`, isAuthenticated, projectRoutes);
app.use(`${BASE_PATH}/task`, isAuthenticated, taskRouter);

app.use(errorHandler);

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT} in ${config.NODE_ENV} mode`);
  await connectDatabase();
});
