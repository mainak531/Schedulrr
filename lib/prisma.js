import { PrismaClient } from "@prisma/client";

export const db = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = db;
}

// globalThis.prisma is a way to store the Prisma database connection in a shared place so that it can be reused across different parts of the application. In development, this helps avoid creating multiple connections to the database each time the code changes or reloads. It makes things more efficient. However, in production, it’s not needed because the application runs continuously, and creating a new connection at the start is usually a better practice.
