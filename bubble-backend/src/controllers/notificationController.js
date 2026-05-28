import { Notification } from "../models/Notification.js";

const DUPLICATE_WINDOW_MS = 2 * 60 * 1000;

function formatNotification(notificationDoc) {
  return {
    id: String(notificationDoc._id),
    type: notificationDoc.type || "info",
    text: notificationDoc.text || "",
    fromNickname: notificationDoc.fromNickname || null,
    fromUserId: notificationDoc.fromUserId ? String(notificationDoc.fromUserId) : null,
    postId: notificationDoc.postId || null,
    eventKey: notificationDoc.eventKey || null,
    read: Boolean(notificationDoc.read),
    createdAt: notificationDoc.createdAt
      ? new Date(notificationDoc.createdAt).toISOString()
      : new Date().toISOString(),
  };
}

function notificationIdentityKey(notificationDoc) {
  const eventKey = String(notificationDoc?.eventKey || "").trim();
  if (eventKey) return `event:${eventKey}`;

  return [
    notificationDoc?.type || "info",
    notificationDoc?.text || "",
    notificationDoc?.fromUserId ? String(notificationDoc.fromUserId) : "",
    notificationDoc?.postId || "",
  ].join("|");
}

function collapseNotifications(notificationDocs, pageSize) {
  const deduped = [];
  const seen = new Map();

  for (const doc of notificationDocs) {
    const createdAt = new Date(doc?.createdAt || 0).getTime();
    const key = notificationIdentityKey(doc);
    const lastSeenAt = seen.get(key);

    if (
      Number.isFinite(createdAt) &&
      Number.isFinite(lastSeenAt) &&
      Math.abs(lastSeenAt - createdAt) < DUPLICATE_WINDOW_MS
    ) {
      continue;
    }

    deduped.push(doc);
    seen.set(key, createdAt);

    if (deduped.length >= pageSize) break;
  }

  return deduped;
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
        .limit(pageSize * 4)
        .lean();

      const visibleNotifications = collapseNotifications(notificationDocs, pageSize);
      return res.json({
        notifications: visibleNotifications.map((doc) => formatNotification(doc)),
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
        eventKey: typeof req.body?.eventKey === "string" ? req.body.eventKey.trim() || null : null,
        read: false
      };

      const cutoff = new Date(Date.now() - DUPLICATE_WINDOW_MS);
      const duplicateQuery = payload.eventKey
        ? {
            toUserId,
            eventKey: payload.eventKey,
            createdAt: { $gte: cutoff },
          }
        : {
            toUserId,
            type: payload.type,
            text: payload.text,
            fromUserId: payload.fromUserId,
            postId: payload.postId,
            read: false,
            createdAt: { $gte: cutoff },
          };

      const existingNotification = await Notification.findOne(duplicateQuery)
        .sort({ createdAt: -1 })
        .lean();

      if (existingNotification) {
        return res.json({
          notification: formatNotification(existingNotification),
          deduped: true,
        });
      }

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
