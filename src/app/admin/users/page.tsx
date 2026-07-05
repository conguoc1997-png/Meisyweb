"use client";

import { useEffect, useState } from "react";
import { Users, Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { ALL_MODULES, parseModules } from "@/lib/auth";

type User = {
  id: string;
  email: string;
  name: string;
  role: string;
  active: boolean;
  createdAt: string;
};

function roleLabel(role: string) {
  if (role === "admin") return "Admin";
  const mods = parseModules(role);
  return mods.map(k => ALL_MODULES.find(m => m.key === k)?.label ?? k).join(", ") || "Không có quyền";
}
function roleColor(role: string) {
  if (role === "admin") return "bg-rose-100 text-rose-700";
  return "bg-blue-100 text-blue-700";
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [form, setForm] = useState({ email: "", name: "", password: "", isAdmin: false, logoutOtherDevices: true });
  const [selectedMods, setSelectedMods] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => fetch("/api/admin/users").then((r) => r.json()).then(setUsers);

  useEffect(() => { load(); }, []);

  function openAdd() {
    setEditUser(null);
    setForm({ email: "", name: "", password: "", isAdmin: false, logoutOtherDevices: true });
    setSelectedMods([]);
    setError("");
    setShowForm(true);
  }

  function openEdit(u: User) {
    setEditUser(u);
    setForm({ email: u.email, name: u.name, password: "", isAdmin: u.role === "admin", logoutOtherDevices: true });
    setSelectedMods(u.role === "admin" ? [] : parseModules(u.role));
    setError("");
    setShowForm(true);
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const role = form.isAdmin ? "admin" : selectedMods.join(",") || "tong-quan";
      if (editUser) {
        const body: Record<string, unknown> = { name: form.name, role };
        if (form.password) {
          body.password = form.password;
          body.logoutOtherDevices = form.logoutOtherDevices;
        }
        const res = await fetch(`/api/admin/users/${editUser.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        if (!res.ok) throw new Error((await res.json()).error);
      } else {
        const res = await fetch("/api/admin/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, role }) });
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
    await fetch(`/api/admin/users/${u.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: !u.active }) });
    load();
  }

  async function handleDelete(u: User) {
    if (!confirm(`Xoá tài khoản ${u.name}?`)) return;
    await fetch(`/api/admin/users/${u.id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users size={22} className="text-rose-500" />
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Quản lý User</h1>
            <p className="text-sm text-slate-500">Thêm, sửa, phân quyền tài khoản truy cập</p>
          </div>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-rose-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-rose-600 transition">
          <Plus size={16} /> Thêm tài khoản
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 text-slate-600 font-semibold">Tên</th>
              <th className="text-left px-4 py-3 text-slate-600 font-semibold">Email</th>
              <th className="text-left px-4 py-3 text-slate-600 font-semibold">Phân quyền</th>
              <th className="text-left px-4 py-3 text-slate-600 font-semibold">Trạng thái</th>
              <th className="text-left px-4 py-3 text-slate-600 font-semibold">Ngày tạo</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-800">{u.name}</td>
                <td className="px-4 py-3 text-slate-500 text-sm">{u.email}</td>
                <td className="px-4 py-3 max-w-[280px]">
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
                <td className="px-4 py-3">
                  <button onClick={() => toggleActive(u)} className={`text-xs px-2 py-1 rounded-full font-semibold transition ${u.active ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
                    {u.active ? "● Hoạt động" : "○ Khoá"}
                  </button>
                </td>
                <td className="px-4 py-3 text-xs text-slate-400">
                  {new Date(u.createdAt).toLocaleDateString("vi-VN")}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 justify-end">
                    <button onClick={() => openEdit(u)} className="p-1.5 rounded hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDelete(u)} className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={6} className="text-center py-8 text-slate-400">Chưa có tài khoản nào</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="font-bold text-slate-800">{editUser ? "Sửa tài khoản" : "Thêm tài khoản"}</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              {!editUser && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
                  <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-rose-400" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" />
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Tên hiển thị</label>
                <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-rose-400" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nguyễn Văn A" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">{editUser ? "Mật khẩu mới (bỏ trống nếu không đổi)" : "Mật khẩu"}</label>
                <input type="password" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-rose-400" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
                {/* Checkbox đăng xuất thiết bị khác — chỉ hiện khi đang sửa và có nhập mật khẩu mới */}
                {editUser && form.password && (
                  <label className="flex items-center gap-2 mt-2 p-2.5 rounded-lg border border-amber-200 bg-amber-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.logoutOtherDevices}
                      onChange={e => setForm({ ...form, logoutOtherDevices: e.target.checked })}
                      className="accent-amber-500"
                    />
                    <span className="text-xs text-amber-800 font-medium">
                      🔒 Đăng xuất khỏi tất cả thiết bị khác (khuyến nghị)
                    </span>
                  </label>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">Phân quyền theo module</label>
                {/* Admin toggle */}
                <label className="flex items-center gap-2 p-2.5 rounded-lg border border-rose-200 bg-rose-50 mb-2 cursor-pointer">
                  <input type="checkbox" checked={form.isAdmin}
                    onChange={e => setForm({ ...form, isAdmin: e.target.checked })}
                    className="accent-rose-500" />
                  <span className="text-sm font-semibold text-rose-700">Admin — toàn quyền</span>
                </label>
                {/* Module checkboxes */}
                {!form.isAdmin && (
                  <div className="grid grid-cols-2 gap-1.5">
                    {ALL_MODULES.map(mod => {
                      const checked = selectedMods.includes(mod.key);
                      return (
                        <label key={mod.key}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm transition ${
                            checked ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                          }`}>
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
            <div className="flex gap-2 p-5 pt-0">
              <button onClick={() => setShowForm(false)} className="flex-1 border border-slate-200 text-slate-600 rounded-lg py-2 text-sm hover:bg-slate-50 transition">Huỷ</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 bg-rose-500 text-white rounded-lg py-2 text-sm font-semibold hover:bg-rose-600 disabled:opacity-50 transition flex items-center justify-center gap-1">
                {saving ? "Đang lưu..." : <><Check size={14} /> Lưu</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
