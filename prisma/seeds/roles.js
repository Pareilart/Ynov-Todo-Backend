const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedRoles() {
  const userRole = await prisma.role.upsert({
    where: { name: 'user' },
    update: {},
    create: {
      name: 'user',
    },
  });

  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
    },
  });

  console.log('Rôles récupérés ou créés:', userRole.name, adminRole.name);
  return { userRole, adminRole };
}

module.exports = seedRoles; 