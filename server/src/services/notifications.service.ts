import { NotificationType } from '../types';
import { NotificationModel, normalize } from '../models';

export const notificationsService = {
  async create(data: { user_id: string; type: NotificationType; title: string; message: string; metadata?: any }) {
    const created = await NotificationModel.create({
      user_id: data.user_id,
      type: data.type,
      title: data.title,
      message: data.message,
      metadata: data.metadata || {},
    });
    return mapNotification(normalize(created));
  },

  async list(userId: string, page: number = 1, limit: number = 20) {
    const total = await NotificationModel.countDocuments({ user_id: userId });
    const unread_count = await NotificationModel.countDocuments({ user_id: userId, is_read: false });

    const rows = await NotificationModel.find({ user_id: userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return {
      notifications: rows.map((r: any) => mapNotification(r)),
      unread_count,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  },

  async markRead(notificationId: string, userId: string) {
    await NotificationModel.findOneAndUpdate({ _id: notificationId, user_id: userId }, { is_read: true });
  },

  async markAllRead(userId: string) {
    await NotificationModel.updateMany({ user_id: userId, is_read: false }, { is_read: true });
  },
};

function mapNotification(n: any) {
  return {
    ...n,
    id: n.id || String(n._id),
    user_id: String(n.user_id),
    created_at: n.created_at || n.createdAt,
    updated_at: n.updated_at || n.updatedAt,
  };
}
