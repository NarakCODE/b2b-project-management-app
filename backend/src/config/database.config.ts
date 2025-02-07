import mongoose from 'mongoose';
import { config } from './app.config';

const connectDatabase = async () => {
  try {
    await mongoose.connect(config.MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

export default connectDatabase;
