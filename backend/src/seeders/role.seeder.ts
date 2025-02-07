import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDatabase from '../config/database.config';
import RoleModel from '../models/roles-permission.model';
import { RolePermissions } from '../utils/role-permission';

dotenv.config();

const seedRoles = async () => {
  console.log('Seeding roles...');
  try {
    await connectDatabase();
    const session = await mongoose.startSession();
    session.startTransaction();

    console.log('Clearing existing roles...');
    await RoleModel.deleteMany({}, { session });

    for (const roleName in RolePermissions) {
      const role = roleName as keyof typeof RolePermissions;
      const permissions = RolePermissions[role];

      // Check if the role already exists
      const roleExists = await RoleModel.findOne({ name: role }).session(
        session
      );

      if (!roleExists) {
        const newRole = new RoleModel({ name: role, permissions: permissions });
        await newRole.save({ session });
        console.log(`Role ${role} created successfully.`);
      } else {
        console.log(`Role ${role} already exists.`);
      }
    }

    await session.commitTransaction();
    console.log(`Transaction committed successfully.`);

    session.endSession();
    console.log('Session ended.');

    console.log('Roles seeded successfully.');
  } catch (error) {
    console.log(error);
  }
};

seedRoles().catch(error => {
  console.error(`Seeding roles failed: ${error}`);
});
