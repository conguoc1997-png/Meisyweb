<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# ⚠️ QUY TẮC BẮT BUỘC — BẢO VỆ DATABASE

## TUYỆT ĐỐI KHÔNG chạy các lệnh sau mà không có xác nhận rõ ràng từ user:

```
npx prisma db push --force-reset
npx prisma migrate reset
npx prisma db push   ← CHỈ chạy khi user yêu cầu rõ ràng
```

## Lý do:
- Ngày 05/06/2026: Claude đã chạy `npx prisma db push --force-reset` làm **XÓA TOÀN BỘ DATA** production
- Mất dữ liệu tháng 5 và đầu tháng 6 không thể khôi phục

## Quy trình khi cần thêm model mới vào schema:
1. Sửa `prisma/schema.prisma`
2. Chạy `npx prisma generate` (an toàn — chỉ tạo client)
3. **HỎI USER** trước khi chạy `prisma db push`
4. User tự chạy hoặc xác nhận rõ ràng bằng văn bản

## Backup:
- Trang `/backup` — export/import toàn bộ DB
- Backup trước mọi thay đổi schema
