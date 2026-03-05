import { apiClient } from '../apiClient';

export interface Notification {
  notification_id: number;
  user_id: number;
  title: string;
  message: string;
  type: string;
  reference_id: number | null;
  url: string | null;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationResponse {
  success: boolean;
  notifications: Notification[];
  unreadCount: number;
}

export const notificationService = {
  getNotifications: async (
    limit: number = 20,
    unreadOnly: boolean = false,
  ): Promise<NotificationResponse> => {
    const response = await apiClient.get(`/notifications?limit=${limit}&unreadOnly=${unreadOnly}`);
    // The backend Express router sends: { success: true, data: { notifications, unreadCount } }
    // Axios wraps that in `data`. So response.data is the full JSON payload.
    // The inner data holds the actual objects matching NotificationResponse.
    return response.data.data;
  },

  markAsRead: async (id: number): Promise<{ success: boolean; notification: Notification }> => {
    const response = await apiClient.put(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async (): Promise<{ success: boolean; count: number }> => {
    const response = await apiClient.put('/notifications/mark-all-read');
    return response.data;
  },
};
