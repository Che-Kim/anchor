import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set — see README § Deploying.");
  }
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

/**
 * Constructed on first query rather than on import: Next evaluates route
 * modules while collecting build config, and connecting there would make every
 * build require a reachable database.
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    globalForPrisma.prisma ??= createClient();
    const client = globalForPrisma.prisma;
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
