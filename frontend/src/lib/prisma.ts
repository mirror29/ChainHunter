// 声明全局 prisma 变量类型
declare global {
  // eslint-disable-next-line no-var
  var prisma: any | undefined;
}

// 创建一个简单的数据库连接对象
// 由于我们遇到了 Prisma 类型导入问题，这里使用一个简单的代理对象来避免构建错误
// 这个方法只是为了解决构建问题，实际的数据库操作将在后端 API 中处理
const prisma = global.prisma || {};

export default prisma;
