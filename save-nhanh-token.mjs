import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const token = 'L5v3aTBQpKB1kD3VOBZEJZ3gKH2mUhNBaLvwVXAExi7nJRqDtv6qLCXmTXlcbO4duQaAAUOY7HOhLM7GZf8jOqRrkDbjOahGsCpfqBpKOJcJITUnd0utT74QP9a8ayqah3JzN6VPeMA8N8dWO7k8FMJZ4Np5IwM1C9zgN6LNmv6cMbtqwJkHI5foOSGXdTDQ136548fqT0l9dvXbWZ7BkBzkpBi6guHjgteXx';
await prisma.appSettings.upsert({ where:{key:'nhanh_access_token'}, update:{value:token}, create:{key:'nhanh_access_token',value:token} });
await prisma.appSettings.upsert({ where:{key:'nhanh_business_id'}, update:{value:'221617'}, create:{key:'nhanh_business_id',value:'221617'} });
console.log('Token saved!');
await prisma.$disconnect();
