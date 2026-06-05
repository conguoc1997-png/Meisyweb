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

## ⚠️ QUY TẮC XÁC NHẬN 5 LẦN TRƯỚC KHI XÓA DATA:

Trước khi thực hiện BẤT KỲ hành động nào có thể xóa data trên Supabase/DB,
Claude PHẢI hỏi user đủ 5 câu xác nhận bằng **tiếng Việt**, theo thứ tự:

1. "Bạn có chắc muốn xóa dữ liệu này không?"
2. "Hành động này sẽ xóa vĩnh viễn, không thể khôi phục. Bạn vẫn muốn tiếp tục?"
3. "Bạn đã backup dữ liệu chưa? (vào /backup để xuất file trước)"
4. "Xác nhận lần 4: Bạn THỰC SỰ muốn xóa toàn bộ [tên bảng/dữ liệu] chứ?"
5. "Xác nhận cuối cùng (lần 5): Gõ chính xác chữ 'XÁC NHẬN XÓA' để tiếp tục"

Nếu user không trả lời đủ 5 lần hoặc không gõ đúng 'XÁC NHẬN XÓA' → DỪNG LẠI, không thực hiện.

Áp dụng cho: prisma db push --force-reset, deleteMany, DELETE, truncate, drop table, migrate reset

## Backup:
- Trang `/backup` — export/import toàn bộ DB
- Backup trước mọi thay đổi schema
