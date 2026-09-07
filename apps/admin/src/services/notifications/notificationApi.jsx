import apiClient from "../api/client";

/**
 * Notifications API Service
 * Handles all notification-related API requests.
 */

// Get all notifications
export const getNotifications = async (params = {}) => {
  try {
    const response = await apiClient.get("/notifications", {
      params,
    });

    return response.data;
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    throw error;
  }
};

// Get a single notification by ID
export const getNotificationById = async (notificationId) => {
  try {
    const response = await apiClient.get(
      `/notifications/${notificationId}`
    );

    return response.data;
  } catch (error) {
    console.error(
      `Failed to fetch notification ${notificationId}:`,
      error
    );
    throw error;
  }
};

// Create a new notification
export const createNotification = async (notificationData) => {
  try {
    const response = await apiClient.post(
      "/notifications",
      notificationData
    );

    return response.data;
  } catch (error) {
    console.error("Failed to create notification:", error);
    throw error;
  }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await apiClient.patch(
      `/notifications/${notificationId}/read`
    );

    return response.data;
  } catch (error) {
    console.error(
      `Failed to mark notification ${notificationId} as read:`,
      error
    );
    throw error;
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async () => {
  try {
    const response = await apiClient.patch(
      "/notifications/read-all"
    );

    return response.data;
  } catch (error) {
    console.error(
      "Failed to mark all notifications as read:",
      error
    );
    throw error;
  }
};

// Delete a notification
export const deleteNotification = async (notificationId) => {
  try {
    const response = await apiClient.delete(
      `/notifications/${notificationId}`
    );

    return response.data;
  } catch (error) {
    console.error(
      `Failed to delete notification ${notificationId}:`,
      error
    );
    throw error;
  }
};

// Get unread notification count
export const getUnreadNotificationCount = async () => {
  try {
    const response = await apiClient.get(
      "/notifications/unread-count"
    );

    return response.data;
  } catch (error) {
    console.error(
      "Failed to fetch unread notification count:",
      error
    );
    throw error;
  }
};

export default {
  getNotifications,
  getNotificationById,
  createNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getUnreadNotificationCount,
};