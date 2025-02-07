import mongoose, { Document, Schema } from 'mongoose';
import { comparePassword, hashPassword } from '../utils/bcrypt';

export interface UserDocument extends Document {
  name: string;
  email: string;
  password?: string;
  profilePicture: string | null;
  isActive: boolean;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
  currentWorkspace: mongoose.Types.ObjectId | null;
  comparePassword(value: string): Promise<boolean>;
  omitPassword(): Omit<UserDocument, 'password'>;
}

const userSchema = new Schema<UserDocument>(
  {
    name: {
      type: String,
      required: false,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      select: true,
    },
    profilePicture: {
      type: String,
      default: null,
    },
    currentWorkspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
    },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);
/** Hash the password before saving it to the database.
 * This is done to prevent passwords from being stored in plain text.
 */
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    if (this.password) {
      this.password = await hashPassword(this.password);
    }
  }
});

/**
 * Omit the password field from the user object.
 * This is done to prevent passwords from being sent over the network.
 * @returns {Omit<UserDocument, 'password'>} - The user object without the password field.
 */
userSchema.methods.omitPassword = function (): Omit<UserDocument, 'password'> {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

/**
 * Compare the given password with the user's password.
 * @param {string} password - The password to compare.
 * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating whether the passwords match.
 */
userSchema.methods.comparePassword = async function (password: string) {
  return comparePassword(password, this.password);
};

const UserModel = mongoose.model<UserDocument>('User', userSchema);
export default UserModel;
