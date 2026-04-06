import multer from "multer";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function imageFileFilter(req, file, cb) {
  if (!file?.mimetype || !file.mimetype.startsWith("image/")) {
    const err = new Error("Only image files are allowed.");
    err.status = 400;
    cb(err);
    return;
  }
  cb(null, true);
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: imageFileFilter,
});

export const uploadAvatarImage = upload.single("file");

