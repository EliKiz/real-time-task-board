import { prisma } from "@/shared/lib/prisma";
import bcrypt from "bcryptjs";

export interface CreateUserData {
  email: string;
  name?: string;
  password: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export const userApi = {
  async createUser(data: CreateUserData) {
    const hashedPassword = await bcrypt.hash(data.password, 12);

    return await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });
  },

  async findUserByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
      },
    });
  },

  async validateUser(credentials: LoginCredentials) {
    const user = await this.findUserByEmail(credentials.email);

    if (!user) {
      return null;
    }

    const isValidPassword = await bcrypt.compare(
      credentials.password,
      user.password
    );

    if (!isValidPassword) {
      return null;
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },
};
