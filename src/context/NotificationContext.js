'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (message, type = 'info', duration = 5000) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type, duration }]);

    // Auto-remove notification after duration
    if (duration) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }

    return id;
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Helper functions for common notification types
  const showSuccess = (message, duration) => {
    return addNotification(message, 'success', duration);
  };

  const showError = (message, duration) => {
    return addNotification(message, 'error', duration);
  };

  const showWarning = (message, duration) => {
    return addNotification(message, 'warning', duration);
  };

  const showInfo = (message, duration) => {
    return addNotification(message, 'info', duration);
  };

  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {/* Notification display component */}
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
          {notifications.map(notification => (
            <div 
              key={notification.id}
              className={`p-4 rounded shadow-md flex justify-between items-center ${getNotificationStyles(notification.type)}`}
            >
              <p>{notification.message}</p>
              <button 
                onClick={() => removeNotification(notification.id)}
                className="ml-4 text-sm font-medium"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </NotificationContext.Provider>
  );
}

function getNotificationStyles(type) {
  switch (type) {
    case 'success':
      return 'bg-green-100 text-green-800 border-l-4 border-green-500';
    case 'error':
      return 'bg-red-100 text-red-800 border-l-4 border-red-500';
    case 'warning':
      return 'bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500';
    case 'info':
    default:
      return 'bg-blue-100 text-blue-800 border-l-4 border-blue-500';
  }
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}