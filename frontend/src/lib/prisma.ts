import { PrismaClient } from "@prisma/client";

// 在Serverless环境下，每个请求都创建一个新的PrismaClient实例
// 这对性能有轻微影响，但可以解决prepared statement问题
function getPrismaClient() {
  // 创建新实例
  return new PrismaClient({
    datasources: {
      db: {
        // 使用非连接池URL，避免连接池问题
        url:
          process.env.POSTGRES_URL_NON_POOLING ||
          process.env.POSTGRES_PRISMA_URL,
      },
    },
    // 关闭日志以提高性能
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

// 开发环境缓存单个实例
let prisma: PrismaClient;

// 根据环境选择不同的初始化策略
if (process.env.NODE_ENV === "development") {
  // 开发环境: 使用全局变量保持单例
  if (!(global as any).prisma) {
    (global as any).prisma = getPrismaClient();
  }
  prisma = (global as any).prisma;
} else {
  // 生产环境: 每次都创建新实例
  prisma = getPrismaClient();
}

export default prisma;
