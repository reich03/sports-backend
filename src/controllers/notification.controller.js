const { Notification } = require('../models');

exports.getNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    const { count, rows: notifications } = await Notification.findAndCountAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    const unreadCount = await Notification.count({
      where: { user_id: req.user.id, is_read: false }
    });
    
    res.json({
      data: {
        notifications,
        unread_count: unreadCount,
        pagination: {
          total: count,
          page: parseInt(page),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({
      where: { id: req.params.notificationId, user_id: req.user.id }
    });
    
    if (!notification) {
      return res.status(404).json({ error: { message: 'Notificación no encontrada' } });
    }
    
    notification.is_read = true;
    notification.read_at = new Date();
    await notification.save();
    
    res.json({ message: 'Notificación marcada como leída' });
  } catch (error) {
    next(error);
  }
};

exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.update(
      { is_read: true, read_at: new Date() },
      { where: { user_id: req.user.id, is_read: false } }
    );
    
    res.json({ message: 'Todas las notificaciones marcadas como leídas' });
  } catch (error) {
    next(error);
  }
};

exports.deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({
      where: { id: req.params.notificationId, user_id: req.user.id }
    });
    
    if (!notification) {
      return res.status(404).json({ error: { message: 'Notificación no encontrada' } });
    }
    
    await notification.destroy();
    res.json({ message: 'Notificación eliminada' });
  } catch (error) {
    next(error);
  }
};
