import { PrismaClient } from '@prisma/client'
import path from 'path'

const prismaClientSingleton = () => {
  // Fix for SQLite relative path issue:
  // CLI resolves relative to prisma/schema.prisma (needs ../user_data.db)
  // Runtime resolves relative to CWD (needs ./user_data.db)
  // Solution: Use absolute path at runtime.
  const dbPath = path.join(process.cwd(), 'user_data.db')
  const url = `file:${dbPath}`

  return new PrismaClient({
    datasources: {
      db: {
        url,
      },
    },
  })
}

const globalForPrisma = globalThis

const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
