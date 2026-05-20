import mongoose from "mongoose";
import { User } from "../models/User.js";
import { Settings } from "../models/Settings.js";
import { Broadcast } from "../models/Broadcast.js";
import { Notification } from "../models/Notification.js";
import { Report } from "../models/Report.js";
import { Post } from "../models/Post.js";
import { Comment } from "../models/Comment.js";
import { PostReaction } from "../models/PostReaction.js";
import { CommentReaction } from "../models/CommentReaction.js";
import { Donation } from "../models/Donation.js";
import { serializeDonation } from "../utils/donations.js";

function formatAdminUser(userDoc, { includeEmail = true } = {}) {
  if (!userDoc) return null;

  return {
    id: String(userDoc._id),
    ...(includeEmail ? { email: userDoc.email || "" } : {}),
    role: userDoc.role || "user",
    banned: Boolean(userDoc.banned),
    onboarded: Boolean(userDoc.onboarded),
    nickname: userDoc.nickname || "@anonymous",
    username: userDoc.username || "",
    avatar: userDoc.avatar || "cat",
    avatarUrl: userDoc.avatarUrl || null,
    createdAt: userDoc.createdAt ? new Date(userDoc.createdAt).toISOString() : null,
  };
}

function fallbackAdminUser({
  id = "",
  email = "",
  nickname = "@anonymous",
} = {}) {
  if (!id && !email && !nickname) return null;
  return {
    id,
    email,
    role: "user",
    banned: false,
    onboarded: false,
    nickname: nickname || "@anonymous",
    username: "",
    avatar: "cat",
    avatarUrl: null,
    createdAt: null,
  };
}

function formatReport(reportDoc, { reporterUser = null, reportedUser = null } = {}) {
  return {
    id: String(reportDoc._id),
    status: reportDoc.status || "open",
    targetType: reportDoc.targetType || "post",
    targetId: reportDoc.targetId || "",
    targetPostId: reportDoc.targetPostId || null,
    targetText: reportDoc.targetText || "",
    reason: reportDoc.reason || "",
    description: reportDoc.description || "",
    reporterId: reportDoc.reporterId || "",
    reporterEmail: reportDoc.reporterEmail || "",
    reporterNickname: reportDoc.reporterNickname || "",
    reportedUserId: reportDoc.reportedUserId || "",
    reportedUserNickname: reportDoc.reportedUserNickname || "",
    reporter:
      formatAdminUser(reporterUser) ||
      fallbackAdminUser({
        id: reportDoc.reporterId || "",
        email: reportDoc.reporterEmail || "",
        nickname: reportDoc.reporterNickname || "",
      }),
    reportedUser:
      formatAdminUser(reportedUser) ||
      fallbackAdminUser({
        id: reportDoc.reportedUserId || "",
        nickname: reportDoc.reportedUserNickname || "",
      }),
    createdAt: reportDoc.createdAt ? new Date(reportDoc.createdAt).toISOString() : new Date().toISOString(),
    resolvedAt: reportDoc.resolvedAt ? new Date(reportDoc.resolvedAt).toISOString() : null,
    actionTaken: reportDoc.actionTaken || null,
  };
}

function formatBroadcast(broadcastDoc) {
  return {
    id: String(broadcastDoc._id),
    title: broadcastDoc.title || "Announcement",
    message: broadcastDoc.message || "",
    createdByUid: broadcastDoc.createdByUid || null,
    createdByEmail: broadcastDoc.createdByEmail || null,
    createdAt: broadcastDoc.createdAt ? new Date(broadcastDoc.createdAt).toISOString() : new Date().toISOString(),
  };
}

async function attachUsersToReports(reportDocs) {
  const docs = Array.isArray(reportDocs) ? reportDocs : [];
  if (!docs.length) return [];

  const userIds = Array.from(
    new Set(
      docs
        .flatMap((doc) => [doc?.reporterId, doc?.reportedUserId])
        .filter((id) => mongoose.isValidObjectId(id))
        .map((id) => String(id))
    )
  );

  const userDocs = userIds.length
    ? await User.find({ _id: { $in: userIds } })
        .select({
          email: 1,
          role: 1,
          banned: 1,
          onboarded: 1,
          nickname: 1,
          username: 1,
          avatar: 1,
          avatarUrl: 1,
          createdAt: 1,
        })
        .lean()
    : [];

  const usersById = new Map(userDocs.map((userDoc) => [String(userDoc._id), userDoc]));

  return docs.map((doc) =>
    formatReport(doc, {
      reporterUser: usersById.get(String(doc?.reporterId || "")) || null,
      reportedUser: usersById.get(String(doc?.reportedUserId || "")) || null,
    })
  );
}

