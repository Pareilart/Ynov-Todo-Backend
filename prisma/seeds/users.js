import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import bcrypt from 'bcryptjs';

async function seedUsers(userRole, adminRole) {
  const hashedPassword = await bcrypt.hash('123456', 10);

  const user = await prisma.user.create({
    data: {
      name: 'user',
      email: 'user@user.fr',
      password: hashedPassword,
      roles: {
        connect: { id: userRole.id },
      },
    },
  });

  const admin = await prisma.user.create({
    data: {
      name: 'admin',
      email: 'admin@admin.fr',
      password: hashedPassword,
      roles: {
        connect: { id: adminRole.id },
      },
    },
  });

  console.log(`Utilisateur créé: ${user.email}`);
  console.log(`Administrateur créé: ${admin.email}`);
}

export default seedUsers; 