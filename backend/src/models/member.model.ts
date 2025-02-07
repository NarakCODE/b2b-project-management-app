import mongoose, { Document, Schema } from 'mongoose';
import { RoleDocument } from './roles-permission.model';

export interface MemberDocument extends Document {
  userId: mongoose.Types.ObjectId;
  workspaceId: mongoose.Types.ObjectId;
  role: RoleDocument;
  joinedAt: Date;
}

const MemberSchema = new Schema<MemberDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  workspaceId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Workspace',
  },
  role: {
    type: Schema.Types.ObjectId,
    ref: 'Role',
    required: true,
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
});

const MemberModel = mongoose.model<MemberDocument>('Member', MemberSchema);

export default MemberModel;
