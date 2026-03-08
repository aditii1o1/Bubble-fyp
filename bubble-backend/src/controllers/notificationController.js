import { Notification } from "../models/Notification.js";

function formatNotification(notificationDoc) {
  return {
    id: String(notificationDoc._id),
    type: notificationDoc.type || "info",
    text: notificationDoc.text || "",
    fromNickname: notificationDoc.fromNickname || null,
    fromUserId: notificationDoc.fromUserId ? String(notificationDoc.fromUserId) : null,
    postId: notificationDoc.postId || null,
    read: Boolean(notificationDoc.read),
    createdAt: notificationDoc.createdAt
      ? new Date(notificationDoc.createdAt).toISOString()
      : new Date().toISOString(),
  };
}

const notificationController = {
  getMyNotifications: async (req, res, next) => {
    try {
      const pageSize = Math.max(
        1,
        Math.min(50, parseInt(req.query?.pageSize, 10) || 30)
      );
      const notificationDocs = await Notification.find({ toUserId: req.user._id })
        .sort({ createdAt: -1 })
        .limit(pageSize)
        .lean();
      return res.json({
        notifications: notificationDocs.map((doc) => formatNotification(doc)),
      });
    } catch (e) {
      return next(e);
    }
  },

  markRead: async (req, res, next) => {
    try {
      const id = String(req.params?.id || "");
      await Notification.updateOne({ _id: id, toUserId: req.user._id }, { $set: { read: true } });
      return res.json({ ok: true });
    } catch (e) {
      return next(e);
    }
  },

  markAllRead: async (req, res, next) => {
    try {
      await Notification.updateMany({ toUserId: req.user._id, read: false }, { $set: { read: true } });
      return res.json({ ok: true });
    } catch (e) {
      return next(e);
    }
  },

  createNotification: async (req, res, next) => {
    try {
      const toUserId =
        typeof req.body?.toUserId === "string" ? req.body.toUserId.trim() : "";
      if (!toUserId) return res.status(400).json({ message: "Missing toUserId" });

      const type = typeof req.body?.type === "string" ? req.body.type : "info";
      const text = typeof req.body?.text === "string" ? req.body.text : "";

      const payload = {
        toUserId,
        type,
        text,
        fromNickname:
          typeof req.body?.fromNickname === "string" ? req.body.fromNickname : null,
        fromUserId: typeof req.body?.fromUserId === "string" ? req.body.fromUserId : null,
        postId: typeof req.body?.postId === "string" ? req.body.postId : null,
        read: false
      };
      const createdNotification = await Notification.create(payload);
      return res.status(201).json({
        notification: formatNotification(createdNotification.toObject()),
      });
    } catch (e) {
      return next(e);
    }
  }
};

export { notificationController };
