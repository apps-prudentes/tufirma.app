let _cachedPrisma: any = null;

function getPrisma() {
  if (_cachedPrisma) {
    return _cachedPrisma;
  }

  if ((globalThis as any)._prisma) {
    _cachedPrisma = (globalThis as any)._prisma;
    return _cachedPrisma;
  }

  const { PrismaClient } = require('@prisma/client');
  const instance = new PrismaClient();

  if (process.env.NODE_ENV !== 'production') {
    (globalThis as any)._prisma = instance;
  }

  _cachedPrisma = instance;
  return instance;
}

// Lazy initialization using Proxy - only calls getPrisma() when properties are accessed
export const prisma = new Proxy({} as any, {
  get: (target, prop) => {
    const client = getPrisma();
    return (client as any)[prop];
  },
});

export default prisma;
