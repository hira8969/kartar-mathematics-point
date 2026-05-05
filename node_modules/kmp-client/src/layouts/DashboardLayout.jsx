import { useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import { navByRole } from "../utils/roleConfig";
import { INSTITUTE } from "../utils/constants";
import { formatDate } from "../utils/formatters";

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const location = useLocation();
  const links = navByRole[user?.role] || [];
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <div className="min-h-screen bg-app">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-4 md:px-6">
        <header className="mb-4 flex flex-col gap-4 rounded-[2rem] border border-white/70 bg-white/80 px-5 py-4 shadow-xl shadow-orange-100 backdrop-blur md:flex-row md:items-center md:justify-between">
          <div>
            <Link to="/" className="font-display text-2xl font-extrabold text-ink">{INSTITUTE.name}</Link>
            <p className="text-sm text-slate-500">{INSTITUTE.address} | Contact: {INSTITUTE.contact}</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="relative">
              <button
                onClick={() => setShowNotifications((current) => !current)}
                className="rounded-2xl border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-semibold text-ink"
              >
                Notifications ({unreadCount})
              </button>
              {showNotifications ? (
                <div className="absolute right-0 top-14 z-20 w-80 rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="font-display text-lg font-bold text-ink">Inbox</p>
                    <button onClick={markAllAsRead} className="text-xs font-bold uppercase tracking-wide text-saffron">
                      Mark all read
                    </button>
                  </div>
                  <div className="max-h-80 space-y-3 overflow-auto pr-1">
                    {notifications.length ? notifications.map((item) => (
                      <button
                        key={item._id}
                        onClick={() => markAsRead(item._id)}
                        className={`block w-full rounded-2xl p-3 text-left ${item.isRead ? "bg-slate-50" : "bg-orange-50"}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <p className="font-semibold text-ink">{item.title}</p>
                          {!item.isRead ? <span className="mt-1 h-2.5 w-2.5 rounded-full bg-saffron" /> : null}
                        </div>
                        <p className="mt-1 text-sm text-slate-600">{item.message}</p>
                        <p className="mt-2 text-xs text-slate-400">{formatDate(item.createdAt)}</p>
                      </button>
                    )) : <p className="text-sm text-slate-500">No notifications yet.</p>}
                  </div>
                </div>
              ) : null}
            </div>
            <div className="text-right text-sm">
              <p className="font-semibold text-ink">{user?.name}</p>
              <p className="capitalize text-slate-500">{user?.role}</p>
            </div>
            <button onClick={logout} className="rounded-2xl bg-ink px-4 py-2 text-sm font-semibold text-white">Logout</button>
          </div>
        </header>

        <div className="grid flex-1 gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="card h-fit p-4">
            <div className="rounded-3xl bg-orange-50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-saffron">{INSTITUTE.tagline}</p>
              <p className="mt-2 font-display text-lg font-bold text-ink">Role Navigation</p>
            </div>
            <nav className="mt-4 space-y-2">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === `/${user.role}`}
                  className={({ isActive }) =>
                    `block rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                      isActive || location.pathname === link.to
                        ? "bg-ink text-white"
                        : "text-slate-600 hover:bg-orange-50 hover:text-ink"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </aside>

          <div className="flex min-h-[70vh] flex-col">
            <main className="flex-1">
              <Outlet />
            </main>
            <footer className="mt-6 rounded-[2rem] border border-white/70 bg-white/80 px-5 py-4 text-sm text-slate-600 shadow-xl shadow-orange-100">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <p>{INSTITUTE.address}</p>
                <p className="font-bold text-ink">Call: {INSTITUTE.contact}</p>
                <p>{INSTITUTE.ownerName} | {INSTITUTE.ownerEmail}</p>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}
