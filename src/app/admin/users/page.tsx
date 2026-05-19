"use client";

import { useEffect, useState } from "react";
import { Users, Plus, Pencil, Trash2, X, Check } from "lucide-react";

type User = {
  id: string;
  email: string;
  name: string;
  role: string;
  active: boolean;
  createdAt: string;
};

const ROLE_LABEL: Record<string, string> = {
  admin: "Admin",
  kho: "Nhân viên Kho",
  san_xuat: "Nhân viên Sản xuất",
};

const ROLE_COLOR: Record<string, string> = {
  admin: "bg-rose-100 text-rose-700",
  kho: "bg-blue-100 text-blue-700",
  san_xuat: "bg-purple-100 text-purple-700",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [form, setForm] = useState({ email: "", name: "", password: "", role: "kho" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => fetch("/api/admin/users").then((r) => r.json()).then(setUsers);

  useEffect(() => { load(); }, []);

  function openAdd() {
    setEditUser(null);
    setForm({ email: "", name: "", password: "", role: "kho" });
    setError("");
    setShowForm(true);
  }

  function openEdit(u: User) {
    setEditUser(u);
    setForm({ email: u.email, name: u.name, password: "", role: u.role });
    setError("");
    setShowForm(true);
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      if (editUser) {
        const body: Record<string, unknown> = { name: form.name, role: form.role };
        if (form.password) body.password = form.password;
        const res = await fetch(`/api/admin/users/${editUser.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        if (!res.ok) throw new Error((await res.json()).error);
      } else {
        const res = await fetch("/api/admin/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
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
              <th className="text-left px-4 py-3 text-slate-600 font-semibold">Role</th>
              <th className="text-left px-4 py-3 text-slate-600 font-semibold">Trạng thái</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-800">{u.name}</td>
                <td className="px-4 py-3 text-slate-500">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded font-semibold ${ROLE_COLOR[u.role] ?? "bg-slate-100 text-slate-600"}`}>
                    {ROLE_LABEL[u.role] ?? u.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleActive(u)} className={`text-xs px-2 py-0.5 rounded font-semibold transition ${u.active ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
                    {u.active ? "Hoạt động" : "Khoá"}
                  </button>
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
              <tr><td colSpan={5} className="text-center py-8 text-slate-400">Chưa có tài khoản nào</td></tr>
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
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Role / Quyền</label>
                <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-rose-400" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  <option value="admin">Admin — toàn quyền</option>
                  <option value="kho">Nhân viên Kho (/kho, /doi-tra)</option>
                  <option value="san_xuat">Nhân viên Sản xuất (/san-xuat)</option>
                </select>
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
