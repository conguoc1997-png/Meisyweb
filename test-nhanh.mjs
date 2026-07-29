import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const token = (await prisma.appSettings.findUnique({ where: { key: 'nhanh_access_token' } }))?.value;
const biz = (await prisma.appSettings.findUnique({ where: { key: 'nhanh_business_id' } }))?.value;

let all = [], next = '';
for (let i = 0; i < 50; i++) {
  const res = await fetch(`https://pos.open.nhanh.vn/v3.0/product/list?appId=77932&businessId=${biz}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': token },
    body: JSON.stringify({ filters: {}, paginator: { size: 100, next } }),
  });
  const data = await res.json();
  if (!data.data?.length) break;
  all.push(...data.data);
  if (!data.paginator?.next) break;
  next = data.paginator.next;
}
console.log('Total Nhanh:', all.length);

// Tìm bất kỳ field nào không phải string khi gọi toUpperCase
let errors = 0;
for (const p of all) {
  try {
    if (p.code != null) p.code.toUpperCase();
    else { console.log('NULL code:', p.id, p.name); errors++; }

    if (p.attributes) {
      for (const a of p.attributes) {
        if (a.name != null) a.name.toLowerCase();
        else { console.log('NULL attr name in:', p.code); errors++; }
        if (a.value != null) String(a.value).toLowerCase();
      }
    }
  } catch(e) {
    console.log('ERROR:', p.id, p.code, e.message);
    errors++;
  }
}
console.log(errors === 0 ? '✅ Tất cả OK' : `❌ ${errors} lỗi`);

// Test mapping lookup
const mappingRow = await prisma.appSettings.findUnique({ where: { key: 'nhanh_sku_mapping' } });
const mapping = mappingRow?.value ? JSON.parse(mappingRow.value) : {};
console.log('Mapping hiện có:', JSON.stringify(mapping));
for (const [k, v] of Object.entries(mapping)) {
  try { k.toUpperCase(); v.toUpperCase(); }
  catch(e) { console.log('BAD MAPPING:', k, v, e.message); }
}

await prisma.$disconnect();
