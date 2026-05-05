import { useEffect, useMemo, useState } from "react";
import DataTable from "../../components/DataTable";
import FormField from "../../components/FormField";
import LoadingState from "../../components/LoadingState";
import Modal from "../../components/Modal";
import PageHeader from "../../components/PageHeader";
import SectionCard from "../../components/SectionCard";
import { useNotifications } from "../../context/NotificationContext";
import { adminService } from "../../services/adminService";
import { formatDate } from "../../utils/formatters";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  password: "",
  role: "student",
  studentClass: "10",
  subjectsTaught: "Mathematics"
};

const initialEditForm = {
  _id: "",
  name: "",
  email: "",
  phone: "",
  role: "student",
  studentClass: "10",
  subjectsTaught: "",
  isApproved: true,
  isSuspended: false
};

const PAGE_SIZE = 8;

export default function AdminUsersPage() {
  const { push } = useNotifications();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [bulkSubmitting, setBulkSubmitting] = useState(false);
  const [filters, setFilters] = useState({ role: "all", className: "all", search: "", sort: "newest" });
  const [form, setForm] = useState(initialForm);
  const [createdUser, setCreatedUser] = useState(null);
  const [page, setPage] = useState(1);
  const [editingUser, setEditingUser] = useState(initialEditForm);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setUsers(await adminService.users());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    const result = users.filter((user) => {
      if (filters.role !== "all" && user.role !== filters.role) return false;
      if (filters.className !== "all" && user.studentClass !== filters.className) return false;
      if (!query) return true;

      return [user.name, user.email, user.phone, user.role, user.studentClass]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });

    result.sort((a, b) => {
      switch (filters.sort) {
        case "oldest":
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        case "name_asc":
          return (a.name || "").localeCompare(b.name || "");
        case "name_desc":
          return (b.name || "").localeCompare(a.name || "");
        case "role":
          return (a.role || "").localeCompare(b.role || "");
        case "class":
          return (a.studentClass || "").localeCompare(b.studentClass || "");
        case "newest":
        default:
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
    });

    return result;
  }, [users, filters]);

  useEffect(() => {
    setPage(1);
  }, [filters.role, filters.className, filters.search, filters.sort]);

  useEffect(() => {
    setSelectedIds((current) => current.filter((id) => users.some((user) => user._id === id)));
  }, [users]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginatedRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const pageIds = paginatedRows.map((user) => user._id);
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));
  const selectedUsers = users.filter((user) => selectedIds.includes(user._id));

  const toggleSelection = (userId) => {
    setSelectedIds((current) => current.includes(userId)
      ? current.filter((id) => id !== userId)
      : [...current, userId]);
  };

  const toggleSelectPage = () => {
    setSelectedIds((current) => {
      if (allPageSelected) {
        return current.filter((id) => !pageIds.includes(id));
      }

      return Array.from(new Set([...current, ...pageIds]));
    });
  };

  const clearSelection = () => setSelectedIds([]);

  const createUser = async () => {
    if (!form.name.trim() || !form.phone.trim() || !form.password.trim()) {
      push("Name, phone, and password are required", "error");
      return;
    }

    setSubmitting(true);
    try {
      const savedUser = await adminService.createUser({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
        role: form.role,
        studentClass: form.role === "student" ? form.studentClass : "",
        subjectsTaught: form.role === "faculty" ? form.subjectsTaught : ""
      });
      setCreatedUser(savedUser);
      push(`${form.role[0].toUpperCase()}${form.role.slice(1)} account created successfully`, "success");
      setForm(initialForm);
      await load();
      setPage(1);
    } catch (error) {
      push(error.response?.data?.message || "Unable to create user", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (user) => {
    setEditingUser({
      _id: user._id,
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      role: user.role || "student",
      studentClass: user.studentClass || "10",
      subjectsTaught: Array.isArray(user.subjectsTaught) ? user.subjectsTaught.join(", ") : "",
      isApproved: Boolean(user.isApproved),
      isSuspended: Boolean(user.isSuspended)
    });
    setIsEditOpen(true);
  };

  const saveUserEdits = async () => {
    if (!editingUser.name.trim() || !editingUser.phone.trim()) {
      push("Name and phone are required", "error");
      return;
    }

    setEditSubmitting(true);
    try {
      const updatedUser = await adminService.updateUser(editingUser._id, {
        name: editingUser.name.trim(),
        email: editingUser.email.trim(),
        phone: editingUser.phone.trim(),
        role: editingUser.role,
        studentClass: editingUser.role === "student" ? editingUser.studentClass : "",
        subjectsTaught: editingUser.role === "faculty" ? editingUser.subjectsTaught : "",
        isApproved: editingUser.isApproved,
        isSuspended: editingUser.isSuspended
      });
      setCreatedUser((current) => (current && (current.id === updatedUser._id || current._id === updatedUser._id) ? updatedUser : current));
      push("User details updated", "success");
      setIsEditOpen(false);
      await load();
    } catch (error) {
      push(error.response?.data?.message || "Unable to update user", "error");
    } finally {
      setEditSubmitting(false);
    }
  };

  const bulkApproveSelected = async () => {
    if (!selectedIds.length) {
      push("Select at least one user", "error");
      return;
    }

    setBulkSubmitting(true);
    try {
      await adminService.bulkApproveUsers(selectedIds);
      push("Selected users approved", "success");
      clearSelection();
      await load();
    } catch (error) {
      push(error.response?.data?.message || "Unable to approve selected users", "error");
    } finally {
      setBulkSubmitting(false);
    }
  };

  const requestBulkDelete = () => {
    if (!selectedIds.length) {
      push("Select at least one user", "error");
      return;
    }

    setIsBulkDeleteOpen(true);
  };

  const confirmBulkDelete = async () => {
    setBulkSubmitting(true);
    try {
      await adminService.bulkDeleteUsers(selectedIds);
      if (createdUser && selectedIds.includes(createdUser.id || createdUser._id)) {
        setCreatedUser(null);
      }
      push("Selected users deleted", "success");
      clearSelection();
      setIsBulkDeleteOpen(false);
      await load();
    } catch (error) {
      push(error.response?.data?.message || "Unable to delete selected users", "error");
    } finally {
      setBulkSubmitting(false);
    }
  };

  const toggleSuspend = async (user) => {
    await adminService.updateUser(user._id, { isSuspended: !user.isSuspended });
    push(`User ${user.isSuspended ? "activated" : "suspended"}`, "success");
    load();
  };

  const removeUser = async (userId) => {
    await adminService.deleteUser(userId);
    if (createdUser?.id === userId || createdUser?._id === userId) {
      setCreatedUser(null);
    }
    setSelectedIds((current) => current.filter((id) => id !== userId));
    push("User deleted", "success");
    load();
  };

  const exportCsv = () => {
    const headers = ["Name", "Role", "Email", "Phone", "Class", "Subjects", "Approved", "Suspended", "Created At"];
    const escapeValue = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
    const lines = filtered.map((user) => [
      user.name,
      user.role,
      user.email,
      user.phone,
      user.studentClass,
      Array.isArray(user.subjectsTaught) ? user.subjectsTaught.join("; ") : "",
      user.isApproved,
      user.isSuspended,
      formatDate(user.createdAt, {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    ].map(escapeValue).join(","));

    const csv = [headers.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "kmp-users.csv";
    link.click();
    window.URL.revokeObjectURL(url);
    push("Users exported to CSV", "success");
  };

  if (loading) return <LoadingState label="Loading users..." />;

  return (
    <>
      <div className="space-y-6">
        <PageHeader eyebrow="User Management" title="Manage students, faculty, and admin accounts" description="Create accounts, track the latest saved user, then search, sort, edit, export, bulk approve, or bulk delete from one place." />
        <SectionCard title="Create User Account">
          <div className="grid gap-3 md:grid-cols-2">
            <FormField label="Role">
              <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="admin">Admin</option>
              </select>
            </FormField>
            <FormField label="Name"><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></FormField>
            <FormField label="Email"><input className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></FormField>
            <FormField label="Phone"><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></FormField>
            <FormField label="Password"><input className="input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></FormField>
            {form.role === "student" ? (
              <FormField label="Class">
                <select className="input" value={form.studentClass} onChange={(e) => setForm({ ...form, studentClass: e.target.value })}>
                  {Array.from({ length: 7 }, (_, index) => index + 6).map((value) => <option key={value} value={String(value)}>Class {value}</option>)}
                </select>
              </FormField>
            ) : null}
            {form.role === "faculty" ? (
              <div className="md:col-span-2">
                <FormField label="Subjects Taught" hint="Use commas if you want to add more than one subject.">
                  <input className="input" value={form.subjectsTaught} onChange={(e) => setForm({ ...form, subjectsTaught: e.target.value })} />
                </FormField>
              </div>
            ) : null}
          </div>
          <button onClick={createUser} disabled={submitting} className="btn-primary mt-4 disabled:cursor-not-allowed disabled:opacity-60">
            {submitting ? "Saving user..." : "Create User"}
          </button>
        </SectionCard>

        {createdUser ? (
          <SectionCard title="Latest Saved User">
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
              <p className="text-sm font-bold uppercase tracking-wide text-emerald-700">User saved successfully</p>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Name</p><p className="font-semibold text-ink">{createdUser.name}</p></div>
                <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Role</p><p className="font-semibold capitalize text-ink">{createdUser.role}</p></div>
                <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</p><p className="font-semibold text-ink">{createdUser.email || "Not provided"}</p></div>
                <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Phone</p><p className="font-semibold text-ink">{createdUser.phone}</p></div>
                <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Class</p><p className="font-semibold text-ink">{createdUser.studentClass || "-"}</p></div>
                <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Subjects</p><p className="font-semibold text-ink">{createdUser.subjectsTaught?.length ? createdUser.subjectsTaught.join(", ") : "-"}</p></div>
              </div>
            </div>
          </SectionCard>
        ) : null}

        <SectionCard
          title="All Users"
          action={
            <div className="flex flex-wrap gap-3">
              <input className="input w-56" placeholder="Search name, email, phone..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
              <select className="input w-36" value={filters.role} onChange={(e) => setFilters({ ...filters, role: e.target.value })}>
                <option value="all">All roles</option><option value="student">Student</option><option value="faculty">Faculty</option><option value="admin">Admin</option>
              </select>
              <select className="input w-32" value={filters.className} onChange={(e) => setFilters({ ...filters, className: e.target.value })}>
                <option value="all">All classes</option>{Array.from({ length: 7 }, (_, index) => index + 6).map((value) => <option key={value} value={String(value)}>{value}</option>)}
              </select>
              <select className="input w-40" value={filters.sort} onChange={(e) => setFilters({ ...filters, sort: e.target.value })}>
                <option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="name_asc">Name A-Z</option><option value="name_desc">Name Z-A</option><option value="role">Role</option><option value="class">Class</option>
              </select>
              <button onClick={exportCsv} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700">Export CSV</button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="flex flex-col gap-3 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold text-ink">Bulk Actions</p>
                <p className="text-sm text-slate-600">{selectedIds.length} user(s) selected across the current filtered list.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={toggleSelectPage} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700">{allPageSelected ? "Unselect Page" : "Select Page"}</button>
                <button onClick={clearSelection} disabled={!selectedIds.length} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50">Clear Selection</button>
                <button onClick={bulkApproveSelected} disabled={!selectedIds.length || bulkSubmitting} className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50">{bulkSubmitting ? "Working..." : "Approve Selected"}</button>
                <button onClick={requestBulkDelete} disabled={!selectedIds.length || bulkSubmitting} className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 disabled:cursor-not-allowed disabled:opacity-50">{bulkSubmitting ? "Working..." : "Delete Selected"}</button>
              </div>
            </div>

            <DataTable
              columns={[
                { key: "select", label: <input type="checkbox" checked={allPageSelected} onChange={toggleSelectPage} aria-label="Select all users on this page" />, render: (row) => <input type="checkbox" checked={selectedIds.includes(row._id)} onChange={() => toggleSelection(row._id)} aria-label={`Select ${row.name}`} /> },
                { key: "name", label: "Name" },
                { key: "role", label: "Role", render: (row) => <span className="capitalize">{row.role}</span> },
                { key: "contact", label: "Email / Phone", render: (row) => row.email || row.phone },
                { key: "studentClass", label: "Class", render: (row) => row.studentClass || "-" },
                { key: "createdAt", label: "Created", render: (row) => formatDate(row.createdAt) },
                { key: "status", label: "Status", render: (row) => row.isSuspended ? "Suspended" : row.isApproved ? "Approved" : "Pending" },
                { key: "actions", label: "Actions", render: (row) => <div className="flex gap-2"><button onClick={() => openEditModal(row)} className="rounded-xl border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-700">Edit</button><button onClick={() => toggleSuspend(row)} className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold">{row.isSuspended ? "Activate" : "Suspend"}</button><button onClick={() => removeUser(row._id)} className="rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-600">Delete</button></div> }
              ]}
              rows={paginatedRows.map((user) => ({ ...user, name: createdUser && (createdUser.id === user._id || createdUser._id === user._id) ? `${user.name} (Just saved)` : user.name }))}
            />

            <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
              <p>Showing {(filtered.length && ((safePage - 1) * PAGE_SIZE + 1)) || 0} to {Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length} users</p>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={safePage === 1} className="rounded-xl border border-slate-300 px-3 py-2 font-semibold disabled:cursor-not-allowed disabled:opacity-50">Previous</button>
                <span className="min-w-24 text-center font-semibold text-ink">Page {safePage} of {totalPages}</span>
                <button onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={safePage === totalPages} className="rounded-xl border border-slate-300 px-3 py-2 font-semibold disabled:cursor-not-allowed disabled:opacity-50">Next</button>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      <Modal open={isEditOpen} title="Edit User" onClose={() => setIsEditOpen(false)}>
        <div className="grid gap-3 md:grid-cols-2">
          <FormField label="Role"><select className="input" value={editingUser.role} onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}><option value="student">Student</option><option value="faculty">Faculty</option><option value="admin">Admin</option></select></FormField>
          <FormField label="Name"><input className="input" value={editingUser.name} onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })} /></FormField>
          <FormField label="Email"><input className="input" value={editingUser.email} onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })} /></FormField>
          <FormField label="Phone"><input className="input" value={editingUser.phone} onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })} /></FormField>
          {editingUser.role === "student" ? <FormField label="Class"><select className="input" value={editingUser.studentClass} onChange={(e) => setEditingUser({ ...editingUser, studentClass: e.target.value })}>{Array.from({ length: 7 }, (_, index) => index + 6).map((value) => <option key={value} value={String(value)}>Class {value}</option>)}</select></FormField> : null}
          {editingUser.role === "faculty" ? <div className="md:col-span-2"><FormField label="Subjects Taught"><input className="input" value={editingUser.subjectsTaught} onChange={(e) => setEditingUser({ ...editingUser, subjectsTaught: e.target.value })} /></FormField></div> : null}
          <FormField label="Approved"><select className="input" value={String(editingUser.isApproved)} onChange={(e) => setEditingUser({ ...editingUser, isApproved: e.target.value === "true" })}><option value="true">Approved</option><option value="false">Not approved</option></select></FormField>
          <FormField label="Account Status"><select className="input" value={String(editingUser.isSuspended)} onChange={(e) => setEditingUser({ ...editingUser, isSuspended: e.target.value === "true" })}><option value="false">Active</option><option value="true">Suspended</option></select></FormField>
        </div>
        <div className="mt-5 flex justify-end gap-3">
          <button onClick={() => setIsEditOpen(false)} className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">Cancel</button>
          <button onClick={saveUserEdits} disabled={editSubmitting} className="btn-primary disabled:cursor-not-allowed disabled:opacity-60">{editSubmitting ? "Saving..." : "Save Changes"}</button>
        </div>
      </Modal>

      <Modal open={isBulkDeleteOpen} title="Confirm Bulk Delete" onClose={() => !bulkSubmitting && setIsBulkDeleteOpen(false)}>
        <div className="space-y-4">
          <p className="text-sm text-slate-600">You are about to permanently delete <span className="font-semibold text-ink">{selectedIds.length}</span> selected user(s). This action cannot be undone.</p>
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-semibold text-red-700">Selected users</p>
            <div className="mt-2 max-h-48 space-y-2 overflow-auto text-sm text-slate-700">{selectedUsers.map((user) => <p key={user._id}>{user.name} ({user.role}) - {user.email || user.phone}</p>)}</div>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setIsBulkDeleteOpen(false)} disabled={bulkSubmitting} className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50">Cancel</button>
            <button onClick={confirmBulkDelete} disabled={bulkSubmitting} className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 disabled:cursor-not-allowed disabled:opacity-50">{bulkSubmitting ? "Deleting..." : "Yes, Delete Selected"}</button>
          </div>
        </div>
      </Modal>
    </>
  );
}
