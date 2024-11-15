const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const seedPermissions = require('./permissions');
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

module.exports = seedRoles; 