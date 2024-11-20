import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import seedPermissions from './permissions.js';

async function seedRoles() {
  const { deleteTodosPermission } = await seedPermissions();

  const userRole = await prisma.role.create({
    data: {
      name: "USER"
    }
  });

  const adminRole = await prisma.role.create({
    data: {
      name: "ADMIN",
      permissions: {
        connect: [{ id: deleteTodosPermission.id }]
      }
    }
  });

  return { userRole, adminRole };
}

export default seedRoles; 