import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Создаем админа
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {
      password: await bcrypt.hash("password", 12), // Обновляем пароль
    },
    create: {
      email: "admin@example.com",
      name: "Admin User",
      password: await bcrypt.hash("password", 12),
      role: UserRole.ADMIN,
    },
  });

  // Создаем обычного сотрудника
  const employeeUser = await prisma.user.upsert({
    where: { email: "employee@example.com" },
    update: {
      password: await bcrypt.hash("password", 12), // Обновляем пароль
    },
    create: {
      email: "employee@example.com",
      name: "John Employee",
      password: await bcrypt.hash("password", 12),
      role: UserRole.EMPLOYEE,
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
