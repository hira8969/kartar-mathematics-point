import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";
import { notificationService } from "../services/notificationService";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const push = (message, type = "info") => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setItems((current) => [...current, { id, message, type }]);
    window.setTimeout(() => {
      setItems((current) => current.filter((item) => item.id !== id));
    }, 3500);
  };

  const remove = (id) => {
    setItems((current) => current.filter((item) => item.id !== id));
  };

  const refreshNotifications = async () => {
    if (!isAuthenticated) {
      setNotifications([]);
      return [];
    }

    const data = await notificationService.getMine();
    setNotifications(data);
    return data;
  };

  const markAsRead = async (id) => {
    await notificationService.markRead(id);
    setNotifications((current) => current.map((item) => (item._id === id ? { ...item, isRead: true } : item)));
  };

  const markAllAsRead = async () => {
    await notificationService.markAllRead();
    setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
  };

  useEffect(() => {
    refreshNotifications().catch(() => {
      setNotifications([]);
    });
  }, [isAuthenticated]);

  const unreadCount = notifications.filter((item) => !item.isRead).length;

  const value = useMemo(
    () => ({
      items,
      push,
      remove,
      notifications,
      unreadCount,
      refreshNotifications,
      markAsRead,
      markAllAsRead
    }),
    [items, notifications, unreadCount]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export const useNotifications = () => useContext(NotificationContext);
