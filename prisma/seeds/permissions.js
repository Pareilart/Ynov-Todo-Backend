import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function seedPermissions() {
  const deleteTodosPermission = await prisma.permission.create({
    data: {
      name: "delete:todos"
    }
  });

  return { deleteTodosPermission };
};

export default seedPermissions; 