const adminController = {
  getDashboardCounts: async (req, res, next) => {
    try {
      const [openReports, users, posts] = await Promise.all([
        Report.countDocuments({ status: "open" }),
        User.countDocuments({}),
        Post.countDocuments({})
      ]);
      return res.json({ openReports, users, posts, comments: 0 });
    } catch (e) {
      return next(e);
    }
  },

  getDonations: async (req, res, next) => {
    try {
      const pageSize = Math.max(
        1,
        Math.min(200, parseInt(req.query?.pageSize, 10) || 100)
      );
      const status =
        typeof req.query?.status === "string" && req.query.status.trim()
          ? req.query.status.trim()
          : "";
      const q =
        typeof req.query?.q === "string" && req.query.q.trim()
          ? req.query.q.trim()
          : "";

      const query = {};
      if (status) query.status = status;
      if (q) {
        const regex = new RegExp(q, "i");
        query.$or = [
          { donorName: regex },
          { userEmail: regex },
          { userNickname: regex },
          { userUsername: regex },
          { pidx: regex },
          { purchaseOrderId: regex },
          { transactionId: regex },
        ];
      }

      const donationDocs = await Donation.find(query)
        .sort({ createdAt: -1 })
        .limit(pageSize)
        .lean();

      return res.json({ donations: donationDocs.map((doc) => serializeDonation(doc)) });
    } catch (e) {
      return next(e);
    }
  },

  getUsers: async (req, res, next) => {
    try {
      const pageSize = Math.max(
        1,
        Math.min(200, parseInt(req.query?.pageSize, 10) || 100)
      );
      const userDocs = await User.find({})
        .sort({ createdAt: -1 })
        .limit(pageSize)
        .lean();
      const users = userDocs.map((userDoc) => ({
        uid: String(userDoc._id),
        email: userDoc.email,
        role: userDoc.role,
        banned: Boolean(userDoc.banned),
        onboarded: Boolean(userDoc.onboarded),
        nickname: userDoc.nickname || "@anonymous",
        username: userDoc.username || "",
        avatar: userDoc.avatar || "cat",
        avatarUrl: userDoc.avatarUrl || null,
        createdAt: userDoc.createdAt,
        canBan: String(userDoc._id) !== String(req.user?._id || ""),
      }));
      return res.json({ users });
    } catch (e) {
      return next(e);
    }
  },

  banUser: async (req, res, next) => {
    try {
      const targetId = String(req.params.id || "");
      if (!mongoose.isValidObjectId(targetId)) {
        return res.status(400).json({ message: "Invalid user id" });
      }
      if (String(req.user?._id || "") === targetId) {
        return res.status(400).json({ message: "You can't ban your own admin account." });
      }

      const updatedUser = await User.findByIdAndUpdate(
        targetId,
        { $set: { banned: true } },
        { new: true }
      ).lean();
      if (!updatedUser) return res.status(404).json({ message: "User not found" });

      return res.json({ ok: true, user: formatAdminUser(updatedUser) });
    } catch (e) {
      return next(e);
    }
  },

  unbanUser: async (req, res, next) => {
    try {
      const targetId = String(req.params.id || "");
      if (!mongoose.isValidObjectId(targetId)) {
        return res.status(400).json({ message: "Invalid user id" });
      }
      if (String(req.user?._id || "") === targetId) {
        return res.status(400).json({ message: "Your admin account can't be changed here." });
      }

      const updatedUser = await User.findByIdAndUpdate(
        targetId,
        { $set: { banned: false } },
        { new: true }
      ).lean();
      if (!updatedUser) return res.status(404).json({ message: "User not found" });

      return res.json({ ok: true, user: formatAdminUser(updatedUser) });
    } catch (e) {
      return next(e);
    }
  },

  getModeration: async (req, res, next) => {
    try {
      const settingsDoc = await Settings.findOne({ key: "moderation" }).lean();
      const blockedWords = Array.isArray(settingsDoc?.data?.blockedWords)
        ? settingsDoc.data.blockedWords
        : [];
      return res.json({ blockedWords });
    } catch (e) {
      return next(e);
    }
  },

  setModeration: async (req, res, next) => {
    try {
      const blockedWords = [];
      if (Array.isArray(req.body?.blockedWords)) {
        for (const word of req.body.blockedWords) {
          if (typeof word !== "string") continue;
          const cleaned = word.trim();
          if (!cleaned) continue;
          blockedWords.push(cleaned);
          if (blockedWords.length >= 200) break;
        }
      }

      await Settings.updateOne(
        { key: "moderation" },
        { $set: { data: { blockedWords } } },
        { upsert: true }
      );
      return res.json({ blockedWords });
    } catch (e) {
      return next(e);
    }
  },

  getBroadcasts: async (req, res, next) => {
    try {
      const pageSize = Math.max(
        1,
        Math.min(50, parseInt(req.query?.pageSize, 10) || 20)
      );
      const broadcastDocs = await Broadcast.find({})
        .sort({ createdAt: -1 })
        .limit(pageSize)
        .lean();
      return res.json({ broadcasts: broadcastDocs.map((doc) => formatBroadcast(doc)) });
    } catch (e) {
      return next(e);
    }
  },

  sendBroadcast: async (req, res, next) => {
    try {
      const title =
        typeof req.body?.title === "string" && req.body.title.trim()
          ? req.body.title.trim()
          : "Announcement";
      const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";

      const createdBroadcast = await Broadcast.create({
        title,
        message,
        createdByUid: String(req.user._id),
        createdByEmail: req.user.email
      });

      const userIds = await User.find({}).select({ _id: 1 }).lean();
      const notifications = userIds.map((userDoc) => ({
        toUserId: userDoc._id,
        type: "broadcast",
        text: `${title}: ${message}`,
        read: false
      }));
      if (notifications.length) {
        await Notification.insertMany(notifications, { ordered: false });
      }

      return res.status(201).json({ broadcast: formatBroadcast(createdBroadcast.toObject()) });
    } catch (e) {
      return next(e);
    }
  },

  createReport: async (req, res, next) => {
    try {
      const body = req.body || {};
      const reportedUserId = typeof body.reportedUserId === "string" ? body.reportedUserId : "";
      const reportedUserDoc =
        mongoose.isValidObjectId(reportedUserId)
          ? await User.findById(reportedUserId)
              .select({
                email: 1,
                role: 1,
                banned: 1,
                onboarded: 1,
                nickname: 1,
                username: 1,
                avatar: 1,
                avatarUrl: 1,
                createdAt: 1,
              })
              .lean()
          : null;
      const reportPayload = {
        status: "open",
        targetType: typeof body.targetType === "string" ? body.targetType : "post",
        targetId: typeof body.targetId === "string" ? body.targetId : "",
        targetPostId: typeof body.targetPostId === "string" ? body.targetPostId : null,
        targetText: typeof body.targetText === "string" ? body.targetText : "",
        reason: typeof body.reason === "string" ? body.reason : "",
        description: typeof body.description === "string" ? body.description : "",
        reporterId:
          typeof body.reporterUid === "string" ? body.reporterUid : String(req.user._id),
        reporterEmail:
          typeof body.reporterEmail === "string" ? body.reporterEmail : req.user.email || "",
        reporterNickname:
          typeof body.reporterNickname === "string"
            ? body.reporterNickname
            : req.user.nickname || "",
        reportedUserId,
        reportedUserNickname:
          typeof body.reportedUserNickname === "string" ? body.reportedUserNickname : ""
      };
      const createdReport = await Report.create(reportPayload);
      return res.status(201).json({
        report: formatReport(createdReport.toObject(), {
          reporterUser: req.user,
          reportedUser: reportedUserDoc,
        }),
      });
    } catch (e) {
      return next(e);
    }
  },

  getReports: async (req, res, next) => {
    try {
      const status = typeof req.query?.status === "string" ? req.query.status : "open";
      const pageSize = Math.max(
        1,
        Math.min(200, parseInt(req.query?.pageSize, 10) || 50)
      );
      const reportDocs = await Report.find({ status })
        .sort({ createdAt: -1 })
        .limit(pageSize)
        .lean();
      return res.json({ reports: await attachUsersToReports(reportDocs) });
    } catch (e) {
      return next(e);
    }
  },

  getReportById: async (req, res, next) => {
    try {
      const reportDoc = await Report.findById(req.params.id).lean();
      if (!reportDoc) return res.status(404).json({ message: "Report not found" });
      const [report] = await attachUsersToReports([reportDoc]);
      return res.json({ report });
    } catch (e) {
      return next(e);
    }
  },

  resolveReport: async (req, res, next) => {
    try {
      const reportId = String(req.params.id || "");
      if (!mongoose.isValidObjectId(reportId)) {
        return res.status(400).json({ message: "Invalid report id" });
      }
      const actionTaken =
        typeof req.body?.actionTaken === "string" ? req.body.actionTaken : "resolved";
      const updatedReport = await Report.findByIdAndUpdate(
        reportId,
        { $set: { status: "resolved", actionTaken, resolvedAt: new Date() } }
      ).lean();
      if (!updatedReport) return res.status(404).json({ message: "Report not found" });
      return res.json({ ok: true });
    } catch (e) {
      return next(e);
    }
  },

  markReportDeleted: async (req, res, next) => {
    try {
      const reportId = String(req.params.id || "");
      if (!mongoose.isValidObjectId(reportId)) {
        return res.status(400).json({ message: "Invalid report id" });
      }
      const actionTaken =
        typeof req.body?.actionTaken === "string" ? req.body.actionTaken : "deleted";
      const updatedReport = await Report.findByIdAndUpdate(
        reportId,
        { $set: { status: "deleted", actionTaken, resolvedAt: new Date() } }
      ).lean();
      if (!updatedReport) return res.status(404).json({ message: "Report not found" });
      return res.json({ ok: true });
    } catch (e) {
      return next(e);
    }
  },

  deletePost: async (req, res, next) => {
    try {
      const postId = String(req.params.id || "");
      await Promise.all([
        Post.deleteOne({ _id: postId }),
        PostReaction.deleteMany({ postId }),
      ]);
      return res.json({ ok: true });
    } catch (e) {
      return next(e);
    }
  },

  deleteComment: async (req, res, next) => {
    try {
      const commentId = String(req.params.id || "");
      await Promise.all([
        Comment.deleteOne({ _id: commentId }),
        CommentReaction.deleteMany({ commentId }),
      ]);
      return res.json({ ok: true });
    } catch (e) {
      return next(e);
    }
  }
};

export { adminController };
