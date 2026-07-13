"use client";

import { useEffect, useState, useRef } from "react";
import { Users, Plus, Pencil, Trash2, X, Check, Link, Camera } from "lucide-react";
import { ALL_MODULES, parseModules } from "@/lib/auth";

type User = {
  id: string;
  email: string;
  name: string;
  role: string;
  active: boolean;
  createdAt: string;
  nhanVienId: string | null;
  avatarUrl: string | null;
};

// Nén ảnh client-side → base64 JPEG 200×200
function compressAvatar(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const SIZE = 200;
      const canvas = document.createElement("canvas");
      canvas.width = SIZE; canvas.height = SIZE;
      const ctx = canvas.getContext("2d")!;
      // Crop vuông giữa ảnh
      const min = Math.min(img.width, img.height);
      const sx = (img.width - min) / 2;
      const sy = (img.height - min) / 2;
      ctx.drawImage(img, sx, sy, min, min, 0, 0, SIZE, SIZE);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

type NhanVien = { id: string; ten: string; maNV: string; phongBan: string | null };

function roleLabel(role: string) {
  if (role === "admin") return "Admin";
  const mods = parseModules(role);
  return mods.map(k => ALL_MODULES.find(m => m.key === k)?.label ?? k).join(", ") || "Không có quyền";
}

const DEPT_COLOR: Record<string, string> = {
  Livestream: "#ec407a", CSKH: "#29b6f6", Kho: "#ffa726", May: "#26a69a",
};
function deptColor(pb: string | null) {
  if (!pb) return "#9e9e9e";
  for (const [k, v] of Object.entries(DEPT_COLOR)) if (pb.includes(k)) return v;
  return "#9e9e9e";
}

export default function AdminUsersPage() {
  const [users,   setUsers]   = useState<User[]>([]);
  const [nvList,  setNvList]  = useState<NhanVien[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [form, setForm] = useState({
    email: "", name: "", password: "",
    isAdmin: false, logoutOtherDevices: true,
    nhanVienId: "",
  });
  const [selectedMods, setSelectedMods] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const load = () => fetch("/api/admin/users").then(r => r.json()).then(setUsers);

  useEffect(() => {
    load();
    fetch("/api/cham-cong/nhan-vien")
      .then(r => r.json()).then(d => setNvList(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  function openAdd() {
    setEditUser(null);
    setForm({ email: "", name: "", password: "", isAdmin: false, logoutOtherDevices: true, nhanVienId: "" });
    setSelectedMods([]);
    setError("");
    setAvatarPreview(null);
    setShowForm(true);
  }

  function openEdit(u: User) {
    setEditUser(u);
    setForm({
      email: u.email, name: u.name, password: "",
      isAdmin: u.role === "admin", logoutOtherDevices: true,
      nhanVienId: u.nhanVienId ?? "",
    });
    setSelectedMods(u.role === "admin" ? [] : parseModules(u.role));
    setError("");
    setAvatarPreview(u.avatarUrl ?? null);
    setShowForm(true);
  }

  async function handleAvatarFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    setAvatarUploading(true);
    try {
      const compressed = await compressAvatar(file);
      setAvatarPreview(compressed);
      // Nếu đang edit → lưu avatar ngay
      if (editUser) {
        await fetch(`/api/admin/users/${editUser.id}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ avatarUrl: compressed }),
        });
        load();
      }
    } catch { /* ignore */ }
    finally { setAvatarUploading(false); }
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const role = form.isAdmin ? "admin" : selectedMods.join(",") || "tong-quan";
      if (editUser) {
        const body: Record<string, unknown> = {
          name: form.name, role,
          nhanVienId: form.nhanVienId || null,
        };
        if (form.password) {
          body.password = form.password;
          body.logoutOtherDevices = form.logoutOtherDevices;
        }
        const res = await fetch(`/api/admin/users/${editUser.id}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error((await res.json()).error);
      } else {
        const res = await fetch("/api/admin/users", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, role, nhanVienId: form.nhanVienId || null }),
        });
        if (!res.ok) throw new Error((await res.json()).error);
      }
      setShowForm(false);
      load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lỗi");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(u: User) {
    await fetch(`/api/admin/users/${u.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !u.active }),
    });
    load();
  }

  async function handleDelete(u: User) {
    if (!confirm(`Xoá tài khoản ${u.name}?`)) return;
    await fetch(`/api/admin/users/${u.id}`, { method: "DELETE" });
    load();
  }

  // Quick-link NV directly from table row
  async function quickLinkNv(userId: string, nhanVienId: string | null) {
    await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nhanVienId }),
    });
    load();
  }

  const nvMap = Object.fromEntries(nvList.map(nv => [nv.id, nv]));

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users size={22} className="text-rose-500" />
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Quản lý User</h1>
            <p className="text-sm text-slate-500">Thêm, sửa, phân quyền & gán nhân viên</p>
          </div>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 bg-rose-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-rose-600 transition">
          <Plus size={16} /> Thêm tài khoản
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 text-slate-600 font-semibold">Tên / Email</th>
              <th className="text-left px-4 py-3 text-slate-600 font-semibold">Nhân viên liên kết</th>
              <th className="text-left px-4 py-3 text-slate-600 font-semibold">Phân quyền</th>
              <th className="text-left px-4 py-3 text-slate-600 font-semibold">Trạng thái</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => {
              const linkedNv = u.nhanVienId ? nvMap[u.nhanVienId] : null;
              return (
                <tr key={u.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  {/* Avatar + Tên + email */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {u.avatarUrl ? (
                        <img src={u.avatarUrl} alt={u.name}
                          className="w-9 h-9 rounded-full object-cover flex-shrink-0 border border-slate-200" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-500 font-bold text-sm">
                          {u.name.split(" ").slice(-1)[0]?.[0] ?? "?"}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-slate-800">{u.name}</p>
                        <p className="text-xs text-slate-400">{u.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* NV liên kết — dropdown quick-link */}
                  <td className="px-4 py-3">
                    {linkedNv ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                          style={{ background: deptColor(linkedNv.phongBan) }}>
                          {linkedNv.ten.split(" ").slice(-1)[0]?.[0]}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-700">{linkedNv.ten}</p>
                          {linkedNv.phongBan && <p className="text-[10px] text-slate-400">{linkedNv.phongBan}</p>}
                        </div>
                        <button onClick={() => quickLinkNv(u.id, null)}
                          className="ml-1 text-slate-300 hover:text-red-400 transition" title="Bỏ liên kết">
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <select
                        defaultValue=""
                        onChange={e => { if (e.target.value) quickLinkNv(u.id, e.target.value); }}
                        className="text-xs border border-dashed border-slate-300 rounded-lg px-2 py-1 text-slate-500 bg-white focus:outline-none focus:border-blue-400 cursor-pointer hover:border-slate-400 transition">
                        <option value="">— Gán nhân viên —</option>
                        {nvList.map(nv => (
                          <option key={nv.id} value={nv.id}>{nv.ten} ({nv.phongBan ?? "—"})</option>
                        ))}
                      </select>
                    )}
                  </td>

                  {/* Phân quyền */}
                  <td className="px-4 py-3 max-w-[260px]">
                    {u.role === "admin" ? (
                      <span className="text-xs px-2 py-0.5 rounded font-semibold bg-rose-100 text-rose-700">
                        Admin — Toàn quyền
                      </span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {parseModules(u.role).map(k => {
                          const mod = ALL_MODULES.find(m => m.key === k);
                          return (
                            <span key={k} className="text-[11px] px-1.5 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded font-medium">
                              {mod?.label ?? k}
                            </span>
                          );
                        })}
                        {parseModules(u.role).length === 0 && (
                          <span className="text-[11px] text-slate-400 italic">Chưa có quyền</span>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Trạng thái */}
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive(u)}
                      className={`text-xs px-2 py-1 rounded-full font-semibold transition
                        ${u.active ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
                      {u.active ? "● Hoạt động" : "○ Khoá"}
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => openEdit(u)}
                        className="p-1.5 rounded hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDelete(u)}
                        className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {users.length === 0 && (
              <tr><td colSpan={5} className="text-center py-8 text-slate-400">Chưa có tài khoản nào</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
        <Link size={12} />
        <span>Cột "Nhân viên liên kết" dùng cho trang <strong>/viec-cua-toi</strong> — NV đăng nhập sẽ tự thấy việc của mình</span>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 sticky top-0 bg-white z-10">
              <h2 className="font-bold text-slate-800">{editUser ? "Sửa tài khoản" : "Thêm tài khoản"}</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              {/* Avatar upload */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="avatar"
                      className="w-16 h-16 rounded-full object-cover border-2 border-slate-200" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-xl font-bold">
                      {form.name.split(" ").slice(-1)[0]?.[0] ?? "?"}
                    </div>
                  )}
                  {avatarUploading && (
                    <div className="absolute inset-0 rounded-full bg-black/30 flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                <div>
                  <input ref={avatarInputRef} type="file" accept="image/*" className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleAvatarFile(f); e.target.value = ""; }} />
                  <button type="button" onClick={() => avatarInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-600 hover:bg-slate-50 transition">
                    <Camera size={13} /> {avatarPreview ? "Đổi ảnh" : "Upload ảnh"}
                  </button>
                  {avatarPreview && (
                    <button type="button" onClick={async () => {
                      setAvatarPreview(null);
                      if (editUser) {
                        await fetch(`/api/admin/users/${editUser.id}`, {
                          method: "PATCH", headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ avatarUrl: null }),
                        });
                        load();
                      }
                    }} className="mt-1 text-[11px] text-red-400 hover:text-red-600 transition block">
                      Xoá ảnh
                    </button>
                  )}
                  <p className="text-[10px] text-slate-400 mt-1">JPG/PNG, tự nén 200×200</p>
                </div>
              </div>

              {!editUser && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
                  <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-rose-400"
                    value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="email@example.com" />
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Tên hiển thị</label>
                <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-rose-400"
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Nguyễn Văn A" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  {editUser ? "Mật khẩu mới (bỏ trống nếu không đổi)" : "Mật khẩu"}
                </label>
                <input type="password"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-rose-400"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••" />
                {editUser && form.password && (
                  <label className="flex items-center gap-2 mt-2 p-2.5 rounded-lg border border-amber-200 bg-amber-50 cursor-pointer">
                    <input type="checkbox" checked={form.logoutOtherDevices}
                      onChange={e => setForm({ ...form, logoutOtherDevices: e.target.checked })}
                      className="accent-amber-500" />
                    <span className="text-xs text-amber-800 font-medium">
                      🔒 Đăng xuất khỏi tất cả thiết bị khác
                    </span>
                  </label>
                )}
              </div>

              {/* Gán nhân viên */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                  <Link size={11} /> Nhân viên liên kết (cho /viec-cua-toi)
                </label>
                <select value={form.nhanVienId} onChange={e => setForm({ ...form, nhanVienId: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400">
                  <option value="">— Không liên kết —</option>
                  {nvList.map(nv => (
                    <option key={nv.id} value={nv.id}>{nv.ten} ({nv.phongBan ?? "—"})</option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Khi đăng nhập, trang "Việc của tôi" sẽ tự hiển thị công việc của NV này
                </p>
              </div>

              {/* Phân quyền */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">Phân quyền theo module</label>
                <label className="flex items-center gap-2 p-2.5 rounded-lg border border-rose-200 bg-rose-50 mb-2 cursor-pointer">
                  <input type="checkbox" checked={form.isAdmin}
                    onChange={e => setForm({ ...form, isAdmin: e.target.checked })}
                    className="accent-rose-500" />
                  <span className="text-sm font-semibold text-rose-700">Admin — toàn quyền</span>
                </label>
                {!form.isAdmin && (
                  <div className="grid grid-cols-2 gap-1.5">
                    {ALL_MODULES.map(mod => {
                      const checked = selectedMods.includes(mod.key);
                      return (
                        <label key={mod.key}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm transition
                            ${checked ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                          <input type="checkbox" checked={checked}
                            onChange={() => setSelectedMods(prev =>
                              prev.includes(mod.key) ? prev.filter(k => k !== mod.key) : [...prev, mod.key]
                            )}
                            className="accent-blue-500" />
                          {mod.label}
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
            </div>
            <div className="flex gap-2 p-5 pt-0 sticky bottom-0 bg-white border-t border-slate-100">
              <button onClick={() => setShowForm(false)}
                className="flex-1 border border-slate-200 text-slate-600 rounded-lg py-2 text-sm hover:bg-slate-50 transition">Huỷ</button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 bg-rose-500 text-white rounded-lg py-2 text-sm font-semibold hover:bg-rose-600 disabled:opacity-50 transition flex items-center justify-center gap-1">
                {saving ? "Đang lưu..." : <><Check size={14} /> Lưu</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
